"use client";

import { useActionState, useState } from "react";
import { creerCle, type EtatCreation } from "@/app/admin/actions";

const initial: EtatCreation = {};

/**
 * Émission d'une clé.
 *
 * Le secret n'est affiché qu'ici, une seule fois. L'interface doit le dire
 * franchement : un administrateur qui ferme la fenêtre en croyant pouvoir
 * revenir le lire perd la clé, et c'est de la faute de l'interface, pas de la
 * sienne.
 */
export function FormulaireNouvelleCle() {
  const [etat, action, enCours] = useActionState(creerCle, initial);
  const [copie, setCopie] = useState(false);

  return (
    <div className="space-y-4">
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[12px] text-rail-400">Nom du canal</span>
          <input
            name="nom"
            placeholder="Canal web grand public"
            className="w-full rounded-md border border-rail-800 bg-rail-950 px-3 py-2 text-[14px] text-rail-100 outline-none transition-colors placeholder:text-rail-600 focus:border-signal-500"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] text-rail-400">Quota mensuel</span>
          <input
            name="quota"
            type="number"
            defaultValue={10000}
            min={1}
            className="w-full rounded-md border border-rail-800 bg-rail-950 px-3 py-2 font-mono text-[14px] text-rail-100 outline-none transition-colors focus:border-signal-500"
          />
        </label>

        <button
          type="submit"
          disabled={enCours}
          className="rounded-md bg-signal-500 px-4 py-2 text-[14px] font-medium text-rail-950 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enCours ? "Émission…" : "Émettre la clé"}
        </button>
      </form>

      {etat.erreur ? (
        <p role="alert" className="text-[13px] text-rouge-500">
          {etat.erreur}
        </p>
      ) : null}

      {etat.secret ? (
        <div className="rounded-lg border border-signal-500/40 bg-signal-500/5 p-4">
          <p className="text-[13px] font-medium text-signal-400">
            Clé émise pour « {etat.nom} » — copiez-la maintenant
          </p>
          <p className="mt-1 text-[12px] text-rail-400">
            Elle ne sera plus jamais affichée : seule son empreinte est conservée.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md border border-rail-800 bg-rail-950 px-3 py-2 font-mono text-[12px] text-rail-100">
              {etat.secret}
            </code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(etat.secret!);
                setCopie(true);
                setTimeout(() => setCopie(false), 2000);
              }}
              className="rounded-md border border-rail-700 px-3 py-2 text-[13px] text-rail-100 transition-colors hover:bg-rail-850"
            >
              {copie ? "Copié" : "Copier"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
