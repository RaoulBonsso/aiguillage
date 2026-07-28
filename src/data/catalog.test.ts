import { describe, expect, it } from "vitest";
import { validateSchema } from "@/lib/contract";
import { stations, offers, findStation, findOffer } from "@/data/catalog";

/**
 * Le catalogue de démonstration n'a pas le droit d'être approximatif : c'est lui
 * qui est servi par l'API, donc il doit satisfaire les mêmes schémas que ceux
 * publiés aux canaux de vente. Un jeu de données qui ne passe pas le contrat
 * est un bug de production déguisé en donnée de test.
 */
describe("catalogue de démonstration", () => {
  it("expose au moins deux gares", () => {
    expect(stations.length).toBeGreaterThanOrEqual(2);
  });

  it("respecte le schéma Station de la spec pour chaque gare", () => {
    for (const station of stations) {
      const result = validateSchema("Station", station);
      expect(result.errors, `gare ${station.code}`).toEqual([]);
      expect(result.valid).toBe(true);
    }
  });

  it("respecte le schéma Offer de la spec pour chaque offre", () => {
    for (const offer of offers) {
      const result = validateSchema("Offer", offer);
      expect(result.errors, `offre ${offer.id}`).toEqual([]);
      expect(result.valid).toBe(true);
    }
  });

  it("ne référence que des gares existantes dans les offres et leurs segments", () => {
    const codes = new Set(stations.map((station) => station.code));
    for (const offer of offers) {
      expect(codes, offer.id).toContain(offer.origin);
      expect(codes, offer.id).toContain(offer.destination);
      for (const segment of offer.segments) {
        expect(codes, `${offer.id}/${segment.train_number}`).toContain(segment.origin);
        expect(codes, `${offer.id}/${segment.train_number}`).toContain(segment.destination);
      }
    }
  });

  it("fait correspondre la durée annoncée à l'écart départ/arrivée", () => {
    for (const offer of offers) {
      const minutes = Math.round(
        (Date.parse(offer.arrival) - Date.parse(offer.departure)) / 60000,
      );
      expect(offer.duration_minutes, offer.id).toBe(minutes);
    }
  });

  it("enchaîne les segments sans trou : l'arrivée d'un segment est la gare de départ du suivant", () => {
    for (const offer of offers) {
      expect(offer.segments[0].origin, offer.id).toBe(offer.origin);
      expect(offer.segments.at(-1)!.destination, offer.id).toBe(offer.destination);
      for (let i = 1; i < offer.segments.length; i += 1) {
        expect(offer.segments[i].origin, offer.id).toBe(offer.segments[i - 1].destination);
        expect(
          Date.parse(offer.segments[i].departure),
          `${offer.id} correspondance ${i}`,
        ).toBeGreaterThanOrEqual(Date.parse(offer.segments[i - 1].arrival));
      }
    }
  });

  it("marque sold_out exactement quand il ne reste aucune place", () => {
    for (const offer of offers) {
      const soldOut = offer.availability.seats_remaining === 0;
      expect(offer.availability.status === "sold_out", offer.id).toBe(soldOut);
    }
  });

  it("retrouve une gare et une offre par leur identifiant, et rien pour un inconnu", () => {
    expect(findStation(stations[0].code)).toEqual(stations[0]);
    expect(findStation("XXZZZ")).toBeUndefined();
    expect(findOffer(offers[0].id)).toEqual(offers[0]);
    expect(findOffer("off_inconnu")).toBeUndefined();
  });
});
