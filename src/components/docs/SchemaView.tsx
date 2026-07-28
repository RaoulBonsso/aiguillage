import { refName, resolveRef, typeLisible, type SchemaNode } from "@/lib/spec-view";

/**
 * Rend un schéma JSON en arbre lisible.
 *
 * On affiche le nom du schéma référencé plutôt que de recopier son contenu à
 * chaque usage : un intégrateur retient « une Offer contient des Fare » bien
 * mieux qu'un pavé de trois cents lignes déplié six fois.
 */

const PROFONDEUR_MAX = 3;

export function SchemaView({
  schema,
  profondeur = 0,
}: {
  schema: SchemaNode | undefined;
  profondeur?: number;
}) {
  const resolu = resolveRef(schema);
  if (!resolu) return null;

  if (resolu.type === "array") {
    const items = resolu.items as SchemaNode | undefined;
    return (
      <div>
        <p className="mb-1.5 font-mono text-xs text-rail-400">
          tableau de {refName(items) ?? typeLisible(items)}
        </p>
        <SchemaView schema={items} profondeur={profondeur} />
      </div>
    );
  }

  const proprietes = resolu.properties as Record<string, SchemaNode> | undefined;
  if (!proprietes) {
    return <p className="font-mono text-xs text-rail-300">{typeLisible(resolu)}</p>;
  }

  const requis = new Set((resolu.required as string[]) ?? []);

  return (
    <ul className="space-y-1.5">
      {Object.entries(proprietes).map(([nom, propriete]) => {
        const cible = resolveRef(propriete);
        const nomSchema = refName(propriete);
        const imbrique =
          profondeur < PROFONDEUR_MAX &&
          (cible?.properties !== undefined || cible?.type === "array");

        return (
          <li key={nom} className="border-l border-rail-800 pl-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <code className="font-mono text-[13px] text-rail-100">{nom}</code>
              <span className="font-mono text-[11px] text-signal-400">{typeLisible(propriete)}</span>
              {requis.has(nom) ? (
                <span className="rounded bg-rail-800 px-1.5 py-px text-[10px] uppercase tracking-wide text-rail-300">
                  requis
                </span>
              ) : null}
            </div>
            {typeof cible?.description === "string" ? (
              <p className="mt-0.5 text-[13px] leading-snug text-rail-400">{cible.description}</p>
            ) : null}
            {imbrique ? (
              <div className="mt-1.5">
                {nomSchema && profondeur >= 1 ? null : (
                  <SchemaView schema={propriete} profondeur={profondeur + 1} />
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
