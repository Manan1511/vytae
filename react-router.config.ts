import type { Config } from "@react-router/dev/config";
import { loadEnv } from "vite";
import { PRODUCTS } from "./app/content/products";
import { FEATURED, POSTS } from "./app/content/science";

// Prerender paths come from Shopify when the Storefront is configured, so every product and article gets static HTML.
// This file runs in Node, where Vite does not expose .env values, so read them here.
const env: Record<string, string | undefined> = {
  ...loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), ""),
  ...process.env,
};

async function shopifyHandles(): Promise<{ products: string[]; articles: string[] } | null> {
  const domain = env.VITE_SHOPIFY_DOMAIN?.trim();
  const token = env.VITE_SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain || !token) return null;

  const version = env.VITE_SHOPIFY_API_VERSION?.trim() || "2026-07";
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({
      query: `{ products(first: 50) { nodes { handle } } blog(handle: "science") { articles(first: 50) { nodes { handle } } } }`,
    }),
  });
  const json = (await res.json()) as {
    data?: { products: { nodes: { handle: string }[] }; blog: { articles: { nodes: { handle: string }[] } } | null };
    errors?: unknown;
  };
  if (!res.ok || json.errors || !json.data) {
    throw new Error(`Storefront handles query failed: ${JSON.stringify(json.errors ?? res.status)}`);
  }
  return {
    products: json.data.products.nodes.map((n) => n.handle),
    articles: (json.data.blog?.articles.nodes ?? []).map((n) => n.handle),
  };
}

export default {
  ssr: false,
  prerender: async ({ getStaticPaths }) => {
    const live = await shopifyHandles();
    const products = live?.products ?? PRODUCTS.map((p) => p.handle);
    const articles = live?.articles ?? [FEATURED, ...POSTS].map((p) => p.slug);
    return [
      ...getStaticPaths(),
      ...products.map((handle) => `/products/${handle}`),
      ...articles.map((slug) => `/science/${slug}`),
      "/policies/privacy",
      "/policies/refund",
      "/policies/terms",
    ];
  },
} satisfies Config;
