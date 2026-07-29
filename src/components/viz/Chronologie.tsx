"use client";

import { useState } from "react";

/**
 * L'historique du dépôt, comme preuve.
 *
 * « J'ai écrit la spec avant le code » est une affirmation. L'ordre des commits
 * est une preuve. Les données viennent de `src/data/historique.json`, généré
 * par `npm run instantane` à partir de `git log` — les empreintes affichées
 * sont vérifiables dans le vrai dépôt.
 */

export type Commit = {
  hash: string;
  date: string;
  type: string;
  portee: string | null;
  titre: string;
};

const COULEURS: Record<string, string> = {
  docs: "text-violet-400 border-violet-400/40 bg-violet-400/10",
  feat: "text-vert-500 border-vert-500/40 bg-vert-500/10",
  fix: "text-rouge-500 border-rouge-500/40 bg-rouge-500/10",
  chore: "text-rail-400 border-rail-700 bg-rail-800/40",
};

export function Chronologie({ commits }: { commits: Commit[] }) {
  const [survole, setSurvole] = useState<string | null>(null);

  const indexSpec = commits.findIndex((commit) => commit.titre.includes("contrat OpenAPI"));
  const indexApi = commits.findIndex((commit) => commit.portee === "api");

  return (
    <div>
      {indexSpec >= 0 && indexApi > indexSpec ? (
        <p className="mb-5 rounded-lg border border-signal-500/30 bg-signal-500/5 px-4 py-3 text-[13.5px] leading-relaxed text-rail-300">
          Le commit <code className="font-mono text-signal-400">{commits[indexSpec].hash}</code>{" "}
          (le contrat) précède de <strong className="text-rail-100">{indexApi - indexSpec} commits</strong>{" "}
          <code className="font-mono text-signal-400">{commits[indexApi].hash}</code> (les routes HTTP).
          C&apos;est ça, le Spec Driven Development — vérifiable, pas déclaratif.
        </p>
      ) : null}

      <ol className="relative space-y-1 border-l border-rail-800 pl-5">
        {commits.map((commit, rang) => {
          const remarquable = rang === indexSpec || rang === indexApi;
          const couleur = COULEURS[commit.type] ?? COULEURS.chore;

          return (
            <li
              key={commit.hash}
              onMouseEnter={() => setSurvole(commit.hash)}
              onMouseLeave={() => setSurvole(null)}
              className="relative"
            >
              <span
                aria-hidden
                className={`absolute -left-[26px] top-3 h-2 w-2 rounded-full transition-all duration-200 ${
                  remarquable
                    ? "bg-signal-500 ring-4 ring-signal-500/20"
                    : survole === commit.hash
                      ? "bg-rail-300"
                      : "bg-rail-700"
                }`}
              />
              <div
                className={`flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-md px-2.5 py-2 transition-colors ${
                  remarquable ? "bg-signal-500/5" : survole === commit.hash ? "bg-rail-900" : ""
                }`}
              >
                <span className={`rounded border px-1.5 py-px font-mono text-[10px] ${couleur}`}>
                  {commit.type}
                  {commit.portee ? `(${commit.portee})` : ""}
                </span>
                <span
                  className={`text-[13.5px] ${remarquable ? "text-rail-100" : "text-rail-300"}`}
                >
                  {commit.titre}
                </span>
                <code className="ml-auto font-mono text-[11px] text-rail-600">{commit.hash}</code>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
