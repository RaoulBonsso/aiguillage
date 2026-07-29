"use client";

import { useState } from "react";

/**
 * La chaîne de distribution, explorable.
 *
 * Un schéma figé se regarde ; celui-ci se parcourt. Chaque maillon répond à
 * trois questions — qui, quoi, et ce qui casse si le maillon lâche — parce que
 * c'est la troisième qui fait comprendre pourquoi le métier existe.
 */

type Maillon = {
  id: string;
  titre: string;
  acteur: string;
  role: string;
  casse: string;
  perimetre?: boolean;
};

const maillons: Maillon[] = [
  {
    id: "brut",
    titre: "Données brutes",
    acteur: "Systèmes du transporteur",
    role: "Horaires théoriques, grilles tarifaires, conditions d'échange et de remboursement. Des données exactes, mais illisibles pour qui n'est pas du métier.",
    casse: "Sans elles, rien à vendre. Mais telles quelles, personne ne peut les afficher à un voyageur.",
  },
  {
    id: "edition",
    titre: "Édition de l'offre",
    acteur: "BU Éditeur",
    role: "Transforme la donnée brute en produits vendables : ce train, à ce prix, avec ces conditions, disponible pour ce profil de voyageur.",
    casse: "Sans édition, chaque canal de vente réinvente les règles commerciales — et les applique différemment.",
  },
  {
    id: "aiguillage",
    titre: "API · Portail · Console",
    acteur: "Aiguillage",
    role: "Expose l'offre éditée sous forme d'API consommable, documente son usage, et pilote qui y accède avec quel quota.",
    casse: "Sans cette couche, l'offre existe mais reste inaccessible : un export CSV par e-mail, et autant d'intégrations bricolées que de partenaires.",
    perimetre: true,
  },
  {
    id: "canaux",
    titre: "Canaux de vente",
    acteur: "Sites, applis, agences, revendeurs",
    role: "Consomment l'API pour afficher des trajets, comparer des prix et vendre. Ce sont eux, les clients de l'API.",
    casse: "Un canal qui ne peut pas intégrer l'API ne vend pas. Une doc médiocre coûte donc directement du chiffre d'affaires.",
  },
  {
    id: "voyageur",
    titre: "Voyageur",
    acteur: "Le client final",
    role: "Cherche un trajet, compare, achète. Il ne verra jamais l'API — mais il subit chacune de ses lenteurs et de ses incohérences.",
    casse: "Un prix qui change entre la recherche et le paiement, c'est une vente perdue et un appel au service client.",
  },
];

export function ChaineDistribution() {
  const [actif, setActif] = useState<string>("aiguillage");
  const choisi = maillons.find((maillon) => maillon.id === actif)!;

  return (
    <div>
      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch">
        {maillons.map((maillon, index) => (
          <li key={maillon.id} className="flex flex-1 items-center gap-2 md:flex-col md:gap-0">
            <button
              onClick={() => setActif(maillon.id)}
              aria-pressed={actif === maillon.id}
              className={`w-full rounded-lg border p-3 text-left transition-all duration-200 md:min-h-[5.5rem] ${
                actif === maillon.id
                  ? "border-signal-500 bg-signal-500/10 shadow-[0_0_0_1px_var(--color-signal-500)]"
                  : maillon.perimetre
                    ? "border-signal-500/30 bg-rail-900/60 hover:border-signal-500/60"
                    : "border-rail-800 bg-rail-900/40 hover:border-rail-600"
              }`}
            >
              <span
                className={`block text-[13px] font-medium ${
                  actif === maillon.id || maillon.perimetre ? "text-signal-400" : "text-rail-100"
                }`}
              >
                {maillon.titre}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-rail-400">
                {maillon.acteur}
              </span>
            </button>

            {index < maillons.length - 1 ? (
              <span aria-hidden className="shrink-0 px-1 text-rail-600 md:hidden">
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {/* Le filet qui relie les maillons, sur grand écran seulement. */}
      <div aria-hidden className="mt-2 hidden h-px bg-gradient-to-r from-transparent via-rail-700 to-transparent md:block" />

      <div className="mt-5 rounded-xl border border-rail-800 bg-rail-900/40 p-5">
        <p className="text-[11px] uppercase tracking-wider text-rail-400">{choisi.acteur}</p>
        <h4 className="mt-1 text-[17px] font-medium text-rail-100">{choisi.titre}</h4>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-rail-300">{choisi.role}</p>
        <div className="mt-4 border-l-2 border-signal-500/50 pl-3">
          <p className="text-[11px] uppercase tracking-wider text-signal-500">Si ce maillon lâche</p>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-rail-400">{choisi.casse}</p>
        </div>
      </div>
    </div>
  );
}
