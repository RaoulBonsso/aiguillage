/**
 * Les erreurs au format RFC 9457 (`application/problem+json`).
 *
 * Le champ qui compte est `type` : c'est un identifiant stable, documenté, sur
 * lequel un intégrateur branche son code. `title` et `detail` sont pour l'humain
 * qui lit les logs et peuvent être reformulés sans casser personne.
 */

const BASE_TYPE = "https://aiguillage.dev/problems";

export type FieldError = { field: string; message: string };

export type Problem = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: FieldError[];
};

export function problemResponse(problem: Problem, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(problem), {
    status: problem.status,
    headers: { "content-type": "application/problem+json; charset=utf-8", ...headers },
  });
}

export const problems = {
  invalidRequest(errors: FieldError[]): Problem {
    return {
      type: `${BASE_TYPE}/invalid-request`,
      title: "Requête invalide",
      status: 400,
      detail: "Un ou plusieurs paramètres sont invalides.",
      errors,
    };
  },

  unauthorized(detail = "Fournissez une clé valide dans l'en-tête X-API-Key."): Problem {
    return {
      type: `${BASE_TYPE}/unauthorized`,
      title: "Clé d'API invalide",
      status: 401,
      detail,
    };
  },

  notFound(detail: string): Problem {
    return {
      type: `${BASE_TYPE}/not-found`,
      title: "Ressource introuvable",
      status: 404,
      detail,
    };
  },

  quotaExceeded(resetSeconds: number): Problem {
    return {
      type: `${BASE_TYPE}/quota-exceeded`,
      title: "Quota dépassé",
      status: 429,
      detail: `Quota épuisé pour la période en cours. Réarmement dans ${resetSeconds} secondes.`,
    };
  },
};
