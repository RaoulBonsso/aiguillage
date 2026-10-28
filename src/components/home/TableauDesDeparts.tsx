"use client";

import { useEffect, useState } from "react";
import type { Offer, Page, Station } from "@/domain/types";

/**
 * Le tableau des départs de la page d'accueil, alimenté par un VRAI appel à
 * l'API avec la clé du bac à sable. Le visiteur choisit un trajet et un jour,
 * voit la requête partir, puis la réponse : en tableau lisible par un voyageur,
 * ou en JSON brut tel qu'un intégrateur le reçoit.
 */

type Trajet = { origin: string; destination: string };

type Resultat = {
  chemin: string;
  statut: number;
  dureeMs: number;
  restant: string | null;
  corps: unknown;
};

type Props = {
  stations: Station[];
  trajets: Trajet[];
  jours: string[];
  cleDemo: string;
};

export function TableauDesDeparts({ stations, trajets, jours, cleDemo }: Props) {
  const [trajet, setTrajet] = useState(0);
  const [jour, setJour] = useState(jours[0]);
  const [vue, setVue] = useState<"tableau" | "json">("tableau");
  const [enErreur, setEnErreur] = useState(false);
  const [resultat, setResultat] = useState<Resultat | null>(null);

  const nom = (code: string) => stations.find((s) => s.code === code)?.city ?? code;
  const { origin, destination } = trajets[trajet];
  // Le scénario « erreur » envoie une date au mauvais format, pour montrer ce
  // qu'un intégrateur reçoit quand il se trompe.
  const date = enErreur ? jour.split("-").reverse().join("-") : jour;
  const chemin = `/api/v1/offers?origin=${origin}&destination=${destination}&date=${date}&limit=6`;
  // Tant que la réponse affichée n'est pas celle de la requête courante, on charge.
  const chargement = resultat?.chemin !== chemin;

  // Le tableau se remplit tout seul à chaque changement, comme en gare. Une
  // réponse arrivée après un nouveau choix est ignorée.
  useEffect(() => {
    let perime = false;
    const debut = performance.now();
    fetch(chemin, { headers: { "X-API-Key": cleDemo } })
      .then(async (reponse) => {
        const corps = await reponse.json();
        if (perime) return;
        setResultat({
          chemin,
          statut: reponse.status,
          dureeMs: Math.round(performance.now() - debut),
          restant: reponse.headers.get("RateLimit-Remaining"),
          corps,
        });
      })
      .catch(() => {
        if (!perime) {
          setResultat({ chemin, statut: 0, dureeMs: 0, restant: null, corps: { erreur: "Réseau indisponible" } });
        }
      });
    return () => {
      perime = true;
    };
  }, [chemin, cleDemo]);

  const offres = resultat && resultat.statut === 200 ? (resultat.corps as Page<Offer>).data : [];

  return (
    <div className="panneau overflow-hidden">
      {/* En-tête du panneau */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
        <p className="flex items-center gap-2.5 text-[13px] font-medium text-rail-200">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-rouge-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-signal-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-vert-500/80" />
          </span>
          Tableau des départs
          <span className="hidden text-rail-500 sm:inline">· données de l&apos;API</span>
        </p>
        <div role="tablist" aria-label="Affichage de la réponse" className="flex rounded-[10px] bg-rail-950/80 p-1 ring-1 ring-inset ring-white/[0.06]">
          {(["tableau", "json"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={vue === v}
              onClick={() => setVue(v)}
              className={`cursor-pointer rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                vue === v ? "bg-rail-800 text-rail-100 shadow-sm" : "text-rail-400 hover:text-rail-100"
              }`}
            >
              {v === "tableau" ? "Voyageur" : "JSON"}
            </button>
          ))}
        </div>
      </div>

      {/* Commandes : trajet et jour */}
      <div className="grid gap-4 px-5 pb-4 pt-5 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-[12px] font-medium text-rail-500">Trajet</span>
          <select
            value={trajet}
            onChange={(e) => setTrajet(Number(e.target.value))}
            className="w-full cursor-pointer rounded-[10px] bg-rail-950 px-3.5 py-2.5 text-[14px] text-rail-100 outline-none ring-1 ring-inset ring-rail-700 transition-shadow focus:ring-2 focus:ring-signal-500"
          >
            {trajets.map((t, i) => (
              <option key={`${t.origin}-${t.destination}`} value={i}>
                {nom(t.origin)} → {nom(t.destination)}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="mb-2 block text-[12px] font-medium text-rail-500">Jour</legend>
          <div className="flex gap-1 rounded-[12px] bg-rail-950 p-1 ring-1 ring-inset ring-rail-700">
            {jours.slice(0, 4).map((j) => {
              const d = new Date(`${j}T12:00:00`);
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJour(j)}
                  aria-pressed={jour === j}
                  className={`chiffres cursor-pointer rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                    jour === j
                      ? "bg-signal-500 font-semibold text-rail-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
                      : "text-rail-300 hover:bg-white/[0.05] hover:text-rail-100"
                  }`}
                >
                  {d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" })}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* La requête telle qu'elle part */}
      <div className="mx-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-rail-950 px-3.5 py-2.5 font-mono text-[12px] ring-1 ring-inset ring-white/[0.06]">
        <span className="badge badge-vert !px-2 !py-0.5 font-semibold">GET</span>
        <span className="min-w-0 basis-full break-all text-rail-300 sm:basis-0 sm:flex-1">{chemin}</span>
        {resultat ? (
          <span className="chiffres flex items-center gap-3 text-rail-400">
            <span className={`badge !py-0.5 ${resultat.statut === 200 ? "badge-vert" : "badge-signal"}`}>
              {resultat.statut || "—"}
            </span>
            <span>{resultat.dureeMs} ms</span>
            {resultat.restant ? <span title="Appels restants sur le quota du bac à sable">quota {resultat.restant}</span> : null}
          </span>
        ) : null}
      </div>

      {/* La réponse */}
      <div className="mt-2 min-h-[19rem] overflow-x-auto" aria-live="polite" aria-busy={chargement}>
        {vue === "json" || (resultat && resultat.statut !== 200) ? (
          <pre className="bloc-code max-h-[19rem] px-5 py-4 text-[12px] text-rail-300">
            {resultat ? JSON.stringify(resultat.corps, null, 2) : "…"}
          </pre>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-[11px] font-medium uppercase tracking-[0.06em] text-rail-500">
                <th className="px-3 pb-2 pt-3 font-medium sm:px-5">Départ</th>
                <th className="px-2 pb-2 pt-3 font-medium">Destination</th>
                <th className="hidden px-2 pb-2 pt-3 font-medium sm:table-cell">Train</th>
                <th className="px-2 pb-2 pt-3 text-right font-medium">Dès</th>
                <th className="px-3 pb-2 pt-3 text-right font-medium sm:px-5">Places</th>
              </tr>
            </thead>
            <tbody>
              {offres.map((offre, i) => {
                const prix = Math.min(...offre.fares.map((f) => f.price.amount_cents)) / 100;
                const statut = offre.availability.status;
                return (
                  <tr
                    key={offre.id}
                    className="ligne-depart border-t border-white/[0.05] transition-colors hover:bg-white/[0.02]"
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <td className="chiffres px-3 py-3 font-mono text-[17px] sm:px-5 font-semibold text-signal-400">
                      {heure(offre.departure)}
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-[15px] font-semibold leading-none tracking-[-0.01em] text-rail-100">{nom(offre.destination)}</p>
                      <p className="mt-1 text-[12px] text-rail-500">
                        arr. {heure(offre.arrival)} · {Math.floor(offre.duration_minutes / 60)} h{" "}
                        {String(offre.duration_minutes % 60).padStart(2, "0")}
                        {offre.segments.length > 1 ? ` · ${offre.segments.length - 1} corresp.` : ""}
                      </p>
                    </td>
                    <td className="hidden px-2 py-3 sm:table-cell">
                      <p className="font-mono text-[12px] text-rail-300">{offre.segments[0].train_number}</p>
                      <p className="text-[12px] text-rail-500">{offre.segments[0].carrier}</p>
                    </td>
                    <td className="chiffres px-2 py-3 text-right font-mono text-[14px] text-rail-100">
                      {prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="px-3 py-3 text-right sm:px-5">
                      <span
                        className={`badge ${
                          statut === "available"
                            ? "badge-vert"
                            : statut === "limited"
                              ? "badge-signal"
                              : "badge-rouge"
                        }`}
                      >
                        {statut === "available"
                          ? offre.availability.seats_remaining
                          : statut === "limited"
                            ? `${offre.availability.seats_remaining} rest.`
                            : "Complet"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {resultat && offres.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[14px] text-rail-500">
                    Aucun départ ce jour sur ce trajet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>

      {/* Pied : provoquer une erreur */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-rail-950/40 px-5 py-3.5">
        <p className="text-[12px] text-rail-500">
          {enErreur
            ? "Date envoyée au format JJ-MM-AAAA : l'API répond 400 et nomme le champ fautif (RFC 9457)."
            : "Requête réelle, clé du bac à sable publique, aucune inscription."}
        </p>
        <button
          type="button"
          onClick={() => setEnErreur((e) => !e)}
          className="cursor-pointer rounded-[10px] px-3 py-1.5 text-[12px] font-medium text-rail-200 ring-1 ring-inset ring-rail-700 transition-[box-shadow,color,background-color] hover:bg-rouge-500/10 hover:text-rouge-500 hover:ring-rouge-500/50"
        >
          {enErreur ? "Revenir à une requête valide" : "Provoquer une erreur"}
        </button>
      </div>
    </div>
  );
}

function heure(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}
