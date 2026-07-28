import { stations } from "@/data/catalog";
import { listStations } from "@/domain/search";
import { jsonResponse, parseQuery, stationsQuery, withApiKey } from "@/lib/handler";

/** `listStations` — voir `spec/openapi.yaml`, chemin `/stations`. */
export const GET = withApiKey("listStations", async (request) => {
  const parametres = parseQuery(stationsQuery, request);
  if (!parametres.ok) return parametres.response;

  return jsonResponse(listStations(stations, parametres.value));
});
