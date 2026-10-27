import { writeFile } from "node:fs/promises";
import { join } from "node:path";
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

// Netlify sets URL during builds, so the sitemap works there before the client's own domain is set.
const SITE_URL = (env.VITE_SITE_URL || env.URL || "").trim().replace(/\/+$/, "");

// Pages that are not in the sitemap: the bag and checkout, the account, and the confirmation page.
const STATIC_PAGES = ["/", "/shop", "/science", "/about", "/contact", "/batch"];
const PRIVATE_PATHS = ["/bag", "/account", "/admin"];

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

// The product, article and policy pages that are prerendered. Built once per build, then shared by the prerender and
// the sitemap, so the two cannot disagree.
let dynamicPaths: Promise<{ products: string[]; articles: string[]; policies: string[] }> | null = null;

function pagesToRender(): Promise<{ products: string[]; articles: string[]; policies: string[] }> {
  dynamicPaths ??= (async () => {
    const live = await shopifyHandles();
    return {
      products: live?.products ?? PRODUCTS.map((p) => p.handle),
      articles: live?.articles ?? [FEATURED, ...POSTS].map((p) => p.slug),
      policies: ["privacy", "refund", "terms"],
    };
  })();
  return dynamicPaths;
}

async function writeSearchFiles(): Promise<void> {
  const out = join(process.cwd(), "build", "client");
  const pages = await pagesToRender();

  const sitemap = SITE_URL
    ? [
        ...STATIC_PAGES,
        ...pages.products.map((handle) => `/products/${handle}`),
        ...pages.articles.map((slug) => `/science/${slug}`),
        ...pages.policies.map((doc) => `/policies/${doc}`),
      ]
    : [];

  const robots = [
    "User-agent: *",
    "Allow: /",
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
    ...(SITE_URL ? [`Sitemap: ${SITE_URL}/sitemap.xml`] : []),
    "",
  ].join("\n");
  await writeFile(join(out, "robots.txt"), robots);

  if (!SITE_URL) {
    console.warn("VITE_SITE_URL is not set, so sitemap.xml was not written.");
    return;
  }
  const entries = sitemap.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n");
  await writeFile(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
}

export default {
  ssr: false,
  prerender: async ({ getStaticPaths }) => {
    const pages = await pagesToRender();
    return [
      ...getStaticPaths(),
      ...pages.products.map((handle) => `/products/${handle}`),
      ...pages.articles.map((slug) => `/science/${slug}`),
      ...pages.policies.map((doc) => `/policies/${doc}`),
    ];
  },
  buildEnd: writeSearchFiles,
} satisfies Config;
