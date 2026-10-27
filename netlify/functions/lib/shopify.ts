// Shopify calls made from Netlify Functions. The Admin token and the private Storefront token stay on the server.
const DEFAULT_API_VERSION = "2026-07";

function shopConfig(): { domain: string; version: string } {
  const domain = process.env.VITE_SHOPIFY_DOMAIN?.trim();
  if (!domain) throw new Error("VITE_SHOPIFY_DOMAIN is not set.");
  return { domain, version: process.env.VITE_SHOPIFY_API_VERSION?.trim() || DEFAULT_API_VERSION };
}

let adminToken: { token: string; expiresAt: number } | null = null;

async function requestAdminToken(): Promise<{ token: string; expiresAt: number }> {
  const { domain } = shopConfig();
  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Admin API credentials are not set.");

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !json.access_token) throw new Error(`Admin token request failed with status ${res.status}.`);
  return { token: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
}

// Tokens last about a day. Refresh five minutes early, and again after a 401.
async function currentAdminToken(): Promise<string> {
  if (!adminToken || Date.now() > adminToken.expiresAt - 5 * 60_000) adminToken = await requestAdminToken();
  return adminToken.token;
}

export async function adminQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { domain, version } = shopConfig();
  for (let attempt = 0; ; attempt++) {
    const token = await currentAdminToken();
    const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query, variables }),
    });
    if (res.status === 401 && attempt === 0) {
      adminToken = null;
      continue;
    }
    if (!res.ok) throw new Error(`Admin API request failed with status ${res.status}.`);
    const json = (await res.json()) as { data?: T; errors?: unknown };
    if (json.errors) throw new Error(`Admin API error: ${JSON.stringify(json.errors)}`);
    if (!json.data) throw new Error("Admin API returned no data.");
    return json.data;
  }
}

export async function storefrontPrivateQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { domain, version } = shopConfig();
  const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (!token) throw new Error("SHOPIFY_STOREFRONT_PRIVATE_TOKEN is not set.");

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Shopify-Storefront-Private-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Storefront request failed with status ${res.status}.`);
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) throw new Error(`Storefront error: ${JSON.stringify(json.errors)}`);
  if (!json.data) throw new Error("Storefront returned no data.");
  return json.data;
}
