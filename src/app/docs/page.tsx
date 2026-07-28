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
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[15rem_1fr]">
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <nav className="space-y-5 text-sm">
          {themes.map((theme) => (
            <div key={theme.name}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-rail-400">
                {theme.name}
              </p>
              <ul className="space-y-0.5">
                {theme.operations.map((operation) => (
                  <li key={operation.id}>
                    <a
                      href={`#${operation.id}`}
                      className="flex items-baseline gap-2 rounded-md px-2 py-1 text-rail-300 transition-colors hover:bg-rail-850 hover:text-rail-100"
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
              className="rounded-md px-2 py-1 text-rail-400 transition-colors hover:text-signal-400"
            >
              Télécharger openapi.yaml ↓
            </a>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 space-y-12">
        <header className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-wider text-signal-500">
            {spec.info.title} · v{spec.info.version}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Documentation de l&apos;API</h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-rail-300">{spec.info.summary}</p>
          <div className="rail-line" />
          <div className="max-w-2xl space-y-3 text-[14px] leading-relaxed text-rail-300">
            {(spec.info.description ?? "")
              .split("\n\n")
              .filter((bloc) => !bloc.startsWith("##"))
              .map((bloc, index) => (
                <p key={index}>{bloc.replaceAll("**", "").replaceAll("`", "")}</p>
              ))}
          </div>

          <div className="rounded-lg border border-signal-500/25 bg-signal-500/5 p-4">
            <p className="text-[13px] text-rail-300">
              Une clé de bac à sable publique est déjà branchée dans les exemples ci-dessous.
              Aucune inscription : les boutons « Envoyer » appellent l&apos;API en direct.
            </p>
            <code className="mt-2 block font-mono text-[12px] text-signal-400">{demoSecret()}</code>
          </div>
        </header>

        {themes.map((theme) => (
          <section key={theme.name} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{theme.name}</h2>
              {theme.description ? (
                <p className="mt-1 text-[14px] text-rail-400">{theme.description}</p>
              ) : null}
            </div>

            {theme.operations.map((operation) => (
              <article
                key={operation.id}
                id={operation.id}
                className="scroll-mt-20 space-y-5 rounded-xl border border-rail-800 bg-rail-900/40 p-5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <MethodBadge method={operation.method} />
                    <code className="font-mono text-[15px] text-rail-100">
                      {base}
                      {operation.path}
                    </code>
                  </div>
                  <h3 className="text-[15px] font-medium text-rail-100">{operation.summary}</h3>
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
                    <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-rail-400">
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
                  <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-rail-400">
                    Réponses
                  </h4>
                  <div className="space-y-3">
                    {operation.responses.map((reponse) => (
                      <details
                        key={reponse.status}
                        open={reponse.status.startsWith("2")}
                        className="rounded-lg border border-rail-800 bg-rail-950/50"
                      >
                        <summary className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2 text-[13px]">
                          <StatusBadge status={reponse.status} />
                          <span className="text-rail-300">{reponse.description}</span>
                        </summary>
                        <div className="border-t border-rail-800 p-3.5">
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
    <span className="rounded bg-vert-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-vert-500">
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const couleur = status.startsWith("2")
    ? "bg-vert-500/15 text-vert-500"
    : status.startsWith("4")
      ? "bg-signal-500/15 text-signal-500"
      : "bg-rouge-500/15 text-rouge-500";

  return <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${couleur}`}>{status}</span>;
}
