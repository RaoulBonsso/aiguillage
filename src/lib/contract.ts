import { readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

/**
 * Le contrat OpenAPI chargé comme donnée exécutable.
 *
 * Ce module existe pour une seule raison : empêcher la spec et le code de
 * diverger. Une documentation qui ment est pire que pas de documentation, donc
 * ici la spec n'est pas un commentaire — c'est ce contre quoi les tests
 * assertent, et ce que le portail affiche.
 */

export type OpenApiDocument = {
  openapi: string;
  info: { title: string; version: string; summary?: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
  paths: Record<string, Record<string, OperationObject>>;
  components: {
    schemas: Record<string, unknown>;
    parameters?: Record<string, ParameterObject>;
    responses?: Record<string, ResponseObject>;
    securitySchemes?: Record<string, unknown>;
    headers?: Record<string, unknown>;
  };
};

export type ParameterObject = {
  name: string;
  in: "query" | "path" | "header";
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
  example?: unknown;
  $ref?: string;
};

export type ResponseObject = {
  description?: string;
  headers?: Record<string, unknown>;
  content?: Record<string, { schema?: Record<string, unknown>; example?: unknown }>;
  $ref?: string;
};

export type OperationObject = {
  operationId: string;
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  responses: Record<string, ResponseObject>;
};

const SPEC_PATH = path.join(process.cwd(), "spec", "openapi.yaml");
const SPEC_ID = "openapi.yaml";

let cached: OpenApiDocument | null = null;

/** Le document OpenAPI, lu une seule fois puis mémorisé. */
export function loadSpec(): OpenApiDocument {
  if (!cached) {
    cached = YAML.parse(readFileSync(SPEC_PATH, "utf8")) as OpenApiDocument;
  }
  return cached;
}

/** Le contrat sous forme de texte brut — le portail le sert tel quel. */
export function rawSpec(): string {
  return readFileSync(SPEC_PATH, "utf8");
}

const ajv = (() => {
  // strict: false — un document OpenAPI porte des mots-clés (summary, example,
  // tags) qui ne sont pas du JSON Schema. Ils décrivent, ils ne valident pas.
  const instance = new Ajv2020({ strict: false, allErrors: true });
  addFormats(instance);
  instance.addSchema(loadSpec() as unknown as object, SPEC_ID);
  return instance;
})();

const validators = new Map<string, ValidateFunction>();

function compile(ref: string): ValidateFunction {
  const existing = validators.get(ref);
  if (existing) return existing;
  const validate = ajv.compile({ $ref: `${SPEC_ID}${ref}` });
  validators.set(ref, validate);
  return validate;
}

/** Valide une valeur contre un schéma nommé de la spec (`components.schemas`). */
export function validateSchema(schemaName: string, value: unknown): ValidationResult {
  return run(compile(`#/components/schemas/${schemaName}`), value);
}

/**
 * Valide un corps de réponse contre ce que la spec promet pour ce couple
 * (chemin, méthode, statut). C'est l'assertion qui rend la doc non négociable.
 */
export function validateResponse(
  pathTemplate: string,
  method: string,
  status: number,
  body: unknown,
): ValidationResult {
  const responses = loadSpec().paths[pathTemplate]?.[method.toLowerCase()]?.responses;
  if (!responses) {
    return { valid: false, errors: [`La spec ne décrit pas ${method.toUpperCase()} ${pathTemplate}.`] };
  }

  const response = resolveResponse(responses[String(status)]);
  if (!response) {
    return {
      valid: false,
      errors: [`La spec ne décrit pas le statut ${status} pour ${method.toUpperCase()} ${pathTemplate}.`],
    };
  }

  const content = response.content ?? {};
  const mediaType = Object.keys(content)[0];
  const schema = mediaType ? content[mediaType]?.schema : undefined;
  if (!schema) return { valid: true, errors: [] };

  return run(ajv.compile(inlineRefs(schema)), body);
}

/** Résout un `$ref` vers `components.responses`, sinon renvoie la réponse telle quelle. */
function resolveResponse(response: ResponseObject | undefined): ResponseObject | undefined {
  if (!response) return undefined;
  if (!response.$ref) return response;
  const name = response.$ref.split("/").pop() as string;
  return loadSpec().components.responses?.[name];
}

/**
 * Réécrit les `$ref` internes du document (`#/components/...`) pour qu'ils
 * pointent vers le schéma enregistré dans Ajv. Sans ça, un schéma extrait du
 * document perd la racine à laquelle ses références se rapportent.
 */
function inlineRefs<T>(node: T): T {
  if (Array.isArray(node)) return node.map(inlineRefs) as T;
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] =
        key === "$ref" && typeof value === "string" && value.startsWith("#/")
          ? `${SPEC_ID}${value}`
          : inlineRefs(value);
    }
    return out as T;
  }
  return node;
}

export type ValidationResult = { valid: boolean; errors: string[] };

function run(validate: ValidateFunction, value: unknown): ValidationResult {
  const valid = validate(value) as boolean;
  return {
    valid,
    errors: (validate.errors ?? []).map(
      (error) => `${error.instancePath || "(racine)"} ${error.message ?? "invalide"}`,
    ),
  };
}
