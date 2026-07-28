"use client";

import { useActionState } from "react";
import { connexion, type EtatConnexion } from "@/app/admin/actions";

const initial: EtatConnexion = {};

export function FormulaireConnexion({ indice }: { indice?: string }) {
  const [etat, action, enCours] = useActionState(connexion, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] text-rail-300">Mot de passe</span>
        <input
          type="password"
          name="motdepasse"
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-md border border-rail-800 bg-rail-950 px-3 py-2 text-[14px] text-rail-100 outline-none transition-colors focus:border-signal-500"
        />
      </label>

      {etat.erreur ? (
        <p role="alert" className="text-[13px] text-rouge-500">
          {etat.erreur}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enCours}
        className="w-full rounded-md bg-signal-500 px-4 py-2 text-[14px] font-medium text-rail-950 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enCours ? "Vérification…" : "Se connecter"}
      </button>

      {indice ? (
        <p className="rounded-md border border-rail-800 bg-rail-900/60 px-3 py-2 text-[12px] text-rail-400">
          Instance de démonstration — mot de passe :{" "}
          <code className="font-mono text-signal-400">{indice}</code>
        </p>
      ) : null}
    </form>
  );
}
