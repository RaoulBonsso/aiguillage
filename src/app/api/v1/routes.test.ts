import { beforeAll, describe, expect, it } from "vitest";
import { validateResponse } from "@/lib/contract";
import { apiKeys, demoSecret } from "@/lib/api-context";
import { offers } from "@/data/catalog";
import { GET as getStations } from "@/app/api/v1/stations/route";
import { GET as getOffers } from "@/app/api/v1/offers/route";
import { GET as getOffer } from "@/app/api/v1/offers/[offerId]/route";
import { GET as getMe } from "@/app/api/v1/me/route";

/**
 * Les tests de contrat : chaque réponse servie est validée contre le schéma
 * publié dans `spec/openapi.yaml`. Si l'implémentation ajoute un champ, en
 * retire un, ou change un type, ces tests tombent. C'est ce qui empêche la
 * documentation de devenir un mensonge poli.
 */

const BASE = "https://aiguillage.test/api/v1";

function requete(chemin: string, entetes: Record<string, string> = {}): Request {
  return new Request(`${BASE}${chemin}`, { headers: entetes });
}

function authentifiee(chemin: string, secret = demoSecret()): Request {
  return requete(chemin, { "X-API-Key": secret });
}

/** Une offre réelle du catalogue, pour construire des recherches qui aboutissent. */
const echantillon = offers[0];
const jour = echantillon.departure.slice(0, 10);

async function corps(reponse: Response): Promise<unknown> {
  return reponse.json();
}

describe("GET /stations", () => {
  it("refuse l'accès sans clé, au format problem+json de la spec", async () => {
    const reponse = await getStations(requete("/stations"));
    const body = await corps(reponse);

    expect(reponse.status).toBe(401);
    expect(reponse.headers.get("content-type")).toContain("application/problem+json");
    expect(validateResponse("/stations", "get", 401, body).errors).toEqual([]);
  });

  it("refuse une clé inconnue", async () => {
    const reponse = await getStations(requete("/stations", { "X-API-Key": "agl_live_inconnue" }));

    expect(reponse.status).toBe(401);
  });

  it("sert le référentiel et respecte le schéma de réponse", async () => {
    const reponse = await getStations(authentifiee("/stations"));
    const body = (await corps(reponse)) as { data: unknown[]; meta: unknown };

    expect(reponse.status).toBe(200);
    expect(validateResponse("/stations", "get", 200, body).errors).toEqual([]);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("pose les en-têtes de quota sur une réponse servie", async () => {
    const reponse = await getStations(authentifiee("/stations"));

    expect(Number(reponse.headers.get("RateLimit-Limit"))).toBeGreaterThan(0);
    expect(Number(reponse.headers.get("RateLimit-Remaining"))).toBeGreaterThanOrEqual(0);
    expect(Number(reponse.headers.get("RateLimit-Reset"))).toBeGreaterThan(0);
  });

  it("filtre sur le paramètre q", async () => {
    const reponse = await getStations(authentifiee("/stations?q=nantes"));
    const body = (await corps(reponse)) as { data: Array<{ code: string }> };

    expect(body.data.map((gare) => gare.code)).toEqual(["FRNTE"]);
  });

  it("rejette un paramètre hors bornes avec le détail du champ fautif", async () => {
    const reponse = await getStations(authentifiee("/stations?limit=5000"));
    const body = (await corps(reponse)) as { errors?: Array<{ field: string }> };

    expect(reponse.status).toBe(400);
    expect(validateResponse("/stations", "get", 400, body).errors).toEqual([]);
    expect(body.errors?.map((erreur) => erreur.field)).toContain("limit");
  });
});

describe("GET /offers", () => {
  it("exige origin, destination et date", async () => {
    const reponse = await getOffers(authentifiee("/offers"));
    const body = (await corps(reponse)) as { errors?: Array<{ field: string }> };

    expect(reponse.status).toBe(400);
    expect(validateResponse("/offers", "get", 400, body).errors).toEqual([]);
    const champs = body.errors?.map((erreur) => erreur.field) ?? [];
    expect(champs).toEqual(expect.arrayContaining(["origin", "destination", "date"]));
  });

  it("rejette une date mal formée", async () => {
    const reponse = await getOffers(
      authentifiee("/offers?origin=FRPAR&destination=FRNTE&date=04-08-2026"),
    );
    const body = (await corps(reponse)) as { errors?: Array<{ field: string }> };

    expect(reponse.status).toBe(400);
    expect(body.errors?.map((erreur) => erreur.field)).toContain("date");
  });

  it("rejette un code gare qui n'a pas la forme attendue", async () => {
    const reponse = await getOffers(
      authentifiee(`/offers?origin=paris&destination=FRNTE&date=${jour}`),
    );

    expect(reponse.status).toBe(400);
  });

  it("sert des offres conformes au schéma publié", async () => {
    const reponse = await getOffers(
      authentifiee(
        `/offers?origin=${echantillon.origin}&destination=${echantillon.destination}&date=${jour}`,
      ),
    );
    const body = (await corps(reponse)) as { data: unknown[] };

    expect(reponse.status).toBe(200);
    expect(validateResponse("/offers", "get", 200, body).errors).toEqual([]);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("renvoie 200 avec une liste vide quand aucun train ne circule", async () => {
    const reponse = await getOffers(
      authentifiee("/offers?origin=FRPAR&destination=FRNTE&date=1999-01-01"),
    );
    const body = (await corps(reponse)) as { data: unknown[]; meta: { total: number } };

    expect(reponse.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });
});

describe("GET /offers/{offerId}", () => {
  it("sert le détail d'une offre existante", async () => {
    const reponse = await getOffer(authentifiee(`/offers/${echantillon.id}`), {
      params: Promise.resolve({ offerId: echantillon.id }),
    });
    const body = (await corps(reponse)) as { data: { id: string } };

    expect(reponse.status).toBe(200);
    expect(validateResponse("/offers/{offerId}", "get", 200, body).errors).toEqual([]);
    expect(body.data.id).toBe(echantillon.id);
  });

  it("renvoie 404 au format problem+json pour une offre inconnue", async () => {
    const reponse = await getOffer(authentifiee("/offers/off_inexistante"), {
      params: Promise.resolve({ offerId: "off_inexistante" }),
    });
    const body = await corps(reponse);

    expect(reponse.status).toBe(404);
    expect(validateResponse("/offers/{offerId}", "get", 404, body).errors).toEqual([]);
  });
});

describe("GET /me", () => {
  it("décrit la clé appelante sans consommer son quota", async () => {
    const { secret } = await (await apiKeys()).issue({ name: "Sonde", quota: 50 });

    const premier = await getMe(requete("/me", { "X-API-Key": secret }));
    const avant = (await corps(premier)) as { data: { used: number } };
    const second = await getMe(requete("/me", { "X-API-Key": secret }));
    const apres = (await corps(second)) as { data: { used: number } };

    expect(premier.status).toBe(200);
    expect(validateResponse("/me", "get", 200, avant).errors).toEqual([]);
    expect(avant.data.used).toBe(0);
    expect(apres.data.used).toBe(0);
  });
});

describe("quota", () => {
  it("refuse l'appel au-delà du quota avec un 429 conforme", async () => {
    const { secret } = await (await apiKeys()).issue({ name: "Quota minuscule", quota: 1 });

    const premier = await getStations(requete("/stations", { "X-API-Key": secret }));
    expect(premier.status).toBe(200);

    const second = await getStations(requete("/stations", { "X-API-Key": secret }));
    const body = await corps(second);

    expect(second.status).toBe(429);
    expect(second.headers.get("RateLimit-Remaining")).toBe("0");
    expect(Number(second.headers.get("RateLimit-Reset"))).toBeGreaterThan(0);
    expect(validateResponse("/stations", "get", 429, body).errors).toEqual([]);
  });

  it("bloque une clé révoquée en cours de route", async () => {
    const { secret, key } = await (await apiKeys()).issue({ name: "À révoquer", quota: 10 });
    expect((await getStations(requete("/stations", { "X-API-Key": secret }))).status).toBe(200);

    await (await apiKeys()).revoke(key.id);

    expect((await getStations(requete("/stations", { "X-API-Key": secret }))).status).toBe(401);
  });
});

describe("journal d'usage", () => {
  beforeAll(async () => {
    await getStations(authentifiee("/stations"));
  });

  it("garde une trace des appels servis, avec opération et statut", async () => {
    const journal = await (await apiKeys()).recentUsage();

    expect(journal.length).toBeGreaterThan(0);
    expect(journal[0]).toHaveProperty("operation");
    expect(journal[0]).toHaveProperty("status");
  });
});
