"use client";

import { useState } from "react";
import type { Decision } from "@/lib/repo-insights";

/**
 * Les décisions d'architecture, avec leur coût.
 *
 * Le coût est affiché au même niveau que la justification, pas relégué en bas
 * de page : une décision présentée sans inconvénient est une décision qu'on n'a
 * pas vraiment prise, et un entretien technique le repère en trente secondes.
 */
export function CartesDecisions({ decisions }: { decisions: Decision[] }) {
  const [ouverte, setOuverte] = useState<string>(decisions[0]?.numero ?? "");

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {decisions.map((decision) => {
        const active = ouverte === decision.numero;

        return (
          <article
            key={decision.numero}
            className={`flex flex-col rounded-xl border p-4 transition-colors ${
              active ? "border-signal-500/40 bg-rail-900/60" : "border-rail-800 bg-rail-900/30"
            }`}
          >
            <button
              onClick={() => setOuverte(active ? "" : decision.numero)}
              aria-expanded={active}
              className="text-left"
            >
              <span className="font-mono text-[11px] text-signal-500">{decision.numero}</span>
              <h4 className="mt-1 text-[15px] font-medium leading-snug text-rail-100">
                {decision.titre}
              </h4>
            </button>

            <p className="mt-2.5 text-[13.5px] leading-relaxed text-rail-300">{decision.decision}</p>

            {active ? (
              <div className="mt-3 space-y-3 border-t border-rail-800 pt-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-rail-500">Pourquoi</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-rail-400">{decision.pourquoi}</p>
                </div>
                {decision.cout ? (
                  <div className="rounded-lg border border-signal-500/25 bg-signal-500/5 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-signal-500">Ce que ça coûte</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-rail-300">{decision.cout}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                onClick={() => setOuverte(decision.numero)}
                className="mt-auto pt-3 text-left text-[12px] text-rail-500 transition-colors hover:text-signal-400"
              >
                Pourquoi, et ce que ça coûte →
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
