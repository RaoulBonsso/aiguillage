import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * La session de la console d'administration.
 *
 * Un jeton signé plutôt qu'un identifiant de session en base : il n'y a qu'un
 * seul administrateur et aucune donnée de session à conserver, donc stocker
 * une table de sessions serait de la cérémonie sans bénéfice. En revanche le
 * jeton porte son échéance *dans* la partie signée — sinon il suffirait de la
 * rallonger pour se donner une session éternelle.
 */

export const NOM_COOKIE = "aiguillage_admin";
export const DUREE_SESSION_MS = 8 * 60 * 60 * 1000;

/**
 * Le secret de signature. En production il vient de l'environnement ; à défaut
 * on retombe sur une valeur de démonstration, assumée comme telle : cette
 * instance publie de toute façon son mot de passe d'administration sur l'écran
 * de connexion. Une instance réelle doit définir AIGUILLAGE_SESSION_SECRET.
 */
function secret(): string {
  return process.env.AIGUILLAGE_SESSION_SECRET ?? "aiguillage-demo-secret-non-confidentiel";
}

/** Le mot de passe attendu par la console. */
export function motDePasseAttendu(): string {
  return process.env.AIGUILLAGE_ADMIN_PASSWORD ?? "aiguillage";
}

/** Vrai quand l'instance tourne avec les identifiants de démonstration. */
export function modeDemo(): boolean {
  return process.env.AIGUILLAGE_ADMIN_PASSWORD === undefined;
}

function signer(charge: string): string {
  return createHmac("sha256", secret()).update(charge).digest("hex");
}

export function creerJeton(maintenant: Date = new Date()): string {
  const echeance = String(maintenant.getTime() + DUREE_SESSION_MS);
  return `${echeance}.${signer(echeance)}`;
}

export function verifierJeton(jeton: string, maintenant: Date = new Date()): boolean {
  const [echeance, signature] = jeton.split(".");
  if (!echeance || !signature || !/^\d+$/.test(echeance)) return false;

  const attendue = Buffer.from(signer(echeance), "utf8");
  const fournie = Buffer.from(signature, "utf8");
  if (attendue.length !== fournie.length || !timingSafeEqual(attendue, fournie)) return false;

  return Number(echeance) > maintenant.getTime();
}

/** Comparaison à temps constant du mot de passe saisi. */
export function motDePasseValide(saisi: string): boolean {
  const attendu = Buffer.from(motDePasseAttendu(), "utf8");
  const fourni = Buffer.from(saisi, "utf8");
  return attendu.length === fourni.length && timingSafeEqual(attendu, fourni);
}
