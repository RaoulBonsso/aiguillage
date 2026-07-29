"use client";

import { useState } from "react";

/**
 * Le contrat et ses trois consommateurs.
 *
 * L'intérêt du Spec Driven Development ne se voit pas dans le fichier de spec —
 * il se voit dans le nombre de choses qui **cassent** quand on le modifie. Ce
 * schéma rend ça cliquable : chaque branche répond à « et si ça diverge ? ».
 */

type Branche = {
  id: string;
  cible: string;
  fichier: string;
  lien: string;
  quoi: string;
  divergence: string;
  garde: string;
};

const branches: Branche[] = [
  {
    id: "tests",
    cible: "Les tests",
    fichier: "src/app/api/v1/routes.test.ts",
    lien: "valide chaque réponse",
    quoi: "Ajv compile les schémas de la spec et valide le corps réel de chaque réponse servie, pour chaque couple (chemin, méthode, statut).",
    divergence:
      "Un champ ajouté sans être documenté, ou un champ retiré sans mise à jour de la spec.",
    garde:
      "La suite tombe. additionalProperties: false rend l'ajout silencieux impossible, et les champs requis rendent le retrait impossible.",
  },
  {
    id: "portail",
    cible: "Le portail",
    fichier: "src/app/docs/page.tsx",
    lien: "affiche le contrat",
    quoi: "Thèmes, opérations, paramètres, contraintes, schémas de réponse et exemples sont lus dans la spec. La page ne contient aucune phrase écrite à la main.",
    divergence: "Impossible par construction : il n'y a pas de second texte à maintenir.",
    garde:
      "Ajouter une opération à la spec la fait apparaître dans le portail, avec sa console d'essai, sans toucher au code de la page.",
  },
  {
    id: "clients",
    cible: "Les intégrateurs",
    fichier: "/api/openapi",
    lien: "génèrent leur client",
    quoi: "Le contrat brut est téléchargeable. Un canal de vente génère son client typé, ou branche ses propres tests de contrat côté consommateur.",
    divergence:
      "Le classique : l'API évolue, le client d'en face casse en production, sans prévenir.",
    garde:
      "Le contrat est versionné dans le dépôt et servi tel quel. Ce que le client génère est exactement ce que les tests vérifient.",
  },
];

export function SourceDeVerite() {
  const [actif, setActif] = useState<string>("tests");
  const choisi = branches.find((branche) => branche.id === actif)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-xl border border-rail-800 bg-rail-950/60 p-5">
        <svg viewBox="0 0 320 250" className="w-full" role="img" aria-label="Le contrat OpenAPI et ses trois consommateurs">
          {/* Les trois liens partent tous du contrat. */}
          {branches.map((branche, rang) => {
            const cibles = [
              { x: 55, y: 190 },
              { x: 160, y: 205 },
              { x: 265, y: 190 },
            ][rang];
            const estActif = branche.id === actif;

            return (
              <line
                key={branche.id}
                x1={160}
                y1={70}
                x2={cibles.x}
                y2={cibles.y - 18}
                stroke={estActif ? "var(--color-signal-500)" : "var(--color-rail-700)"}
                strokeWidth={estActif ? 2 : 1}
                strokeDasharray={estActif ? "0" : "4 4"}
                className="transition-all duration-300"
              />
            );
          })}

          <g>
            <rect
              x={95}
              y={26}
              width={130}
              height={44}
              rx={8}
              className="fill-signal-500/10 stroke-signal-500"
              strokeWidth={1.5}
            />
            <text x={160} y={46} textAnchor="middle" className="fill-signal-400 font-mono text-[11px]">
              openapi.yaml
            </text>
            <text x={160} y={60} textAnchor="middle" className="fill-rail-400 text-[10px]">
              source de vérité
            </text>
          </g>

          {branches.map((branche, rang) => {
            const position = [
              { x: 55, y: 190 },
              { x: 160, y: 205 },
              { x: 265, y: 190 },
            ][rang];
            const estActif = branche.id === actif;

            return (
              <g
                key={branche.id}
                onClick={() => setActif(branche.id)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={branche.cible}
                onKeyDown={(evenement) => {
                  if (evenement.key === "Enter" || evenement.key === " ") setActif(branche.id);
                }}
              >
                <rect
                  x={position.x - 48}
                  y={position.y - 18}
                  width={96}
                  height={38}
                  rx={8}
                  className={`transition-all duration-300 ${
                    estActif
                      ? "fill-rail-800 stroke-signal-500"
                      : "fill-rail-900 stroke-rail-700 hover:stroke-rail-500"
                  }`}
                  strokeWidth={1.2}
                />
                <text
                  x={position.x}
                  y={position.y + 6}
                  textAnchor="middle"
                  className={`text-[11px] ${estActif ? "fill-rail-100" : "fill-rail-400"}`}
                >
                  {branche.cible}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {branches.map((branche) => (
            <button
              key={branche.id}
              onClick={() => setActif(branche.id)}
              className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                actif === branche.id
                  ? "bg-signal-500 text-rail-950"
                  : "border border-rail-700 text-rail-400 hover:text-rail-200"
              }`}
            >
              {branche.cible}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-rail-800 bg-rail-900/40 p-5">
        <p className="font-mono text-[11px] text-rail-500">
          openapi.yaml → <span className="text-signal-400">{choisi.lien}</span> → {choisi.cible}
        </p>
        <code className="mt-2 block font-mono text-[12px] text-rail-400">{choisi.fichier}</code>

        <p className="mt-4 text-[14px] leading-relaxed text-rail-300">{choisi.quoi}</p>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-rouge-500/25 bg-rouge-500/5 p-3">
            <p className="text-[11px] uppercase tracking-wider text-rouge-500">Le risque de dérive</p>
            <p className="mt-1 text-[13px] leading-relaxed text-rail-300">{choisi.divergence}</p>
          </div>
          <div className="rounded-lg border border-vert-500/25 bg-vert-500/5 p-3">
            <p className="text-[11px] uppercase tracking-wider text-vert-500">Ce qui l&apos;empêche</p>
            <p className="mt-1 text-[13px] leading-relaxed text-rail-300">{choisi.garde}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
