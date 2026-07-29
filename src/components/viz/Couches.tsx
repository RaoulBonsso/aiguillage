"use client";

import { useState } from "react";

/**
 * Les trois couches, et surtout ce que chacune **ignore**.
 *
 * On décrit toujours une architecture par ce que les couches savent faire. La
 * question utile est l'inverse : qu'est-ce que cette couche ne sait pas ? C'est
 * l'ignorance qui rend un module testable et remplaçable.
 */

type Couche = {
  id: string;
  nom: string;
  sous_titre: string;
  fichiers: string[];
  sait: string[];
  ignore: string[];
  consequence: string;
};

const couches: Couche[] = [
  {
    id: "frontiere",
    nom: "Frontière HTTP",
    sous_titre: "src/app",
    fichiers: [
      "api/v1/offers/route.ts",
      "api/v1/stations/route.ts",
      "api/v1/offers/[offerId]/route.ts",
      "api/v1/me/route.ts",
      "admin/actions.ts",
    ],
    sait: [
      "Lire des en-têtes et des paramètres d'URL",
      "Traduire une erreur métier en statut HTTP",
      "Poser les en-têtes RateLimit-*",
    ],
    ignore: [
      "Comment on filtre une offre",
      "Comment on compte un quota",
      "Où sont rangées les clés",
    ],
    consequence:
      "Chaque handler tient en dix lignes : valider, appeler, répondre. Un handler long est le signe qu'une règle métier a fui hors du domaine.",
  },
  {
    id: "domaine",
    nom: "Domaine",
    sous_titre: "src/domain",
    fichiers: ["search.ts", "apikeys.ts", "types.ts", "ports.ts"],
    sait: [
      "Filtrer, trier, paginer des offres",
      "Émettre, révoquer, décompter une clé",
      "Ce qu'est une période de quota",
    ],
    ignore: [
      "Qu'il existe un protocole HTTP",
      "Qu'il existe une base de données",
      "Qu'il existe un framework",
    ],
    consequence:
      "La suite de tests du domaine tourne en quelques millisecondes, sans serveur ni base. C'est ce qui permet de la lancer en permanence plutôt qu'avant de pousser.",
  },
  {
    id: "adaptateurs",
    nom: "Adaptateurs",
    sous_titre: "src/data",
    fichiers: ["catalog.ts", "key-store-memory.ts"],
    sait: [
      "Ranger et retrouver un enregistrement",
      "Produire l'horaire à partir d'un graphe de lignes",
    ],
    ignore: [
      "Ce qu'est un quota mensuel",
      "Ce qu'est une clé révoquée",
      "Pourquoi on lui demande ces données",
    ],
    consequence:
      "Remplacer le stockage en mémoire par Firestore ou Postgres, c'est écrire une classe qui satisfait sept méthodes. Aucune règle métier n'est touchée.",
  },
];

export function Couches() {
  const [ouverte, setOuverte] = useState<string>("domaine");

  return (
    <div className="space-y-3">
      {couches.map((couche) => {
        const active = ouverte === couche.id;

        return (
          <div
            key={couche.id}
            className={`overflow-hidden rounded-xl border transition-colors duration-200 ${
              active ? "border-signal-500/50 bg-rail-900/60" : "border-rail-800 bg-rail-900/30"
            }`}
          >
            <button
              onClick={() => setOuverte(active ? "" : couche.id)}
              aria-expanded={active}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <span
                className={`h-8 w-1 shrink-0 rounded-full transition-colors ${
                  active ? "bg-signal-500" : "bg-rail-700"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-rail-100">{couche.nom}</span>
                <span className="mt-0.5 block font-mono text-[12px] text-rail-500">
                  {couche.sous_titre}
                </span>
              </span>
              <span className="hidden shrink-0 font-mono text-[11px] text-rail-600 sm:block">
                {couche.fichiers.length} fichiers
              </span>
              <span
                aria-hidden
                className={`shrink-0 text-rail-500 transition-transform duration-200 ${
                  active ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {active ? (
              <div className="space-y-4 border-t border-rail-800 px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-[11px] uppercase tracking-wider text-vert-500">
                      Ce qu&apos;elle sait
                    </p>
                    <ul className="space-y-1">
                      {couche.sait.map((element) => (
                        <li key={element} className="text-[13px] leading-snug text-rail-300">
                          {element}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[11px] uppercase tracking-wider text-signal-500">
                      Ce qu&apos;elle ignore
                    </p>
                    <ul className="space-y-1">
                      {couche.ignore.map((element) => (
                        <li key={element} className="text-[13px] leading-snug text-rail-400">
                          {element}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {couche.fichiers.map((fichier) => (
                    <code
                      key={fichier}
                      className="rounded border border-rail-800 bg-rail-950 px-2 py-0.5 font-mono text-[11px] text-rail-400"
                    >
                      {fichier}
                    </code>
                  ))}
                </div>

                <p className="border-l-2 border-rail-700 pl-3 text-[13px] leading-relaxed text-rail-300">
                  {couche.consequence}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
