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
    <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Console d&apos;administration</h1>
      <p className="mt-2 mb-8 text-[14px] leading-relaxed text-rail-400">
        Émission et révocation des clés d&apos;API, suivi de la consommation des canaux de vente.
      </p>

      <FormulaireConnexion indice={modeDemo() ? motDePasseAttendu() : undefined} />
    </div>
  );
}
