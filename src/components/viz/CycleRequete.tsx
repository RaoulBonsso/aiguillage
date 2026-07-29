"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Le trajet d'une requête, joué pas à pas.
 *
 * Un diagramme de séquence statique montre les flèches ; celui-ci montre
 * l'ordre, et surtout ce qui se passe *si ça se passe mal* à chaque étape.
 * L'échec est la moitié intéressante d'un cycle de requête, et c'est
 * généralement la moitié qu'on ne documente pas.
 */

const ACTEURS = [
  { id: "canal", nom: "Canal de vente", x: 70 },
  { id: "enveloppe", nom: "withApiKey", x: 250 },
  { id: "service", nom: "ApiKeyService", x: 440 },
  { id: "store", nom: "KeyStore", x: 620 },
  { id: "metier", nom: "Domaine", x: 770 },
] as const;

type ActeurId = (typeof ACTEURS)[number]["id"];

type Etape = {
  titre: string;
  de: ActeurId;
  vers: ActeurId;
  libelle: string;
  explication: string;
  code?: string;
  echec?: string;
};

const etapes: Etape[] = [
  {
    titre: "L'appel arrive",
    de: "canal",
    vers: "enveloppe",
    libelle: "GET /offers + X-API-Key",
    explication:
      "Toutes les opérations publiques passent par la même enveloppe. Elle est écrite une seule fois : une garantie qu'on réimplémente à chaque route est une garantie qu'on finit par oublier sur l'une d'elles.",
    code: 'export const GET = withApiKey("searchOffers", async (request) => { … });',
  },
  {
    titre: "Résolution de la clé",
    de: "enveloppe",
    vers: "service",
    libelle: "authenticate(secret)",
    explication:
      "L'enveloppe ne sait pas ce qu'est une clé valide. Elle demande au service, qui est le seul à connaître la règle.",
    echec: "Clé absente ou mal formée → 401 immédiat, sans toucher au stockage.",
  },
  {
    titre: "Recherche par préfixe",
    de: "service",
    vers: "store",
    libelle: "findByPrefix('agl_live_7f3a')",
    explication:
      "On cherche par préfixe, pas par empreinte. C'est volontaire : chercher par empreinte déplacerait la comparaison du secret dans le moteur de stockage, hors de notre contrôle.",
    code: "const candidats = await store.findByPrefix(secret.slice(0, 13));",
  },
  {
    titre: "Comparaison à temps constant",
    de: "service",
    vers: "service",
    libelle: "timingSafeEqual(empreintes)",
    explication:
      "Comparer deux empreintes avec === laisserait fuir, par le temps de réponse, le nombre de caractères devinés. Le coût d'une comparaison à temps constant est nul ; l'omission serait une faute.",
    code: "timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))",
    echec: "Aucune correspondance, ou clé révoquée → 401. La révocation prend effet à l'appel suivant.",
  },
  {
    titre: "Décompte du quota",
    de: "service",
    vers: "store",
    libelle: "consume(id) → compteur du mois",
    explication:
      "Le quota est décompté avant le métier, pas après : une requête refusée ne doit rien coûter en calcul. Le compteur est mensuel et porte le nom de sa période — le réarmement est un changement d'étiquette, pas une purge.",
    code: 'usage: { period: "2026-08", count: 1 }',
    echec: "Quota épuisé → 429, avec RateLimit-Reset qui dit dans combien de secondes réessayer.",
  },
  {
    titre: "Le métier travaille",
    de: "enveloppe",
    vers: "metier",
    libelle: "searchOffers(catalogue, critères)",
    explication:
      "Le domaine ne connaît ni HTTP ni base de données : on lui passe un catalogue et des critères, il rend une page. C'est ce qui permet de le tester sans serveur, en millisecondes.",
    code: "export function searchOffers(catalogue: Offer[], criteres: OfferCriteria): Page<Offer>",
  },
  {
    titre: "Journalisation",
    de: "enveloppe",
    vers: "service",
    libelle: "record(opération, statut réel)",
    explication:
      "Le journal est écrit après la réponse, avec le statut réellement servi. Il enregistre donc aussi les 404 et les 429 — précisément ce qu'un administrateur veut voir quand un canal se plaint.",
  },
  {
    titre: "La réponse repart",
    de: "enveloppe",
    vers: "canal",
    libelle: "200 + RateLimit-Limit / Remaining / Reset",
    explication:
      "Les en-têtes de quota sont posés sur toutes les réponses, pas seulement sur les refus. Un intégrateur doit pouvoir ralentir avant de se faire refuser, pas après.",
  },
];

const HAUTEUR_LIGNE = 42;
const MARGE_HAUT = 54;

export function CycleRequete() {
  const [index, setIndex] = useState(0);
  const [lecture, setLecture] = useState(false);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);
  const etape = etapes[index];

  const suivant = useCallback(() => {
    setIndex((courant) => (courant + 1) % etapes.length);
  }, []);

  useEffect(() => {
    if (!lecture) return;
    minuterie.current = setTimeout(() => {
      if (index === etapes.length - 1) {
        setLecture(false);
      } else {
        suivant();
      }
    }, 3200);
    return () => {
      if (minuterie.current) clearTimeout(minuterie.current);
    };
  }, [lecture, index, suivant]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="rounded-xl border border-rail-800 bg-rail-950/60 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (index === etapes.length - 1) setIndex(0);
              setLecture((etat) => !etat);
            }}
            className="rounded-md bg-signal-500 px-3 py-1.5 text-[13px] font-medium text-rail-950 transition-opacity hover:opacity-90"
          >
            {lecture ? "Pause" : index === etapes.length - 1 ? "Rejouer" : "Dérouler"}
          </button>
          <button
            onClick={() => {
              setLecture(false);
              setIndex((courant) => (courant - 1 + etapes.length) % etapes.length);
            }}
            className="rounded-md border border-rail-700 px-2.5 py-1.5 text-[13px] text-rail-300 transition-colors hover:bg-rail-850"
            aria-label="Étape précédente"
          >
            ←
          </button>
          <button
            onClick={() => {
              setLecture(false);
              suivant();
            }}
            className="rounded-md border border-rail-700 px-2.5 py-1.5 text-[13px] text-rail-300 transition-colors hover:bg-rail-850"
            aria-label="Étape suivante"
          >
            →
          </button>
          <span className="ml-auto font-mono text-[12px] text-rail-500">
            {index + 1} / {etapes.length}
          </span>
        </div>

        <svg
          viewBox={`0 0 840 ${MARGE_HAUT + etapes.length * HAUTEUR_LIGNE + 20}`}
          className="w-full"
          role="img"
          aria-label={`Diagramme de séquence, étape ${index + 1} sur ${etapes.length} : ${etape.titre}`}
        >
          {ACTEURS.map((acteur) => {
            const implique = etape.de === acteur.id || etape.vers === acteur.id;
            return (
              <g key={acteur.id}>
                <text
                  x={acteur.x}
                  y={22}
                  textAnchor="middle"
                  className={`font-mono text-[11px] transition-colors duration-300 ${
                    implique ? "fill-signal-400" : "fill-rail-500"
                  }`}
                >
                  {acteur.nom}
                </text>
                <line
                  x1={acteur.x}
                  y1={32}
                  x2={acteur.x}
                  y2={MARGE_HAUT + etapes.length * HAUTEUR_LIGNE}
                  className={`transition-all duration-300 ${
                    implique ? "stroke-signal-500/50" : "stroke-rail-800"
                  }`}
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
              </g>
            );
          })}

          {etapes.map((courante, rang) => {
            const y = MARGE_HAUT + rang * HAUTEUR_LIGNE;
            const depart = ACTEURS.find((acteur) => acteur.id === courante.de)!.x;
            const arrivee = ACTEURS.find((acteur) => acteur.id === courante.vers)!.x;
            const estActive = rang === index;
            const estPassee = rang < index;
            const opacite = estActive ? 1 : estPassee ? 0.5 : 0.16;
            const couleur = estActive ? "var(--color-signal-500)" : "var(--color-rail-400)";
            const boucle = depart === arrivee;

            return (
              <g key={courante.titre} style={{ opacity: opacite, transition: "opacity 300ms" }}>
                {boucle ? (
                  <path
                    d={`M ${depart} ${y - 8} q 46 0 46 10 q 0 10 -46 10`}
                    fill="none"
                    stroke={couleur}
                    strokeWidth={estActive ? 2 : 1.2}
                    markerEnd="url(#pointe)"
                  />
                ) : (
                  <line
                    x1={depart}
                    y1={y}
                    x2={arrivee + (arrivee > depart ? -7 : 7)}
                    y2={y}
                    stroke={couleur}
                    strokeWidth={estActive ? 2 : 1.2}
                    markerEnd="url(#pointe)"
                  />
                )}
                <text
                  x={boucle ? depart + 56 : (depart + arrivee) / 2}
                  y={y - 7}
                  textAnchor="middle"
                  className="font-mono text-[10px]"
                  fill={estActive ? "var(--color-signal-400)" : "var(--color-rail-400)"}
                >
                  {courante.libelle}
                </text>
              </g>
            );
          })}

          <defs>
            <marker id="pointe" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 z" fill="currentColor" className="text-rail-300" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-signal-500/30 bg-signal-500/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-signal-500">
            Étape {index + 1}
          </p>
          <h4 className="mt-1 text-[16px] font-medium text-rail-100">{etape.titre}</h4>
          <p className="mt-2 text-[13.5px] leading-relaxed text-rail-300">{etape.explication}</p>

          {etape.code ? (
            <pre className="bloc-code mt-3 rounded-md border border-rail-800 bg-rail-950 p-2.5 text-rail-400">
              {etape.code}
            </pre>
          ) : null}

          {etape.echec ? (
            <div className="mt-3 rounded-md border border-rouge-500/30 bg-rouge-500/5 p-2.5">
              <p className="text-[11px] uppercase tracking-wider text-rouge-500">Chemin d&apos;échec</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-rail-300">{etape.echec}</p>
            </div>
          ) : null}
        </div>

        <ol className="space-y-0.5">
          {etapes.map((courante, rang) => (
            <li key={courante.titre}>
              <button
                onClick={() => {
                  setLecture(false);
                  setIndex(rang);
                }}
                className={`flex w-full items-baseline gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  rang === index
                    ? "bg-rail-850 text-rail-100"
                    : "text-rail-400 hover:bg-rail-900 hover:text-rail-200"
                }`}
              >
                <span className="font-mono text-[11px] text-rail-600">{rang + 1}</span>
                {courante.titre}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
