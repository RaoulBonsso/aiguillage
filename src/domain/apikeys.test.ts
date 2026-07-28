import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryKeyStore } from "@/data/key-store-memory";
import { ApiKeyService } from "@/domain/apikeys";

/**
 * Ce que doit garantir la gestion des clés :
 *  - le secret n'existe en clair qu'une fois, au moment de l'émission ;
 *  - une clé révoquée ne passe plus, immédiatement ;
 *  - le quota est compté par clé et se réarme au mois ;
 *  - consulter son quota ne consomme pas de quota.
 */

function serviceAvecHorloge(instant: Date) {
  let maintenant = instant;
  const service = new ApiKeyService(new InMemoryKeyStore(), () => maintenant);
  return {
    service,
    avancerAu(nouveau: Date) {
      maintenant = nouveau;
    },
  };
}

const JANVIER = new Date("2026-01-15T10:00:00Z");

describe("émission des clés d'API", () => {
  let contexte: ReturnType<typeof serviceAvecHorloge>;

  beforeEach(() => {
    contexte = serviceAvecHorloge(JANVIER);
  });

  it("émet une clé préfixée, secrète et suffisamment longue", async () => {
    const { secret, key } = await contexte.service.issue({ name: "Canal web", quota: 1000 });

    expect(secret.startsWith("agl_")).toBe(true);
    expect(secret.length).toBeGreaterThanOrEqual(32);
    expect(key.name).toBe("Canal web");
    expect(key.quota).toBe(1000);
  });

  it("ne conserve jamais le secret en clair", async () => {
    const { secret, key } = await contexte.service.issue({ name: "Canal web", quota: 10 });
    const stocke = JSON.stringify(await contexte.service.list());

    expect(stocke).not.toContain(secret);
    // Seul un préfixe non secret est conservé, pour que l'admin reconnaisse ses clés.
    expect(secret.startsWith(key.prefix)).toBe(true);
  });

  it("émet deux secrets différents pour deux clés", async () => {
    const premiere = await contexte.service.issue({ name: "A", quota: 10 });
    const seconde = await contexte.service.issue({ name: "B", quota: 10 });

    expect(premiere.secret).not.toBe(seconde.secret);
  });
});

describe("authentification", () => {
  it("reconnaît une clé émise et rejette une clé inconnue", async () => {
    const { service } = serviceAvecHorloge(JANVIER);
    const { secret, key } = await service.issue({ name: "Canal web", quota: 10 });

    expect((await service.authenticate(secret))?.id).toBe(key.id);
    expect(await service.authenticate("agl_live_inexistante")).toBeNull();
    expect(await service.authenticate("")).toBeNull();
  });

  it("rejette une clé révoquée dès la révocation", async () => {
    const { service } = serviceAvecHorloge(JANVIER);
    const { secret, key } = await service.issue({ name: "Canal web", quota: 10 });

    expect(await service.authenticate(secret)).not.toBeNull();
    await service.revoke(key.id);
    expect(await service.authenticate(secret)).toBeNull();
  });
});

describe("quota", () => {
  it("décompte les appels et refuse au-delà du quota", async () => {
    const { service } = serviceAvecHorloge(JANVIER);
    const { key } = await service.issue({ name: "Canal web", quota: 3 });

    const premier = await service.consume(key.id);
    expect(premier).toMatchObject({ allowed: true, limit: 3, remaining: 2 });

    await service.consume(key.id);
    const troisieme = await service.consume(key.id);
    expect(troisieme).toMatchObject({ allowed: true, remaining: 0 });

    const quatrieme = await service.consume(key.id);
    expect(quatrieme.allowed).toBe(false);
    expect(quatrieme.remaining).toBe(0);
    expect(quatrieme.resetSeconds).toBeGreaterThan(0);
  });

  it("compte les quotas indépendamment d'une clé à l'autre", async () => {
    const { service } = serviceAvecHorloge(JANVIER);
    const premiere = await service.issue({ name: "A", quota: 2 });
    const seconde = await service.issue({ name: "B", quota: 2 });

    await service.consume(premiere.key.id);
    await service.consume(premiere.key.id);

    expect((await service.consume(premiere.key.id)).allowed).toBe(false);
    expect((await service.consume(seconde.key.id)).allowed).toBe(true);
  });

  it("réarme le quota au passage du mois", async () => {
    const contexte = serviceAvecHorloge(new Date("2026-01-31T22:00:00Z"));
    const { key } = await contexte.service.issue({ name: "Canal web", quota: 1 });

    await contexte.service.consume(key.id);
    expect((await contexte.service.consume(key.id)).allowed).toBe(false);

    contexte.avancerAu(new Date("2026-02-01T09:00:00Z"));
    const apresReset = await contexte.service.consume(key.id);
    expect(apresReset.allowed).toBe(true);
    expect(apresReset.remaining).toBe(0);
  });

  it("annonce l'état du quota sans le consommer", async () => {
    const { service } = serviceAvecHorloge(JANVIER);
    const { key } = await service.issue({ name: "Canal web", quota: 5 });
    await service.consume(key.id);

    const avant = await service.status(key.id);
    const apres = await service.status(key.id);

    expect(avant).toMatchObject({ quota: 5, used: 1, remaining: 4 });
    expect(apres.used).toBe(1);
    expect(Date.parse(avant.reset_at)).toBeGreaterThan(JANVIER.getTime());
  });

  it("refuse de consommer sur une clé révoquée", async () => {
    const { service } = serviceAvecHorloge(JANVIER);
    const { key } = await service.issue({ name: "Canal web", quota: 5 });
    await service.revoke(key.id);

    expect((await service.consume(key.id)).allowed).toBe(false);
  });
});

describe("journal d'usage", () => {
  it("enregistre chaque appel consommé avec son opération et son statut", async () => {
    const { service } = serviceAvecHorloge(JANVIER);
    const { key } = await service.issue({ name: "Canal web", quota: 10 });

    await service.record(key.id, { operation: "searchOffers", status: 200 });
    await service.record(key.id, { operation: "getOffer", status: 404 });

    const journal = await service.recentUsage(key.id);
    expect(journal).toHaveLength(2);
    expect(journal[0]).toMatchObject({ operation: "getOffer", status: 404 });
    expect(journal[1]).toMatchObject({ operation: "searchOffers", status: 200 });
  });
});
