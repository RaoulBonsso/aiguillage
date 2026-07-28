import { findOffer } from "@/data/catalog";
import { jsonResponse, withApiKey } from "@/lib/handler";
import { problemResponse, problems } from "@/lib/problem";

type Route = { params: Promise<{ offerId: string }> };

/** `getOffer` — voir `spec/openapi.yaml`, chemin `/offers/{offerId}`. */
export const GET = withApiKey<Route>("getOffer", async (_request, { route }) => {
  const { offerId } = await route.params;
  const offre = findOffer(offerId);

  if (!offre) {
    return problemResponse(problems.notFound(`Aucune offre ne porte l'identifiant ${offerId}.`));
  }

  return jsonResponse({ data: offre });
});
