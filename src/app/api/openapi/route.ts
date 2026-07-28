import { rawSpec } from "@/lib/contract";

/**
 * Le contrat brut, servi tel quel.
 *
 * C'est ce que télécharge un intégrateur pour générer son client, et ce que
 * consomme un outil de test de contrat côté consommateur. Le portail est une
 * lecture agréable du contrat ; ce fichier est le contrat.
 */
export function GET(): Response {
  return new Response(rawSpec(), {
    headers: {
      "content-type": "application/yaml; charset=utf-8",
      "content-disposition": 'inline; filename="aiguillage-openapi.yaml"',
      "cache-control": "public, max-age=300",
    },
  });
}
