import { z } from "zod";
import { apiKeys } from "@/lib/api-context";
import { problemResponse, problems, type FieldError } from "@/lib/problem";
import type { ApiKeyView } from "@/domain/ports";

/**
 * Tout ce qu'une opération publique doit faire *autour* de son métier :
 * authentifier la clé, décompter le quota, poser les en-têtes `RateLimit-*`,
 * journaliser l'appel. Écrit une fois ici, jamais recopié dans les handlers —
 * une garantie qu'on réimplémente à chaque route est une garantie qu'on oublie.
 */

/** `route` porte ce que Next.js passe au handler : les paramètres de chemin. */
type Contexte<R> = { key: ApiKeyView; route: R };

type Options = {
  /** `/me` doit pouvoir être appelée sans entamer le quota qu'elle rapporte. */
  consumesQuota?: boolean;
};

// `R = unknown` par défaut : les routes statiques ignorent le second argument,
// mais Next.js le passe quand même. Le typer en `unknown` accepte ce qu'il
// envoie sans obliger chaque route sans paramètre à déclarer une forme vide.
export function withApiKey<R = unknown>(
  operation: string,
  handler: (request: Request, contexte: Contexte<R>) => Promise<Response>,
  options: Options = {},
): (request: Request, route?: R) => Promise<Response> {
  const consomme = options.consumesQuota ?? true;

  return async (request: Request, route?: R): Promise<Response> => {
    const service = await apiKeys();
    const secret = request.headers.get("x-api-key") ?? "";
    const key = await service.authenticate(secret);

    if (!key) {
      return problemResponse(problems.unauthorized());
    }

    let entetes: Record<string, string> = {};

    if (consomme) {
      const decision = await service.consume(key.id);
      entetes = {
        "RateLimit-Limit": String(decision.limit),
        "RateLimit-Remaining": String(decision.remaining),
        "RateLimit-Reset": String(decision.resetSeconds),
      };

      if (!decision.allowed) {
        await service.record(key.id, { operation, status: 429 });
        return problemResponse(problems.quotaExceeded(decision.resetSeconds), entetes);
      }
    }

    const reponse = await handler(request, { key, route: route as R });
    for (const [nom, valeur] of Object.entries(entetes)) {
      reponse.headers.set(nom, valeur);
    }

    await service.record(key.id, { operation, status: reponse.status });
    return reponse;
  };
}

/** Réponse JSON standard des opérations qui aboutissent. */
export function jsonResponse(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/**
 * Valide les paramètres de requête contre un schéma Zod.
 *
 * Les messages sont en français et désignent le champ fautif : une erreur 400
 * qui dit seulement « invalide » fait perdre une heure à l'intégrateur.
 */
export function parseQuery<T extends z.ZodType>(
  schema: T,
  request: Request,
): { ok: true; value: z.infer<T> } | { ok: false; response: Response } {
  const url = new URL(request.url);
  const brut: Record<string, string> = {};
  for (const [nom, valeur] of url.searchParams.entries()) {
    if (valeur !== "") brut[nom] = valeur;
  }

  const resultat = schema.safeParse(brut);
  if (resultat.success) {
    return { ok: true, value: resultat.data };
  }

  const errors: FieldError[] = resultat.error.issues.map((issue) => ({
    field: issue.path.join(".") || "(requête)",
    message: issue.message,
  }));

  return { ok: false, response: problemResponse(problems.invalidRequest(errors)) };
}

const codeGare = z
  .string()
  .regex(/^[A-Z]{2}[A-Z0-9]{3}$/, "Code gare attendu : 2 lettres de pays puis 3 caractères (ex. FRPAR).");

const jourCivil = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu AAAA-MM-JJ.")
  .refine((valeur) => !Number.isNaN(Date.parse(`${valeur}T00:00:00Z`)), "Date inexistante.");

const page = z.coerce.number().int("Nombre entier attendu.").min(1, "La page commence à 1.").default(1);

const limit = z.coerce
  .number()
  .int("Nombre entier attendu.")
  .min(1, "Au moins un élément par page.")
  .max(100, "Cent éléments par page au maximum.")
  .default(20);

export const stationsQuery = z.object({
  q: z.string().min(1).max(64).optional(),
  page,
  limit,
});

export const offersQuery = z.object({
  origin: codeGare,
  destination: codeGare,
  date: jourCivil,
  passengers: z.coerce
    .number()
    .int("Nombre entier attendu.")
    .min(1, "Au moins un voyageur.")
    .max(9, "Neuf voyageurs au maximum par recherche.")
    .default(1),
  fare: z.enum(["eco", "semi_flex", "flex"]).optional(),
  page,
  limit,
});
