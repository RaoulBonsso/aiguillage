"use client";

import { useState } from "react";

/**
 * La diapositive qui appelle vraiment l'API.
 *
 * Une capture d'écran de réponse JSON ne prouve rien : elle a pu être prise le
 * jour où ça marchait. Ce bouton appelle la production pendant l'entretien. Si
 * l'API tombe, la présentation tombe avec elle — c'est le but.
 */

type Scenario = {
  cle: string;
  libelle: string;
  chemin: string;
  cle_api: string;
  attendu: string;
};

type Reponse = {
  status: number;
  duree: number;
  quota: string | null;
  corps: string;
};

/** Hors du composant : chronométrer un appel n'a rien à faire dans un rendu. */
async function chronometrer(choisi: Scenario): Promise<Reponse> {
  const depart = performance.now();

  try {
    const resultat = await fetch(choisi.chemin, {
      headers: choisi.cle_api ? { "X-API-Key": choisi.cle_api } : {},
    });
    const texte = await resultat.text();
    const limite = resultat.headers.get("RateLimit-Limit");
    const restant = resultat.headers.get("RateLimit-Remaining");

    return {
      status: resultat.status,
      duree: Math.round(performance.now() - depart),
      quota: limite ? `${restant} / ${limite}` : null,
      corps: joli(texte),
    };
  } catch (erreur) {
    return {
      status: 0,
      duree: Math.round(performance.now() - depart),
      quota: null,
      corps: `Appel impossible : ${(erreur as Error).message}`,
    };
  }
}

const CLE_DEMO = "agl_live_demo00000000000000000000000000";

function dansTroisJours(): string {
  const date = new Date(Date.now() + 3 * 86400000);
  return date.toISOString().slice(0, 10);
}

export function DemoEnDirect() {
  const scenarios: Scenario[] = [
    {
      cle: "ok",
      libelle: "Une recherche qui aboutit",
      chemin: `/api/v1/offers?origin=FRPAR&destination=FRNTE&date=${dansTroisJours()}`,
      cle_api: CLE_DEMO,
      attendu: "200 — des offres, et les en-têtes de quota",
    },
    {
      cle: "invalide",
      libelle: "Un paramètre mal formé",
      chemin: "/api/v1/offers?origin=paris&destination=FRNTE&date=04-08-2026",
      cle_api: CLE_DEMO,
      attendu: "400 — problem+json, avec le champ fautif nommé",
    },
    {
      cle: "sans-cle",
      libelle: "Sans clé d'API",
      chemin: "/api/v1/stations",
      cle_api: "",
      attendu: "401 — type d'erreur stable, documenté",
    },
    {
      cle: "date",
      libelle: "Le 31 février",
      chemin: "/api/v1/offers?origin=FRPAR&destination=FRNTE&date=2026-02-31",
      cle_api: CLE_DEMO,
      attendu: "400 — une date que le calendrier ne connaît pas",
    },
  ];

  const [scenario, setScenario] = useState<Scenario>(scenarios[0]);
  const [reponse, setReponse] = useState<Reponse | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function appeler(choisi: Scenario) {
    setScenario(choisi);
    setEnCours(true);
    setReponse(null);
    try {
      setReponse(await chronometrer(choisi));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-2">
        {scenarios.map((element) => (
          <button
            key={element.cle}
            onClick={() => appeler(element)}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              scenario.cle === element.cle
                ? "border-signal-500 bg-signal-500/10"
                : "border-rail-800 bg-rail-900/40 hover:border-rail-600"
            }`}
          >
            <span className="block text-[14px] font-medium text-rail-100">{element.libelle}</span>
            <span className="mt-0.5 block text-[12px] text-rail-400">{element.attendu}</span>
          </button>
        ))}
        <p className="pt-1 text-[12px] text-rail-600">
          Chaque bouton appelle l&apos;API de production, maintenant.
        </p>
      </div>

      <div className="rounded-xl border border-rail-800 bg-rail-950 p-4">
        <p className="bloc-code break-all text-rail-500">GET {scenario.chemin}</p>

        {enCours ? (
          <p className="mt-4 text-[13px] text-rail-400">Appel en cours…</p>
        ) : reponse ? (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
              <span
                className={`font-mono text-[15px] font-semibold ${
                  reponse.status >= 200 && reponse.status < 300
                    ? "text-vert-500"
                    : reponse.status >= 400 && reponse.status < 500
                      ? "text-signal-500"
                      : "text-rouge-500"
                }`}
              >
                {reponse.status || "échec"}
              </span>
              <span className="text-rail-400">{reponse.duree} ms</span>
              {reponse.quota ? (
                <span className="text-rail-400">quota {reponse.quota}</span>
              ) : null}
            </div>
            <pre className="bloc-code mt-3 max-h-[19rem] overflow-auto text-rail-300">
              {reponse.corps}
            </pre>
          </>
        ) : (
          <p className="mt-4 text-[13px] text-rail-500">
            Choisissez un scénario à gauche pour lancer l&apos;appel.
          </p>
        )}
      </div>
    </div>
  );
}

function joli(texte: string): string {
  try {
    const donnees = JSON.parse(texte);
    const rendu = JSON.stringify(donnees, null, 2);
    // On tronque : une diapositive n'est pas un terminal, et personne ne lit
    // trois cents lignes de JSON projetées au mur.
    return rendu.length > 1800 ? `${rendu.slice(0, 1800)}\n…` : rendu;
  } catch {
    return texte;
  }
}
