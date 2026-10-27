// Shopify Storefront API client for browser reads. Uses the public token only.
// The private token is server-only and is never read here.

function normalizeDomain(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

const DOMAIN = normalizeDomain(import.meta.env.VITE_SHOPIFY_DOMAIN);
const TOKEN = String(import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN ?? "").trim();
const API_VERSION = String(import.meta.env.VITE_SHOPIFY_API_VERSION ?? "").trim() || "2026-07";

// Pages keep their mock content until both values are set.
export const storefrontEnabled = DOMAIN !== "" && TOKEN !== "";

export class StorefrontError extends Error {}

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

export async function storefrontQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!storefrontEnabled) throw new StorefrontError("Shopify Storefront is not configured");

  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new StorefrontError(`Storefront request failed with status ${res.status}`);

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new StorefrontError(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new StorefrontError("Storefront response had no data");
  return json.data;
}
