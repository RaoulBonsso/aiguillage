import { offers } from "@/data/catalog";
import { searchOffers } from "@/domain/search";
import { jsonResponse, offersQuery, parseQuery, withApiKey } from "@/lib/handler";

/** `searchOffers` — voir `spec/openapi.yaml`, chemin `/offers`. */
export const GET = withApiKey("searchOffers", async (request) => {
  const parametres = parseQuery(offersQuery, request);
  if (!parametres.ok) return parametres.response;

  return jsonResponse(searchOffers(offers, parametres.value));
});
