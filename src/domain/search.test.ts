import { describe, expect, it } from "vitest";
import { searchOffers, listStations } from "@/domain/search";
import { offers, stations } from "@/data/catalog";

/** Le jour civil parisien d'une offre — la recherche raisonne en jours, pas en instants. */
function jour(iso: string): string {
  return iso.slice(0, 10);
}

const premiere = offers[0];
const criteresDeBase = {
  origin: premiere.origin,
  destination: premiere.destination,
  date: jour(premiere.departure),
  passengers: 1,
  page: 1,
  limit: 20,
} as const;

describe("recherche d'offres", () => {
  it("ne retient que le couple origine/destination et le jour demandés", () => {
    const page = searchOffers(offers, criteresDeBase);

    expect(page.data.length).toBeGreaterThan(0);
    for (const offre of page.data) {
      expect(offre.origin).toBe(criteresDeBase.origin);
      expect(offre.destination).toBe(criteresDeBase.destination);
      expect(jour(offre.departure)).toBe(criteresDeBase.date);
    }
  });

  it("trie les offres par heure de départ croissante", () => {
    const page = searchOffers(offers, criteresDeBase);
    const departs = page.data.map((offre) => Date.parse(offre.departure));

    expect(departs).toEqual([...departs].sort((a, b) => a - b));
  });

  it("renvoie une page vide plutôt qu'une erreur quand aucun train ne circule", () => {
    const page = searchOffers(offers, { ...criteresDeBase, date: "1999-01-01" });

    expect(page.data).toEqual([]);
    expect(page.meta).toEqual({ page: 1, limit: 20, total: 0, total_pages: 0 });
  });

  it("garde les offres complètes dans les résultats, marquées sold_out", () => {
    // Un canal de vente doit pouvoir afficher un train complet en grisé.
    // Le faire disparaître donnerait au voyageur l'impression qu'il n'existe pas.
    const complets = offers.filter((offre) => offre.availability.status === "sold_out");
    expect(complets.length).toBeGreaterThan(0);

    const cible = complets[0];
    const page = searchOffers(offers, {
      ...criteresDeBase,
      origin: cible.origin,
      destination: cible.destination,
      date: jour(cible.departure),
      limit: 100,
    });

    expect(page.data.map((offre) => offre.id)).toContain(cible.id);
  });

  it("déclasse la disponibilité quand le groupe est plus grand que les places restantes", () => {
    const cible = offers.find(
      (offre) => offre.availability.seats_remaining > 0 && offre.availability.seats_remaining < 9,
    );
    expect(cible, "le catalogue doit contenir une offre à faible disponibilité").toBeDefined();

    const page = searchOffers(offers, {
      ...criteresDeBase,
      origin: cible!.origin,
      destination: cible!.destination,
      date: jour(cible!.departure),
      passengers: 9,
      limit: 100,
    });

    const trouvee = page.data.find((offre) => offre.id === cible!.id);
    expect(trouvee?.availability.status).toBe("sold_out");
    // La donnée brute n'est pas altérée : c'est la réponse qui est adaptée à la demande.
    expect(cible!.availability.status).not.toBe("sold_out");
  });

  it("ne garde que les offres proposant le tarif demandé", () => {
    const sansEco = offers.find((offre) => !offre.fares.some((tarif) => tarif.code === "eco"));
    expect(sansEco, "le yield management doit retirer l'eco des trains tendus").toBeDefined();

    const page = searchOffers(offers, {
      ...criteresDeBase,
      origin: sansEco!.origin,
      destination: sansEco!.destination,
      date: jour(sansEco!.departure),
      fare: "eco",
      limit: 100,
    });

    expect(page.data.map((offre) => offre.id)).not.toContain(sansEco!.id);
    for (const offre of page.data) {
      expect(offre.fares.some((tarif) => tarif.code === "eco")).toBe(true);
    }
  });

  it("pagine sans perdre ni dupliquer d'offre", () => {
    const critères = { ...criteresDeBase, limit: 2 };
    const complet = searchOffers(offers, { ...critères, limit: 100 });
    expect(complet.meta.total).toBeGreaterThan(2);

    const collectees: string[] = [];
    for (let page = 1; page <= Math.ceil(complet.meta.total / 2); page += 1) {
      collectees.push(...searchOffers(offers, { ...critères, page }).data.map((o) => o.id));
    }

    expect(collectees).toEqual(complet.data.map((offre) => offre.id));
    expect(new Set(collectees).size).toBe(collectees.length);
  });

  it("renseigne une méta de pagination cohérente", () => {
    const page = searchOffers(offers, { ...criteresDeBase, limit: 2, page: 2 });

    expect(page.meta.page).toBe(2);
    expect(page.meta.limit).toBe(2);
    expect(page.meta.total_pages).toBe(Math.ceil(page.meta.total / 2));
    expect(page.data.length).toBeLessThanOrEqual(2);
  });

  it("renvoie une page vide au-delà de la dernière page, sans se plaindre", () => {
    const page = searchOffers(offers, { ...criteresDeBase, page: 999 });

    expect(page.data).toEqual([]);
    expect(page.meta.page).toBe(999);
  });
});

describe("référentiel des gares", () => {
  it("renvoie toutes les gares sans filtre", () => {
    const page = listStations(stations, { page: 1, limit: 100 });

    expect(page.meta.total).toBe(stations.length);
  });

  it("filtre sur le nom ou la ville, sans tenir compte de la casse ni des accents", () => {
    const parNom = listStations(stations, { q: "montparnasse", page: 1, limit: 20 });
    expect(parNom.data.map((gare) => gare.code)).toEqual(["FRPAR"]);

    const parVille = listStations(stations, { q: "NANTES", page: 1, limit: 20 });
    expect(parVille.data.map((gare) => gare.code)).toEqual(["FRNTE"]);

    const accentue = listStations(stations, { q: "marseille saint-charles", page: 1, limit: 20 });
    expect(accentue.data.map((gare) => gare.code)).toEqual(["FRMRS"]);
  });

  it("trie les gares par nom pour une autocomplétion stable", () => {
    const noms = listStations(stations, { page: 1, limit: 100 }).data.map((gare) => gare.name);

    expect(noms).toEqual([...noms].sort((a, b) => a.localeCompare(b, "fr")));
  });
});
