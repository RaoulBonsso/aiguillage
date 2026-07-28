import type { Availability, Fare, Offer, Segment, Station } from "@/domain/types";

/**
 * Le catalogue d'offres servi par l'API.
 *
 * Il est **généré**, pas figé dans un fichier : une API de distribution dont le
 * catalogue expire au bout d'une semaine n'est pas démontrable. On produit donc
 * un horaire roulant sur les trois prochaines semaines à partir d'un graphe de
 * lignes, de façon entièrement déterministe — deux exécutions donnent le même
 * catalogue, sinon les tests ne voudraient rien dire.
 *
 * Compagnies et lignes sont fictives : c'est une démonstration technique, pas
 * la reprise de l'offre d'un transporteur réel.
 */

const TIMEZONE = "Europe/Paris";

/** Nombre de jours d'horaire produits à partir d'aujourd'hui. */
const HORIZON_JOURS = 21;

export const stations: Station[] = [
  { code: "FRPAR", name: "Paris Montparnasse", city: "Paris", country: "FR" },
  { code: "FRNTE", name: "Nantes", city: "Nantes", country: "FR" },
  { code: "FRREN", name: "Rennes", city: "Rennes", country: "FR" },
  { code: "FRBOR", name: "Bordeaux Saint-Jean", city: "Bordeaux", country: "FR" },
  { code: "FRLIL", name: "Lille Flandres", city: "Lille", country: "FR" },
  { code: "FRLYO", name: "Lyon Part-Dieu", city: "Lyon", country: "FR" },
  { code: "FRMRS", name: "Marseille Saint-Charles", city: "Marseille", country: "FR" },
];

type Etape = {
  origin: string;
  destination: string;
  /** Durée du trajet en minutes. */
  minutes: number;
  /** Attente en gare avant cette étape (0 pour la première). */
  correspondance?: number;
};

type Ligne = {
  carrier: string;
  /** Base du numéro de train ; l'heure de départ le rend unique. */
  serie: number;
  /** Prix plancher du tarif `eco`, en centimes. */
  base_cents: number;
  etapes: Etape[];
  /** Heures de départ quotidiennes, en heure locale de la gare d'origine. */
  departs: string[];
};

const lignes: Ligne[] = [
  {
    carrier: "Compagnie Atlantique",
    serie: 8800,
    base_cents: 2900,
    etapes: [{ origin: "FRPAR", destination: "FRNTE", minutes: 125 }],
    departs: ["07:12", "09:40", "12:05", "16:20", "18:45"],
  },
  {
    carrier: "Compagnie Atlantique",
    serie: 8850,
    base_cents: 2900,
    etapes: [{ origin: "FRNTE", destination: "FRPAR", minutes: 125 }],
    departs: ["06:50", "10:15", "14:30", "17:55"],
  },
  {
    carrier: "Compagnie Atlantique",
    serie: 8700,
    base_cents: 2400,
    etapes: [{ origin: "FRPAR", destination: "FRREN", minutes: 87 }],
    departs: ["07:35", "11:50", "16:05"],
  },
  {
    carrier: "Compagnie Atlantique",
    serie: 8750,
    base_cents: 2400,
    etapes: [{ origin: "FRREN", destination: "FRPAR", minutes: 87 }],
    departs: ["09:05", "15:25"],
  },
  {
    carrier: "Ligne Aquitaine",
    serie: 8400,
    base_cents: 3400,
    etapes: [{ origin: "FRPAR", destination: "FRBOR", minutes: 130 }],
    departs: ["07:24", "11:10", "15:36", "19:02"],
  },
  {
    carrier: "Ligne Aquitaine",
    serie: 8450,
    base_cents: 3400,
    etapes: [{ origin: "FRBOR", destination: "FRPAR", minutes: 130 }],
    departs: ["08:05", "13:20", "18:10"],
  },
  {
    carrier: "Ligne Sud-Est",
    serie: 6600,
    base_cents: 3100,
    etapes: [{ origin: "FRPAR", destination: "FRLYO", minutes: 118 }],
    departs: ["06:58", "10:30", "14:44", "19:15"],
  },
  {
    carrier: "Ligne Sud-Est",
    serie: 6700,
    base_cents: 2200,
    etapes: [{ origin: "FRLYO", destination: "FRMRS", minutes: 105 }],
    departs: ["08:10", "12:40", "17:20"],
  },
  {
    // La seule ligne à correspondance du catalogue : elle existe pour prouver
    // que le modèle d'offre gère un trajet en plusieurs segments.
    carrier: "Rail Nord",
    serie: 7200,
    base_cents: 4600,
    etapes: [
      { origin: "FRLIL", destination: "FRPAR", minutes: 62 },
      { origin: "FRPAR", destination: "FRNTE", minutes: 125, correspondance: 35 },
    ],
    departs: ["07:00", "13:00"],
  },
];

/**
 * Hachage FNV-1a : donne un entier stable à partir d'une chaîne.
 * Sert à tirer disponibilités et prix de façon reproductible — le même
 * identifiant d'offre donnera toujours le même remplissage.
 */
function empreinte(valeur: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < valeur.length; i += 1) {
    hash ^= valeur.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Décalage horaire de Paris à cet instant, au format `+02:00`. */
function decalageParis(instant: Date): string {
  const nom = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;
  // "GMT+02:00" -> "+02:00" ; "GMT" (cas théorique) -> "+00:00"
  const decalage = nom?.replace("GMT", "") ?? "";
  return decalage === "" ? "+00:00" : decalage;
}

/** Formate un instant en date ISO 8601 exprimée en heure locale de Paris. */
function isoParis(instant: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(instant);
  return `${parts.replace(" ", "T")}${decalageParis(instant)}`;
}

/** Construit l'instant correspondant à une heure locale parisienne un jour donné. */
function instantParis(jour: string, heure: string): Date {
  // On part d'une estimation en UTC pour connaître le décalage applicable ce
  // jour-là, puis on reconstruit la date avec ce décalage. Deux passes suffisent
  // et évitent de coder en dur un +01:00/+02:00 qui casserait au changement d'heure.
  const estimation = new Date(`${jour}T${heure}:00Z`);
  return new Date(`${jour}T${heure}:00${decalageParis(estimation)}`);
}

function jourCivil(instant: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/**
 * Grille tarifaire d'une offre.
 *
 * Le prix monte aux heures de pointe et quand il reste peu de places : c'est la
 * logique de yield management, réduite à sa plus simple expression mais présente
 * — une API de distribution qui renverrait un prix fixe raconterait un mensonge
 * sur le métier.
 */
function tarifs(base_cents: number, departure: Date, remplissage: number): Fare[] {
  const heure = Number(
    new Intl.DateTimeFormat("fr-FR", { timeZone: TIMEZONE, hour: "2-digit", hour12: false }).format(
      departure,
    ),
  );
  const pointe = (heure >= 7 && heure <= 9) || (heure >= 17 && heure <= 19);
  const tension = Math.round(base_cents * 0.4 * remplissage);
  const eco = base_cents + (pointe ? Math.round(base_cents * 0.25) : 0) + tension;
  const arrondi = (montant: number) => Math.round(montant / 100) * 100;

  const grille: Fare[] = [
    {
      code: "semi_flex",
      price: { amount_cents: arrondi(eco * 1.35), currency: "EUR" },
      exchangeable: true,
      refundable: true,
      conditions:
        "Échange avec 15 € de retenue jusqu'à 30 minutes avant le départ, remboursement avec 20 € de retenue.",
    },
    {
      code: "flex",
      price: { amount_cents: arrondi(eco * 1.9), currency: "EUR" },
      exchangeable: true,
      refundable: true,
      conditions: "Échange et remboursement sans frais jusqu'à l'heure de départ.",
    },
  ];

  // Le tarif le moins cher disparaît quand le train se remplit : c'est le
  // comportement réel d'une grille ferroviaire, et c'est ce qui rend le filtre
  // `fare=eco` utile plutôt que décoratif.
  if (remplissage <= 0.7) {
    grille.unshift({
      code: "eco",
      price: { amount_cents: arrondi(eco), currency: "EUR" },
      exchangeable: false,
      refundable: false,
      conditions: "Billet non échangeable et non remboursable, valable sur ce train uniquement.",
    });
  }

  return grille;
}

/** Disponibilité tirée de l'empreinte de l'offre : stable, mais variée. */
function disponibilite(id: string): Availability {
  const tirage = empreinte(id) % 100;
  if (tirage < 6) return { status: "sold_out", seats_remaining: 0 };
  if (tirage < 24) return { status: "limited", seats_remaining: 1 + (tirage % 9) };
  return { status: "available", seats_remaining: 40 + (tirage % 220) };
}

function construireOffre(ligne: Ligne, jour: string, heure: string): Offer {
  let curseur = instantParis(jour, heure);
  const segments: Segment[] = [];

  ligne.etapes.forEach((etape, index) => {
    if (etape.correspondance) {
      curseur = new Date(curseur.getTime() + etape.correspondance * 60000);
    }
    const depart = curseur;
    const arrivee = new Date(depart.getTime() + etape.minutes * 60000);
    segments.push({
      train_number: String(ligne.serie + index * 2 + Number(heure.slice(0, 2))),
      carrier: ligne.carrier,
      origin: etape.origin,
      destination: etape.destination,
      departure: isoParis(depart),
      arrival: isoParis(arrivee),
    });
    curseur = arrivee;
  });

  const premier = segments[0];
  const dernier = segments[segments.length - 1];
  const depart = new Date(Date.parse(premier.departure));
  const arrivee = new Date(Date.parse(dernier.arrival));

  const id = [
    "off",
    jour.replaceAll("-", "_"),
    premier.origin.slice(2).toLowerCase(),
    dernier.destination.slice(2).toLowerCase(),
    heure.replace(":", ""),
  ].join("_");

  const availability = disponibilite(id);
  const remplissage = 1 - Math.min(availability.seats_remaining, 260) / 260;

  return {
    id,
    origin: premier.origin,
    destination: dernier.destination,
    departure: premier.departure,
    arrival: dernier.arrival,
    duration_minutes: Math.round((arrivee.getTime() - depart.getTime()) / 60000),
    segments,
    fares: tarifs(ligne.base_cents, depart, remplissage),
    availability,
    // Les canaux de vente s'appuient dessus pour leur cache : on date la mise à
    // jour de la veille du départ plutôt que de renvoyer « maintenant », qui
    // invaliderait tous les caches à chaque appel.
    updated_at: isoParis(new Date(depart.getTime() - 26 * 3600 * 1000)),
  };
}

function construireCatalogue(): Offer[] {
  const aujourdhui = new Date();
  const resultat: Offer[] = [];

  for (let decalage = 0; decalage < HORIZON_JOURS; decalage += 1) {
    const jour = jourCivil(new Date(aujourdhui.getTime() + decalage * 86400000));
    for (const ligne of lignes) {
      for (const heure of ligne.departs) {
        resultat.push(construireOffre(ligne, jour, heure));
      }
    }
  }

  return resultat.sort((a, b) => Date.parse(a.departure) - Date.parse(b.departure));
}

export const offers: Offer[] = construireCatalogue();

export function findStation(code: string): Station | undefined {
  return stations.find((station) => station.code === code);
}

export function findOffer(id: string): Offer | undefined {
  return offers.find((offer) => offer.id === id);
}
