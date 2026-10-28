"use client";

import { useMemo, useState } from "react";
import type { ParameterObject } from "@/lib/contract";

/**
 * La console d'essai du portail.
 *
 * Elle tape la vraie API, avec la vraie clé du bac à sable, et affiche la vraie
 * réponse — y compris les en-têtes de quota. Une documentation dont les exemples
 * sont figés ne prouve rien ; ici, si l'API tombe, l'exemple tombe avec elle.
 */

type Props = {
  method: string;
  path: string;
  baseUrl: string;
  parameters: ParameterObject[];
  demoKey: string;
  defauts: Record<string, string>;
};

type Resultat = {
  status: number;
  duree: number;
  quota: { limite: string | null; restant: string | null; reset: string | null };
  corps: string;
};

export function TryIt({ method, path, baseUrl, parameters, demoKey, defauts }: Props) {
  const champs = useMemo(
    () => parameters.filter((parametre) => parametre.in === "query" || parametre.in === "path"),
    [parameters],
  );

  const [valeurs, setValeurs] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      champs.map((champ) => [
        champ.name,
        defauts[champ.name] ?? (champ.example !== undefined ? String(champ.example) : ""),
      ]),
    ),
  );
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [enCours, setEnCours] = useState(false);

  const url = useMemo(() => construireUrl(baseUrl, path, champs, valeurs), [baseUrl, path, champs, valeurs]);

  async function envoyer() {
    setEnCours(true);
    const depart = performance.now();
    try {
      const reponse = await fetch(url, { headers: { "X-API-Key": demoKey } });
      const texte = await reponse.text();
      setResultat({
        status: reponse.status,
        duree: Math.round(performance.now() - depart),
        quota: {
          limite: reponse.headers.get("RateLimit-Limit"),
          restant: reponse.headers.get("RateLimit-Remaining"),
          reset: reponse.headers.get("RateLimit-Reset"),
        },
        corps: joliJson(texte),
      });
    } catch (erreur) {
      setResultat({
        status: 0,
        duree: Math.round(performance.now() - depart),
        quota: { limite: null, restant: null, reset: null },
        corps: `L'appel n'a pas abouti : ${(erreur as Error).message}`,
      });
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-rail-950/60 ring-1 ring-inset ring-white/[0.08]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
        <h4 className="text-[13px] font-medium text-rail-300">Essayer</h4>
        <span className="font-mono text-[11px] text-rail-400">clé du bac à sable</span>
      </div>

      <div className="space-y-3 p-4">
        {champs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {champs.map((champ) => (
              <label key={champ.name} className="block">
                <span className="mb-1 flex items-baseline gap-1.5 text-[12px] text-rail-300">
                  <code className="font-mono">{champ.name}</code>
                  {champ.required ? <span className="text-signal-500">*</span> : null}
                </span>
                <input
                  value={valeurs[champ.name] ?? ""}
                  onChange={(evenement) =>
                    setValeurs((precedent) => ({ ...precedent, [champ.name]: evenement.target.value }))
                  }
                  placeholder={champ.example !== undefined ? String(champ.example) : ""}
                  className="w-full rounded-md border border-rail-800 bg-rail-950 px-2.5 py-1.5 font-mono text-[13px] text-rail-100 outline-none transition-colors placeholder:text-rail-600 focus:border-signal-500"
                />
              </label>
            ))}
          </div>
        ) : null}

        <div className="rounded-md border border-rail-800 bg-rail-950 px-3 py-2">
          <p className="bloc-code whitespace-pre text-rail-300">
            <span className="text-vert-500">curl</span> {url}
            {"\n"}
            {"  "}-H <span className="text-signal-400">&quot;X-API-Key: {demoKey}&quot;</span>
          </p>
        </div>

        <button
          onClick={envoyer}
          disabled={enCours}
          className="rounded-md bg-signal-500 px-3.5 py-1.5 text-[13px] font-medium text-rail-950 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enCours ? "Appel en cours…" : `Envoyer la requête ${method}`}
        </button>

        {resultat ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
              <span className={`font-mono ${couleurStatut(resultat.status)}`}>
                {resultat.status === 0 ? "échec réseau" : `${resultat.status}`}
              </span>
              <span className="text-rail-400">{resultat.duree} ms</span>
              {resultat.quota.limite ? (
                <span className="text-rail-400">
                  quota {resultat.quota.restant}/{resultat.quota.limite} · réarmement dans{" "}
                  {resultat.quota.reset} s
                </span>
              ) : null}
            </div>
            <pre className="bloc-code max-h-80 overflow-auto rounded-md border border-rail-800 bg-rail-950 p-3 text-rail-300">
              {resultat.corps}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function construireUrl(
  baseUrl: string,
  path: string,
  champs: ParameterObject[],
  valeurs: Record<string, string>,
): string {
  let chemin = path;
  const requete = new URLSearchParams();

  for (const champ of champs) {
    const valeur = valeurs[champ.name]?.trim() ?? "";
    if (champ.in === "path") {
      chemin = chemin.replace(`{${champ.name}}`, valeur || `{${champ.name}}`);
    } else if (valeur !== "") {
      requete.set(champ.name, valeur);
    }
  }

  const chaine = requete.toString();
  return `${baseUrl}${chemin}${chaine ? `?${chaine}` : ""}`;
}

function joliJson(texte: string): string {
  try {
    return JSON.stringify(JSON.parse(texte), null, 2);
  } catch {
    return texte;
  }
}

function couleurStatut(status: number): string {
  if (status >= 200 && status < 300) return "text-vert-500";
  if (status >= 400 && status < 500) return "text-signal-500";
  return "text-rouge-500";
}
