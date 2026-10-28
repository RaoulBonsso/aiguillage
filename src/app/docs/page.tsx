import type { Metadata } from "next";
import { loadSpec } from "@/lib/contract";
import { baseUrl, contraintes, operationsParTheme, typeLisible } from "@/lib/spec-view";
import { SchemaView } from "@/components/docs/SchemaView";
import { TryIt } from "@/components/docs/TryIt";
import { demoSecret } from "@/lib/api-context";
import { offers } from "@/data/catalog";

// Le catalogue est un horaire glissant : on régénère la page chaque heure pour
// que les exemples de la doc restent des exemples qui aboutissent.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Le portail de documentation de l'API Aiguillage, généré depuis le contrat OpenAPI et testable en ligne.",
};

/**
 * Le portail de documentation.
 *
 * Rien ici n'est écrit à la main : titres, descriptions, paramètres, schémas et
 * exemples proviennent tous de `spec/openapi.yaml`. Ajouter un champ à la spec
 * le fait apparaître ici sans toucher à cette page — et les tests de contrat
 * garantissent que l'API le sert vraiment.
 */
export default function DocsPage() {
  const spec = loadSpec();
  const themes = operationsParTheme();
  const base = baseUrl();
  const defauts = valeursDeDepart();

  return (
    <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-12 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <nav className="space-y-5 text-sm">
          {themes.map((theme) => (
            <div key={theme.name}>
              <p className="etiquette mb-2 text-rail-600">
                {theme.name}
              </p>
              <ul className="space-y-0.5">
                {theme.operations.map((operation) => (
                  <li key={operation.id}>
                    <a
                      href={`#${operation.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 font-mono text-[13px] text-rail-300 transition-colors hover:bg-white/[0.04] hover:text-rail-100"
                    >
                      <MethodBadge method={operation.method} />
                      <span className="truncate">{operation.path}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="border-t border-rail-800 pt-4">
            <a
              href="/api/openapi"
              className="font-mono text-[12px] text-rail-400 underline decoration-rail-700 underline-offset-4 transition-colors hover:text-signal-400 hover:decoration-signal-500"
            >
              Télécharger openapi.yaml ↓
            </a>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 space-y-12">
        <header className="space-y-4">
          <p className="etiquette flex items-center gap-3 text-rail-400">
            <span className="pave-voie">02</span>
            Contrat OpenAPI · v{spec.info.version}
          </p>
          <h1 className="titre-voie pt-2 text-[clamp(2.6rem,5vw,4.4rem)] text-rail-100">Documentation de l&apos;API</h1>
          <p className="max-w-2xl text-[17px] leading-relaxed text-rail-300">{spec.info.summary}</p>
          <div className="rail-line" />
          <div className="max-w-2xl space-y-3 text-[14px] leading-relaxed text-rail-300">
            {(spec.info.description ?? "")
              .split("\n\n")
              .filter((bloc) => !bloc.startsWith("##"))
              .map((bloc, index) => (
                <p key={index}>{bloc.replaceAll("**", "").replaceAll("`", "")}</p>
              ))}
          </div>

          <div className="carte grid overflow-hidden sm:grid-cols-[auto_1fr]">
            <span className="m-4 mr-0 hidden w-1 rounded-full bg-gradient-to-b from-signal-500 to-signal-500/20 sm:block" aria-hidden />
            <div className="p-5 sm:pl-2">
            <p className="etiquette mb-2 text-signal-500">Bac à sable public</p>
            <p className="text-[14px] text-rail-300">
              Une clé de bac à sable publique est déjà branchée dans les exemples ci-dessous.
              Aucune inscription : les boutons « Envoyer » appellent l&apos;API en direct.
            </p>
            <code className="mt-3 inline-block max-w-full break-all rounded-lg bg-rail-950 px-2.5 py-1.5 font-mono text-[12px] text-signal-400 ring-1 ring-inset ring-white/[0.08]">{demoSecret()}</code>
            </div>
          </div>
        </header>

        {themes.map((theme, indexTheme) => (
          <section key={theme.name} className="space-y-8">
            <div className="border-t border-rail-100 pt-5">
              <p className="chiffres font-mono text-[12px] text-rail-600">
                {String(indexTheme + 1).padStart(2, "0")} / {String(themes.length).padStart(2, "0")}
              </p>
              <h2 className="titre-voie mt-2 text-[40px] text-rail-100">{theme.name}</h2>
              {theme.description ? (
                <p className="mt-1 text-[14px] text-rail-400">{theme.description}</p>
              ) : null}
            </div>

            {theme.operations.map((operation) => (
              <article
                key={operation.id}
                id={operation.id}
                className="carte scroll-mt-24 space-y-6 p-5 sm:p-7"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <MethodBadge method={operation.method} />
                    <code className="break-all font-mono text-[16px] font-medium text-rail-100">
                      {base}
                      {operation.path}
                    </code>
                  </div>
                  <h3 className="titre-voie pt-1 text-[26px] text-rail-100">{operation.summary}</h3>
                  {operation.description
                    .split("\n\n")
                    .filter(Boolean)
                    .map((bloc, index) => (
                      <p key={index} className="max-w-2xl text-[14px] leading-relaxed text-rail-400">
                        {bloc.replaceAll("**", "").replaceAll("`", "")}
                      </p>
                    ))}
                </div>

                {operation.parameters.length > 0 ? (
                  <div>
                    <h4 className="etiquette mb-3 text-rail-500">
                      Paramètres
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[34rem] border-collapse text-left text-[13px]">
                        <thead>
                          <tr className="border-b border-rail-800 text-[11px] uppercase tracking-wider text-rail-400">
                            <th className="py-1.5 pr-3 font-medium">Nom</th>
                            <th className="py-1.5 pr-3 font-medium">Type</th>
                            <th className="py-1.5 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {operation.parameters.map((parametre) => (
                            <tr key={parametre.name} className="border-b border-rail-800/50 align-top">
                              <td className="py-2 pr-3">
                                <code className="font-mono text-rail-100">{parametre.name}</code>
                                {parametre.required ? (
                                  <span className="ml-1 text-signal-500">*</span>
                                ) : null}
                                <span className="ml-1.5 text-[11px] text-rail-600">{parametre.in}</span>
                              </td>
                              <td className="py-2 pr-3">
                                <span className="font-mono text-[12px] text-signal-400">
                                  {typeLisible(parametre.schema)}
                                </span>
                                {contraintes(parametre.schema).map((regle) => (
                                  <span key={regle} className="mt-0.5 block text-[11px] text-rail-600">
                                    {regle}
                                  </span>
                                ))}
                              </td>
                              <td className="py-2 text-rail-400">{parametre.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                <div>
                  <h4 className="etiquette mb-3 text-rail-500">
                    Réponses
                  </h4>
                  <div className="space-y-3">
                    {operation.responses.map((reponse) => (
                      <details
                        key={reponse.status}
                        open={reponse.status.startsWith("2")}
                        className="overflow-hidden rounded-xl bg-rail-950 ring-1 ring-inset ring-white/[0.07]"
                      >
                        <summary className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2 text-[13px]">
                          <StatusBadge status={reponse.status} />
                          <span className="text-rail-300">{reponse.description}</span>
                        </summary>
                        <div className="border-t border-white/[0.06] p-3.5">
                          {reponse.schema ? <SchemaView schema={reponse.schema} /> : null}
                          {reponse.example ? (
                            <pre className="bloc-code mt-3 rounded-md border border-rail-800 bg-rail-950 p-3 text-rail-400">
                              {JSON.stringify(reponse.example, null, 2)}
                            </pre>
                          ) : null}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>

                <TryIt
                  method={operation.method}
                  path={operation.path}
                  baseUrl={base}
                  parameters={operation.parameters}
                  demoKey={demoSecret()}
                  defauts={defauts}
                />
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * Des valeurs d'essai qui aboutissent vraiment.
 *
 * Elles sont tirées du catalogue courant, pas écrites en dur : un exemple de
 * documentation qui renvoie une liste vide six mois après la mise en ligne
 * décrédibilise tout le portail.
 */
function valeursDeDepart(): Record<string, string> {
  const echantillon = offers.find((offre) => offre.segments.length === 1) ?? offers[0];
  return {
    origin: echantillon.origin,
    destination: echantillon.destination,
    date: echantillon.departure.slice(0, 10),
    offerId: echantillon.id,
    q: "paris",
  };
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span className="badge badge-vert font-semibold">
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const couleur = status.startsWith("2") ? "badge-vert" : status.startsWith("4") ? "badge-signal" : "badge-rouge";

  return <span className={`badge font-semibold ${couleur}`}>{status}</span>;
}
