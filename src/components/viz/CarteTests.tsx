"use client";

import { useMemo, useState } from "react";
import type { SuiteTests } from "@/lib/repo-insights";

/**
 * Les tests du projet, tels qu'ils sont réellement écrits.
 *
 * Les titres affichés sont extraits des fichiers `.test.ts` au moment du build.
 * Personne ne les recopie, donc personne ne peut annoncer une couverture qu'il
 * n'a pas — et un test supprimé disparaît d'ici tout seul.
 */
export function CarteTests({ suites }: { suites: SuiteTests[] }) {
  const [ouverte, setOuverte] = useState<string>(suites[0]?.chemin ?? "");
  const [filtre, setFiltre] = useState("");

  const total = useMemo(() => suites.reduce((somme, suite) => somme + suite.total, 0), [suites]);
  const recherche = filtre.trim().toLowerCase();

  const affichees = useMemo(() => {
    if (!recherche) return suites;
    return suites
      .map((suite) => ({
        ...suite,
        groupes: suite.groupes
          .map((groupe) => ({
            ...groupe,
            tests: groupe.tests.filter((test) =>
              `${groupe.nom} ${test}`.toLowerCase().includes(recherche),
            ),
          }))
          .filter((groupe) => groupe.tests.length > 0),
      }))
      .filter((suite) => suite.groupes.length > 0);
  }, [suites, recherche]);

  const trouves = affichees.reduce(
    (somme, suite) => somme + suite.groupes.reduce((sous, groupe) => sous + groupe.tests.length, 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filtre}
          onChange={(evenement) => setFiltre(evenement.target.value)}
          placeholder="Filtrer les tests… (ex. quota, révoquée, contrat)"
          className="min-w-0 flex-1 rounded-md border border-rail-800 bg-rail-950 px-3 py-2 text-[13px] text-rail-100 outline-none transition-colors placeholder:text-rail-600 focus:border-signal-500"
        />
        <span className="font-mono text-[12px] text-rail-500">
          {recherche ? `${trouves} / ${total}` : `${total} tests`}
        </span>
      </div>

      {/* Répartition en une barre : la proportion se lit plus vite qu'un tableau. */}
      <div className="flex h-2 overflow-hidden rounded-full bg-rail-900" role="img" aria-label="Répartition des tests par suite">
        {suites.map((suite, rang) => (
          <div
            key={suite.chemin}
            style={{ width: `${(suite.total / total) * 100}%` }}
            className={
              ["bg-signal-500", "bg-vert-500", "bg-violet-400", "bg-signal-200", "bg-rail-600"][rang % 5]
            }
            title={`${suite.fichier} — ${suite.total} tests`}
          />
        ))}
      </div>

      <div className="space-y-2">
        {affichees.map((suite) => {
          const active = ouverte === suite.chemin || recherche !== "";

          return (
            <div
              key={suite.chemin}
              className={`overflow-hidden rounded-xl border transition-colors ${
                active ? "border-rail-700 bg-rail-900/50" : "border-rail-800 bg-rail-900/25"
              }`}
            >
              <button
                onClick={() => setOuverte(ouverte === suite.chemin ? "" : suite.chemin)}
                aria-expanded={active}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <code className="font-mono text-[13px] text-rail-100">{suite.fichier}</code>
                <span className="hidden text-[12px] text-rail-500 sm:block">{suite.role}</span>
                <span className="ml-auto shrink-0 rounded-full bg-rail-800 px-2 py-0.5 font-mono text-[11px] text-rail-300">
                  {recherche
                    ? suite.groupes.reduce((somme, groupe) => somme + groupe.tests.length, 0)
                    : suite.total}
                </span>
              </button>

              {active ? (
                <div className="space-y-3 border-t border-rail-800 px-4 py-3">
                  {suite.groupes.map((groupe) => (
                    <div key={groupe.nom}>
                      <p className="text-[12px] font-medium text-signal-400">{groupe.nom}</p>
                      <ul className="mt-1 space-y-0.5">
                        {groupe.tests.map((test) => (
                          <li
                            key={test}
                            className="flex items-baseline gap-2 text-[13px] leading-snug text-rail-400"
                          >
                            <span aria-hidden className="text-vert-500">
                              ✓
                            </span>
                            <span>{test}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {affichees.length === 0 ? (
        <p className="rounded-xl border border-rail-800 bg-rail-900/40 px-4 py-6 text-center text-[13px] text-rail-400">
          Aucun test ne correspond à « {filtre} ».
        </p>
      ) : null}
    </div>
  );
}
