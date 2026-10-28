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
          className="w-full rounded-[10px] bg-rail-950 px-3.5 py-2.5 text-[14px] text-rail-100 outline-none ring-1 ring-inset ring-rail-700 transition-shadow focus:ring-2 focus:ring-signal-500"
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
        className="bouton-primaire w-full justify-center disabled:opacity-50"
      >
        {enCours ? "Vérification…" : "Se connecter"}
      </button>

      {indice ? (
        <p className="rounded-xl bg-white/[0.03] px-3.5 py-2.5 text-[12px] text-rail-400 ring-1 ring-inset ring-white/[0.06]">
          Instance de démonstration — mot de passe :{" "}
          <code className="font-mono text-signal-400">{indice}</code>
        </p>
      ) : null}
    </form>
  );
}
