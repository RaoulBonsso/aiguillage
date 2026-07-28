import type { FareCode, Offer, Page, Station } from "@/domain/types";

/**
 * La logique de recherche, pure et indépendante d'HTTP.
 *
 * Elle ne connaît ni `Request`, ni `Response`, ni base de données : on lui passe
 * un catalogue et des critères, elle rend une page. C'est ce qui permet de la
 * tester sans serveur, et de changer de stockage sans la réécrire.
 */

export type OfferCriteria = {
  origin: string;
  destination: string;
  date: string;
  passengers?: number;
  fare?: FareCode;
  page: number;
  limit: number;
};

export type StationCriteria = {
  q?: string;
  page: number;
  limit: number;
};

/** Le jour civil parisien d'un départ. Les dates du catalogue portent leur décalage. */
function jourCivil(iso: string): string {
  return iso.slice(0, 10);
}

/** Minuscule sans accents ni signes : « Saint-Charles » et « saint charles » se valent. */
function normaliser(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Adapte la disponibilité affichée à la taille du groupe.
 *
 * Un train où il reste deux places est « disponible » pour un voyageur seul et
 * « complet » pour une famille de quatre. La donnée du catalogue n'est jamais
 * modifiée : on renvoie une vue de l'offre, propre à la demande.
 */
export function pourVoyageurs(offre: Offer, passengers: number): Offer {
  const restantes = offre.availability.seats_remaining;
  const seuilTension = Math.max(10, passengers * 3);
  const status =
    restantes < passengers ? "sold_out" : restantes < seuilTension ? "limited" : "available";

  if (status === offre.availability.status) return offre;
  return { ...offre, availability: { ...offre.availability, status } };
}

function paginer<T>(elements: T[], page: number, limit: number): Page<T> {
  const debut = (page - 1) * limit;
  return {
    data: elements.slice(debut, debut + limit),
    meta: {
      page,
      limit,
      total: elements.length,
      total_pages: elements.length === 0 ? 0 : Math.ceil(elements.length / limit),
    },
  };
}

export function searchOffers(catalogue: Offer[], criteres: OfferCriteria): Page<Offer> {
  const passengers = criteres.passengers ?? 1;

  const retenues = catalogue
    .filter(
      (offre) =>
        offre.origin === criteres.origin &&
        offre.destination === criteres.destination &&
        jourCivil(offre.departure) === criteres.date &&
        (criteres.fare === undefined ||
          offre.fares.some((tarif) => tarif.code === criteres.fare)),
    )
    // Les trains complets restent dans les résultats : c'est au canal de vente
    // de décider comment les présenter, pas à l'API de les cacher.
    .map((offre) => pourVoyageurs(offre, passengers))
    .sort((a, b) => Date.parse(a.departure) - Date.parse(b.departure));

  return paginer(retenues, criteres.page, criteres.limit);
}

export function listStations(referentiel: Station[], criteres: StationCriteria): Page<Station> {
  const recherche = criteres.q ? normaliser(criteres.q) : undefined;

  const retenues = referentiel
    .filter(
      (gare) =>
        recherche === undefined ||
        normaliser(gare.name).includes(recherche) ||
        normaliser(gare.city).includes(recherche),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return paginer(retenues, criteres.page, criteres.limit);
}
