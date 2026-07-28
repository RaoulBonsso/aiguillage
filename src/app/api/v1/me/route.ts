import { apiKeys } from "@/lib/api-context";
import { jsonResponse, withApiKey } from "@/lib/handler";

/**
 * `getCurrentKey` — voir `spec/openapi.yaml`, chemin `/me`.
 *
 * Ne consomme pas de quota : demander « combien me reste-t-il ? » ne doit pas
 * en retirer un.
 */
export const GET = withApiKey(
  "getCurrentKey",
  async (_request, { key }) => jsonResponse({ data: await (await apiKeys()).status(key.id) }),
  { consumesQuota: false },
);
