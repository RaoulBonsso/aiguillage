import type { Metadata } from "next";
import { apiKeys } from "@/lib/api-context";
import { offers, stations } from "@/data/catalog";
import { FormulaireNouvelleCle } from "@/components/admin/FormulaireNouvelleCle";
import { deconnexion, exigerSession, revoquerCle } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Console d'administration" };

// La console montre l'état courant des clés et de leur consommation : la mettre
// en cache reviendrait à afficher un tableau de bord périmé.
export const dynamic = "force-dynamic";

/**
 * La console d'administration : le second livrable, celui qui rend l'API
 * pilotable. Un portail sans console laisse la gestion des accès à des scripts
 * éparpillés — c'est précisément ce qu'on remplace.
 */
export default async function ConsolePage() {
  await exigerSession();

  const service = await apiKeys();
  const cles = await service.list();
  const journal = await service.recentUsage(undefined, 25);
  const etats = await Promise.all(cles.map((cle) => service.status(cle.id)));

  const actives = cles.filter((cle) => !cle.revoked_at).length;
  const appels = etats.reduce((total, etat) => total + etat.used, 0);

  return (
    <div className="mx-auto max-w-[84rem] space-y-12 px-5 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="etiquette flex items-center gap-3 text-rail-400">
            <span className="pave-voie">04</span>
            Console
          </p>
          <h1 className="titre-voie mt-5 text-[clamp(2.4rem,4.6vw,3.8rem)] text-rail-100">Console d&apos;administration</h1>
          <p className="mt-4 text-[15px] text-rail-400">
            Les accès des canaux de vente et leur consommation.
          </p>
        </div>
        <form action={deconnexion}>
          <button className="rounded-md border border-rail-700 px-3 py-1.5 text-[13px] text-rail-300 transition-colors hover:bg-rail-850 hover:text-rail-100">
            Se déconnecter
          </button>
        </form>
      </header>

      <section className="grid border-l border-t border-rail-800 sm:grid-cols-4">
        <Tuile valeur={String(actives)} libelle="clés actives" />
        <Tuile valeur={appels.toLocaleString("fr-FR")} libelle="appels ce mois-ci" />
        <Tuile valeur={offers.length.toLocaleString("fr-FR")} libelle="offres au catalogue" />
        <Tuile valeur={String(stations.length)} libelle="gares desservies" />
      </section>

      <section className="space-y-4">
        <h2 className="titre-voie text-[28px] text-rail-100">Émettre une clé</h2>
        <div className="rounded-xl border border-rail-800 bg-rail-900/40 p-5">
          <FormulaireNouvelleCle />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="titre-voie text-[28px] text-rail-100">Clés d&apos;API</h2>
        <div className="overflow-x-auto rounded-xl border border-rail-800">
          <table className="w-full min-w-[46rem] border-collapse text-left text-[13px]">
            <thead className="etiquette bg-rail-900 text-rail-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Canal</th>
                <th className="px-4 py-2.5 font-medium">Préfixe</th>
                <th className="px-4 py-2.5 font-medium">Consommation</th>
                <th className="px-4 py-2.5 font-medium">État</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {cles.map((cle, index) => {
                const etat = etats[index];
                const proportion = Math.min(100, Math.round((etat.used / etat.quota) * 100));

                return (
                  <tr key={cle.id} className="border-t border-rail-800/70">
                    <td className="px-4 py-3">
                      <p className="text-rail-100">{cle.name}</p>
                      <p className="text-[11px] text-rail-600">
                        émise le{" "}
                        {new Date(cle.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-[12px] text-rail-300">{cle.prefix}…</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-2 w-28 overflow-hidden bg-rail-800"
                          role="img"
                          aria-label={`${proportion} % du quota consommé`}
                        >
                          <div
                            className={`h-full ${proportion >= 90 ? "bg-rouge-500" : "bg-signal-500"}`}
                            style={{ width: `${proportion}%` }}
                          />
                        </div>
                        <span className="font-mono text-[12px] text-rail-400">
                          {etat.used.toLocaleString("fr-FR")} / {etat.quota.toLocaleString("fr-FR")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {cle.revoked_at ? (
                        <span className="etiquette bg-rouge-500 px-1.5 py-0.5 text-rail-950">
                          révoquée
                        </span>
                      ) : (
                        <span className="etiquette bg-vert-500 px-1.5 py-0.5 text-rail-950">
                          active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cle.revoked_at ? null : (
                        <form action={revoquerCle}>
                          <input type="hidden" name="id" value={cle.id} />
                          <button className="rounded-md border border-rail-700 px-2.5 py-1 text-[12px] text-rail-300 transition-colors hover:border-rouge-500/60 hover:text-rouge-500">
                            Révoquer
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-rail-600">
          La révocation prend effet immédiatement : l&apos;appel suivant reçoit un 401.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="titre-voie text-[28px] text-rail-100">Derniers appels</h2>
        {journal.length === 0 ? (
          <p className="text-[14px] text-rail-400">
            Aucun appel enregistré pour l&apos;instant. Le portail de documentation en produit dès
            qu&apos;on y clique sur « Envoyer ».
          </p>
        ) : (
          <ul className="divide-y divide-rail-800/70 overflow-hidden rounded-xl border border-rail-800">
            {journal.map((entree, index) => (
              <li
                key={`${entree.at}-${index}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[13px]"
              >
                <span
                  className={`font-mono text-[12px] ${
                    entree.status < 300
                      ? "text-vert-500"
                      : entree.status < 500
                        ? "text-signal-500"
                        : "text-rouge-500"
                  }`}
                >
                  {entree.status}
                </span>
                <span className="text-rail-100">{entree.operation}</span>
                <span className="ml-auto font-mono text-[12px] text-rail-600">
                  {new Date(entree.at).toLocaleTimeString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tuile({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div className="border-b border-r border-rail-800 p-5">
      <p className="chiffres titre-voie text-[48px] text-rail-100">{valeur}</p>
      <p className="etiquette mt-2 text-rail-500">{libelle}</p>
    </div>
  );
}
