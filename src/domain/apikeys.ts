import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { ApiKeyRecord, ApiKeyView, Clock, KeyStore, UsageEntry } from "@/domain/ports";

/**
 * L'émission, la vérification et le quota des clés d'API.
 *
 * Deux principes tiennent tout le fichier :
 *  1. Le secret n'existe en clair qu'une seule fois — à l'émission, dans la
 *     réponse à l'administrateur. Ensuite, on ne manipule que son empreinte.
 *  2. Le quota se compte par période civile. On ne stocke pas une file de
 *     timestamps : un compteur et le nom de la période suffisent, et le
 *     réarmement est alors un simple changement d'étiquette.
 */

const PREFIXE = "agl_live_";
const LONGUEUR_SECRET_OCTETS = 16; // 32 caractères hexadécimaux

export type QuotaDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Secondes avant réarmement du quota — la valeur de l'en-tête `RateLimit-Reset`. */
  resetSeconds: number;
};

export type QuotaStatus = {
  name: string;
  prefix: string;
  quota: number;
  used: number;
  remaining: number;
  reset_at: string;
};

/** L'empreinte d'un secret. SHA-256 suffit : une clé aléatoire de 128 bits ne se force pas. */
export function empreinteSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

/** La période de quota d'un instant : le mois civil, en UTC. */
function periode(instant: Date): string {
  return instant.toISOString().slice(0, 7);
}

/** Le premier instant de la période suivante — quand le compteur repart à zéro. */
function finDePeriode(instant: Date): Date {
  return new Date(Date.UTC(instant.getUTCFullYear(), instant.getUTCMonth() + 1, 1));
}

/**
 * Comparaison à durée constante de deux empreintes.
 * Comparer avec `===` laisserait fuir, par le temps de réponse, le nombre de
 * caractères devinés. Le coût est nul, l'omission serait une faute.
 */
function memeEmpreinte(a: string, b: string): boolean {
  const gauche = Buffer.from(a, "hex");
  const droite = Buffer.from(b, "hex");
  return gauche.length === droite.length && timingSafeEqual(gauche, droite);
}

export class ApiKeyService {
  constructor(
    private readonly store: KeyStore,
    private readonly now: Clock = () => new Date(),
  ) {}

  /**
   * Émet une clé. Le secret retourné ici ne pourra plus jamais être relu.
   *
   * `secret` n'est fourni que pour semer la clé de démonstration au démarrage :
   * un bac à sable public a besoin d'une clé connue. Toute autre clé tire son
   * secret du générateur cryptographique.
   */
  async issue({
    name,
    quota,
    secret: impose,
  }: {
    name: string;
    quota: number;
    secret?: string;
  }): Promise<{ secret: string; key: ApiKeyView }> {
    const secret = impose ?? PREFIXE + randomBytes(LONGUEUR_SECRET_OCTETS).toString("hex");
    const instant = this.now();
    const record: ApiKeyRecord = {
      id: randomUUID(),
      name,
      prefix: secret.slice(0, PREFIXE.length + 4),
      hash: empreinteSecret(secret),
      quota,
      created_at: instant.toISOString(),
      revoked_at: null,
      usage: { period: periode(instant), count: 0 },
    };

    await this.store.create(record);
    return { secret, key: publier(record) };
  }

  /** Résout un secret en clé active, ou `null` — jamais d'exception : c'est une entrée utilisateur. */
  async authenticate(secret: string): Promise<ApiKeyView | null> {
    if (!secret || !secret.startsWith(PREFIXE)) return null;

    const empreinte = empreinteSecret(secret);
    const candidats = await this.store.findByPrefix(secret.slice(0, PREFIXE.length + 4));
    const trouvee = candidats.find((candidat) => memeEmpreinte(candidat.hash, empreinte));

    if (!trouvee || trouvee.revoked_at) return null;
    return publier(trouvee);
  }

  async revoke(id: string): Promise<void> {
    const record = await this.store.findById(id);
    if (!record || record.revoked_at) return;
    await this.store.update({ ...record, revoked_at: this.now().toISOString() });
  }

  async list(): Promise<ApiKeyView[]> {
    return (await this.store.all()).map(publier);
  }

  /**
   * Décompte un appel. Renvoie la décision *et* les compteurs, parce que
   * l'appelant doit poser les en-têtes `RateLimit-*` sur toute réponse, pas
   * seulement sur les refus.
   */
  async consume(id: string): Promise<QuotaDecision> {
    const instant = this.now();
    const record = await this.store.findById(id);
    if (!record || record.revoked_at) {
      return { allowed: false, limit: 0, remaining: 0, resetSeconds: 0 };
    }

    const courant = fenetreCourante(record, instant);
    const reste = record.quota - courant;

    if (reste <= 0) {
      return {
        allowed: false,
        limit: record.quota,
        remaining: 0,
        resetSeconds: secondesAvant(finDePeriode(instant), instant),
      };
    }

    await this.store.update({
      ...record,
      usage: { period: periode(instant), count: courant + 1 },
    });

    return {
      allowed: true,
      limit: record.quota,
      remaining: reste - 1,
      resetSeconds: secondesAvant(finDePeriode(instant), instant),
    };
  }

  /** L'état du quota, sans le consommer : superviser son usage ne doit pas coûter d'usage. */
  async status(id: string): Promise<QuotaStatus> {
    const instant = this.now();
    const record = await this.store.findById(id);
    if (!record) {
      throw new Error(`Clé inconnue : ${id}`);
    }

    const used = fenetreCourante(record, instant);
    return {
      name: record.name,
      prefix: record.prefix,
      quota: record.quota,
      used,
      remaining: Math.max(0, record.quota - used),
      reset_at: finDePeriode(instant).toISOString(),
    };
  }

  async record(id: string, appel: { operation: string; status: number }): Promise<void> {
    await this.store.appendUsage({
      key_id: id,
      operation: appel.operation,
      status: appel.status,
      at: this.now().toISOString(),
    });
  }

  async recentUsage(id?: string, limit?: number): Promise<UsageEntry[]> {
    return this.store.recentUsage(id, limit);
  }
}

/** Le compteur de la période en cours : zéro si la dernière consommation date d'un mois révolu. */
function fenetreCourante(record: ApiKeyRecord, instant: Date): number {
  return record.usage.period === periode(instant) ? record.usage.count : 0;
}

function secondesAvant(echeance: Date, instant: Date): number {
  return Math.max(1, Math.ceil((echeance.getTime() - instant.getTime()) / 1000));
}

function publier(record: ApiKeyRecord): ApiKeyView {
  // Liste blanche plutôt que retrait de l'empreinte : un champ ajouté plus tard
  // au stockage ne fuit pas vers les réponses sans qu'on l'ait décidé.
  return {
    id: record.id,
    name: record.name,
    prefix: record.prefix,
    quota: record.quota,
    created_at: record.created_at,
    revoked_at: record.revoked_at,
    usage: record.usage,
  };
}
