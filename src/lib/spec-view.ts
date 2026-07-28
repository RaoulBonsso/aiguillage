import { loadSpec, type OperationObject, type ParameterObject, type ResponseObject } from "@/lib/contract";

/**
 * Ce qu'il faut pour *afficher* le contrat : résolution des `$ref`, opérations
 * regroupées par thème, paramètres et réponses aplatis.
 *
 * Le portail ne contient aucune description écrite à la main. Tout ce qu'il
 * montre vient de `spec/openapi.yaml` — c'est la seule façon d'avoir une
 * documentation qui ne se périme pas.
 */

export type SchemaNode = Record<string, unknown>;

/** Résout un `$ref` interne (`#/components/...`) et renvoie le nœud pointé. */
export function resolveRef(node: SchemaNode | undefined): SchemaNode | undefined {
  if (!node) return undefined;
  const ref = node.$ref;
  if (typeof ref !== "string" || !ref.startsWith("#/")) return node;

  const chemin = ref.slice(2).split("/");
  let courant: unknown = loadSpec();
  for (const segment of chemin) {
    courant = (courant as Record<string, unknown>)?.[segment];
  }
  // Un `$ref` peut pointer vers un nœud qui en contient un autre.
  return resolveRef(courant as SchemaNode);
}

/** Le nom court d'un schéma référencé, pour l'afficher au lieu de son contenu. */
export function refName(node: SchemaNode | undefined): string | undefined {
  const ref = node?.$ref;
  return typeof ref === "string" ? ref.split("/").pop() : undefined;
}

export type OperationView = {
  id: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  tag: string;
  parameters: ParameterObject[];
  responses: Array<{ status: string; description: string; schema?: SchemaNode; example?: unknown }>;
};

export type TagView = {
  name: string;
  description: string;
  operations: OperationView[];
};

function parametres(operation: OperationObject): ParameterObject[] {
  return (operation.parameters ?? []).map(
    (parametre) => (resolveRef(parametre as SchemaNode) as unknown as ParameterObject) ?? parametre,
  );
}

function reponses(operation: OperationObject): OperationView["responses"] {
  return Object.entries(operation.responses).map(([status, brute]) => {
    const resolue = (resolveRef(brute as SchemaNode) as unknown as ResponseObject) ?? brute;
    const media = Object.values(resolue.content ?? {})[0];
    return {
      status,
      description: resolue.description ?? "",
      schema: media?.schema as SchemaNode | undefined,
      example: media?.example,
    };
  });
}

/** Toutes les opérations du contrat, regroupées par thème et dans l'ordre de la spec. */
export function operationsParTheme(): TagView[] {
  const spec = loadSpec();
  const themes = new Map<string, TagView>();

  for (const theme of spec.tags ?? []) {
    themes.set(theme.name, { name: theme.name, description: theme.description ?? "", operations: [] });
  }

  for (const [chemin, methodes] of Object.entries(spec.paths)) {
    for (const [methode, operation] of Object.entries(methodes)) {
      const nomTheme = operation.tags?.[0] ?? "Autres";
      if (!themes.has(nomTheme)) {
        themes.set(nomTheme, { name: nomTheme, description: "", operations: [] });
      }

      themes.get(nomTheme)!.operations.push({
        id: operation.operationId,
        method: methode.toUpperCase(),
        path: chemin,
        summary: operation.summary ?? operation.operationId,
        description: operation.description ?? "",
        tag: nomTheme,
        parameters: parametres(operation),
        responses: reponses(operation),
      });
    }
  }

  return [...themes.values()].filter((theme) => theme.operations.length > 0);
}

/** Le préfixe d'URL des opérations, tel que déclaré dans `servers`. */
export function baseUrl(): string {
  return loadSpec().servers?.[0]?.url ?? "/api/v1";
}

/** Une phrase courte décrivant un type, pour les tableaux de paramètres. */
export function typeLisible(schema: SchemaNode | undefined): string {
  const resolu = resolveRef(schema);
  if (!resolu) return "—";

  const nom = refName(schema);
  const type = typeof resolu.type === "string" ? resolu.type : undefined;

  if (Array.isArray(resolu.enum)) {
    return resolu.enum.join(" · ");
  }
  if (type === "array") {
    return `tableau de ${refName(resolu.items as SchemaNode) ?? typeLisible(resolu.items as SchemaNode)}`;
  }
  if (nom && type !== "object") return nom;

  const format = typeof resolu.format === "string" ? ` (${resolu.format})` : "";
  return `${type ?? nom ?? "objet"}${format}`;
}

/** Les contraintes d'un paramètre, formulées en français plutôt qu'en JSON Schema. */
export function contraintes(schema: SchemaNode | undefined): string[] {
  const resolu = resolveRef(schema);
  if (!resolu) return [];

  const regles: string[] = [];
  if (typeof resolu.pattern === "string") regles.push(`motif ${resolu.pattern}`);
  if (typeof resolu.minimum === "number") regles.push(`min. ${resolu.minimum}`);
  if (typeof resolu.maximum === "number") regles.push(`max. ${resolu.maximum}`);
  if (typeof resolu.minLength === "number") regles.push(`${resolu.minLength} caractère(s) min.`);
  if (typeof resolu.maxLength === "number") regles.push(`${resolu.maxLength} caractères max.`);
  if (resolu.default !== undefined) regles.push(`défaut : ${String(resolu.default)}`);
  return regles;
}
