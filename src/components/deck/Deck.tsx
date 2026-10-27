"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

/**
 * Le moteur de présentation.
 *
 * Contraintes qui ont guidé le code : on présente au clavier (les flèches et
 * l'espace, pas la souris), on doit pouvoir sauter à une diapo précise sans
 * défiler devant tout le monde, et une URL partagée doit ouvrir la bonne diapo.
 * Le reste est du décor.
 */

export type Diapo = {
  cle: string;
  titre: string;
  contenu: React.ReactNode;
};

// L'URL n'est lue qu'à l'ouverture : la navigation la réécrit ensuite avec
// replaceState, qui n'émet aucun événement à écouter.
const sansAbonnement = () => () => {};
const hashDeLUrl = () => window.location.hash;
const hashCoteServeur = () => "";

function indexDepuisHash(hash: string, total: number): number {
  const depuisUrl = Number(hash.replace("#", ""));
  return Number.isInteger(depuisUrl) && depuisUrl >= 1 && depuisUrl <= total ? depuisUrl - 1 : 0;
}

export function Deck({ diapos }: { diapos: Diapo[] }) {
  // Une URL partagée (#7) doit ouvrir la bonne diapo. Le serveur rend la
  // première, le client corrige à l'hydratation tant qu'on n'a pas navigué.
  const hash = useSyncExternalStore(sansAbonnement, hashDeLUrl, hashCoteServeur);
  const [choix, setIndex] = useState<number | null>(null);
  const index = choix ?? indexDepuisHash(hash, diapos.length);
  const [sommaire, setSommaire] = useState(false);
  const [sens, setSens] = useState<1 | -1>(1);

  const aller = useCallback(
    (cible: number) => {
      const borne = Math.max(0, Math.min(diapos.length - 1, cible));
      setSens(borne >= index ? 1 : -1);
      setIndex(borne);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${borne + 1}`);
      }
    },
    [diapos.length, index],
  );

  useEffect(() => {
    function auClavier(evenement: KeyboardEvent) {
      // On ne détourne pas les touches quand l'utilisateur écrit dans un champ.
      const cible = evenement.target as HTMLElement | null;
      if (cible && ["INPUT", "TEXTAREA"].includes(cible.tagName)) return;

      switch (evenement.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          evenement.preventDefault();
          setSommaire(false);
          aller(index + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
          evenement.preventDefault();
          setSommaire(false);
          aller(index - 1);
          break;
        case "Home":
          aller(0);
          break;
        case "End":
          aller(diapos.length - 1);
          break;
        case "o":
        case "O":
          setSommaire((etat) => !etat);
          break;
        case "Escape":
          setSommaire(false);
          break;
      }
    }

    window.addEventListener("keydown", auClavier);
    return () => window.removeEventListener("keydown", auClavier);
  }, [aller, index, diapos.length]);

  const diapo = diapos[index];
  const progression = ((index + 1) / diapos.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-rail-950">
      <div className="flex items-center gap-3 border-b border-rail-800/80 px-4 py-2.5">
        <Link
          href="/"
          className="flex items-center gap-2 text-[13px] text-rail-400 transition-colors hover:text-rail-100"
        >
          <span aria-hidden>←</span> Aiguillage
        </Link>
        <span className="hidden text-[12px] text-rail-600 sm:block">{diapo.titre}</span>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setSommaire((etat) => !etat)}
            className="rounded-md border border-rail-700 px-2.5 py-1 text-[12px] text-rail-300 transition-colors hover:bg-rail-850"
            aria-expanded={sommaire}
          >
            Sommaire <kbd className="ml-1 font-mono text-[10px] text-rail-500">O</kbd>
          </button>
          <button
            onClick={() => aller(index - 1)}
            disabled={index === 0}
            className="rounded-md border border-rail-700 px-2.5 py-1 text-[13px] text-rail-300 transition-colors hover:bg-rail-850 disabled:opacity-30"
            aria-label="Diapositive précédente"
          >
            ←
          </button>
          <button
            onClick={() => aller(index + 1)}
            disabled={index === diapos.length - 1}
            className="rounded-md border border-rail-700 px-2.5 py-1 text-[13px] text-rail-300 transition-colors hover:bg-rail-850 disabled:opacity-30"
            aria-label="Diapositive suivante"
          >
            →
          </button>
          <span className="ml-1 font-mono text-[12px] tabular-nums text-rail-500">
            {index + 1} / {diapos.length}
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        {sommaire ? (
          <div className="mx-auto grid max-w-5xl gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {diapos.map((element, rang) => (
              <button
                key={element.cle}
                onClick={() => {
                  aller(rang);
                  setSommaire(false);
                }}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  rang === index
                    ? "border-signal-500 bg-signal-500/10"
                    : "border-rail-800 bg-rail-900/40 hover:border-rail-600"
                }`}
              >
                <span className="font-mono text-[11px] text-rail-600">
                  {String(rang + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-[14px] leading-snug text-rail-100">
                  {element.titre}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div
            key={diapo.cle}
            className="mx-auto flex min-h-full max-w-5xl flex-col justify-center px-6 py-10"
            style={{
              animation: `diapo-entree 320ms cubic-bezier(0.22, 1, 0.36, 1)`,
              // La direction du glissement suit le sens de navigation : reculer
              // doit se sentir comme reculer.
              ["--sens" as string]: String(sens),
            }}
          >
            {diapo.contenu}
          </div>
        )}
      </div>

      <div className="h-0.5 w-full bg-rail-900">
        <div
          className="h-full bg-signal-500 transition-all duration-300"
          style={{ width: `${progression}%` }}
        />
      </div>

      <style>{`
        @keyframes diapo-entree {
          from { opacity: 0; transform: translateX(calc(var(--sens) * 18px)); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
