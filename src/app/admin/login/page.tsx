import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormulaireConnexion } from "@/components/admin/FormulaireConnexion";
import { modeDemo, motDePasseAttendu } from "@/lib/session";
import { sessionOuverte } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Connexion à la console" };

export default async function ConnexionPage() {
  if (await sessionOuverte()) {
    redirect("/admin");
  }

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="halo pointer-events-none absolute inset-0" />
      <div aria-hidden className="grille-fond pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-[30rem] flex-col justify-center px-5 py-20 sm:py-28">
        <div className="panneau p-7 sm:p-9">
          <p className="flex items-center gap-3 text-[13px] text-rail-400">
            <span className="pave-voie">04</span>
            Accès restreint
          </p>
          <h1 className="titre-voie mt-5 text-[34px] text-rail-100">Console d&apos;administration</h1>
          <p className="mb-8 mt-2.5 text-[14px] leading-relaxed text-rail-400">
            Émission et révocation des clés d&apos;API, suivi de la consommation des canaux de vente.
          </p>

          <FormulaireConnexion indice={modeDemo() ? motDePasseAttendu() : undefined} />
        </div>
      </div>
    </div>
  );
}
