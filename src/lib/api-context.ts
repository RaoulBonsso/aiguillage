import { ApiKeyService } from "@/domain/apikeys";
import { InMemoryKeyStore } from "@/data/key-store-memory";

/**
 * Le câblage de l'application : une seule instance du service de clés pour tout
 * le processus, et une clé de démonstration semée au démarrage.
 *
 * La clé de démo existe pour que le portail de documentation puisse offrir un
 * bouton « Essayer » qui fonctionne sans inscription. Elle est publique par
 * construction, donc son quota est volontairement modeste.
 */

const SECRET_DEMO = process.env.AIGUILLAGE_DEMO_KEY ?? "agl_live_demo00000000000000000000000000";
const QUOTA_DEMO = Number(process.env.AIGUILLAGE_DEMO_QUOTA ?? 500);

let amorce: Promise<ApiKeyService> | null = null;

/**
 * Le service de clés, garanti amorcé.
 *
 * On renvoie une promesse plutôt que l'instance nue : la clé de démo doit
 * exister *avant* la première authentification, et mémoriser la promesse
 * d'amorçage est la seule façon de le garantir sans supposer l'ordre
 * d'exécution des microtâches.
 */
export function apiKeys(): Promise<ApiKeyService> {
  if (!amorce) {
    amorce = (async () => {
      const service = new ApiKeyService(new InMemoryKeyStore());
      await service.issue({
        name: "Bac à sable public",
        quota: QUOTA_DEMO,
        secret: SECRET_DEMO,
      });
      return service;
    })();
  }
  return amorce;
}

/** Le secret de démonstration, affiché par le portail. */
export function demoSecret(): string {
  return SECRET_DEMO;
}
