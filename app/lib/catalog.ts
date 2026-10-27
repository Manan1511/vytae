// Page data. Reads Shopify through the public Storefront token when it is configured. Otherwise it returns the
// content in app/content, which the seed writes to Shopify, so the site works without a store.
import { useEffect, useState } from "react";
import { BATCHES, type Batch } from "../content/batches";
import { HERO, REVIEWS } from "../content/home";
import { POLICIES, policyHtml, type Policy } from "../content/policies";
import { PRODUCTS, SHOP_BANNERS, type Product } from "../content/products";
import { FEATURED, HOME_ARTICLE_SLUGS, MORE_SLUGS, POSTS, articleBodyHtml, type Post } from "../content/science";
import { storefrontEnabled, storefrontQuery } from "./shopify/storefront";

export type { Batch, Post, Product };

export type HeroSlide = { eyebrow: string; headline: string; lead: string; image: string; alt: string };
export type ShopBannerSlide = (typeof SHOP_BANNERS)[number];
export type Testimonial = { quote: string; name: string; product: string };
export type TocItem = { id: string; label: string };
export type ArticleView = { post: Post; html: string; toc: TocItem[]; more: Post[] };
export type PolicyView = { title: string; html: string; toc: TocItem[] };

// Everything on a product except these commerce fields comes from its vytae.content metafield.
type ProductContent = Omit<Product, "handle" | "name" | "price" | "images" | "categories">;

type ProductNode = {
  handle: string;
  title: string;
  priceRange: { minVariantPrice: { amount: string } };
  images: { nodes: { url: string }[] };
  collections: { nodes: { handle: string; title: string }[] };
  content: { value: string } | null;
};

type MetaobjectNode = {
  handle: string;
  fields: { key: string; value: string | null; reference: { image?: { url: string } } | null }[];
};

type ArticleNode = {
  handle: string;
  title: string;
  excerpt: string;
  tags: string[];
  image: { url: string } | null;
  metafield: { value: string } | null;
};

const PRODUCTS_QUERY = `{
  products(first: 50) {
    nodes {
      handle
      title
      priceRange { minVariantPrice { amount } }
      images(first: 10) { nodes { url } }
      collections(first: 10) { nodes { handle title } }
      content: metafield(namespace: "vytae", key: "content") { value }
    }
  }
}`;

const METAOBJECTS_QUERY = `query Metaobjects($type: String!) {
  metaobjects(type: $type, first: 50) {
    nodes {
      handle
      fields { key value reference { ... on MediaImage { image { url } } } }
    }
  }
}`;

const ARTICLES_QUERY = `{
  blog(handle: "science") {
    articles(first: 50) {
      nodes {
        handle
        title
        excerpt
        tags
        image { url }
        metafield(namespace: "vytae", key: "read_time") { value }
      }
    }
  }
}`;

const ARTICLE_BODY_QUERY = `query ArticleBody($handle: String!) {
  blog(handle: "science") { articleByHandle(handle: $handle) { contentHtml } }
}`;

const POLICIES_QUERY = `{
  shop {
    privacyPolicy { body }
    refundPolicy { body }
    termsOfService { body }
  }
}`;

const BATCH_QUERY = `query Batch($handle: MetaobjectHandleInput!) {
  metaobject(handle: $handle) { fields { key value } }
}`;

// Keeps one request in flight and reuses its result. A failed request is dropped, so the next call retries.
function once<T>(load: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => {
    cached ??= load().catch((error: unknown) => {
      cached = undefined;
      throw error;
    });
    return cached;
  };
}

const field = (node: MetaobjectNode, key: string) => node.fields.find((f) => f.key === key)?.value ?? "";
const fileUrl = (node: MetaobjectNode, key: string) => node.fields.find((f) => f.key === key)?.reference?.image?.url ?? "";

// Active entries in sort order. An entry without an active flag counts as active.
function activeInOrder(nodes: MetaobjectNode[]): MetaobjectNode[] {
  return nodes
    .filter((n) => field(n, "active") !== "false")
    .sort((a, b) => Number(field(a, "sort")) - Number(field(b, "sort")));
}

async function metaobjects(type: string): Promise<MetaobjectNode[]> {
  const data = await storefrontQuery<{ metaobjects: { nodes: MetaobjectNode[] } }>(METAOBJECTS_QUERY, { type });
  return data.metaobjects.nodes;
}

// Products keep the order of the content file, which is the order the design shows them in.
const PRODUCT_ORDER = PRODUCTS.map((p) => p.handle);
const productRank = (product: Product) => {
  const i = PRODUCT_ORDER.indexOf(product.handle);
  return i === -1 ? PRODUCT_ORDER.length : i;
};

function toProduct(node: ProductNode): Product | null {
  // A product is listed once its content is set in Shopify.
  if (!node.content) return null;
  return {
    ...(JSON.parse(node.content.value) as ProductContent),
    handle: node.handle,
    name: node.title,
    price: Math.round(Number(node.priceRange.minVariantPrice.amount)),
    images: node.images.nodes.map((image) => image.url),
    // Shopify puts every published product in its default "Home page" collection, which is not a category.
    categories: node.collections.nodes.filter((c) => c.handle !== "frontpage").map((c) => c.title),
  };
}

export const loadCatalog = once(async (): Promise<Product[]> => {
  if (!storefrontEnabled) return PRODUCTS;
  const data = await storefrontQuery<{ products: { nodes: ProductNode[] } }>(PRODUCTS_QUERY);
  return data.products.nodes.flatMap((node) => toProduct(node) ?? []).sort((a, b) => productRank(a) - productRank(b));
});

// Product list for components that run in the browser (the bag). Null until the catalog has loaded.
export function useCatalog(): Product[] | null {
  const [products, setProducts] = useState<Product[] | null>(storefrontEnabled ? null : PRODUCTS);
  useEffect(() => {
    let current = true;
    loadCatalog()
      .then((list) => {
        if (current) setProducts(list);
      })
      .catch((error: unknown) => {
        console.error(error);
        if (current) setProducts([]);
      });
    return () => {
      current = false;
    };
  }, []);
  return products;
}

export const loadHero = once(async (): Promise<HeroSlide[]> => {
  if (!storefrontEnabled) {
    return [{ eyebrow: HERO.eyebrow, headline: HERO.headline, lead: HERO.lead, image: HERO.image, alt: HERO.alt }];
  }
  return activeInOrder(await metaobjects("hero_slide")).map((n) => ({
    eyebrow: field(n, "eyebrow"),
    headline: field(n, "headline"),
    lead: field(n, "lead"),
    image: fileUrl(n, "image"),
    alt: field(n, "image_alt"),
  }));
});

export const loadShopBanners = once(async (): Promise<ShopBannerSlide[]> => {
  if (!storefrontEnabled) return SHOP_BANNERS;
  return activeInOrder(await metaobjects("shop_banner")).map((n) => ({
    eyebrow: field(n, "eyebrow"),
    title: field(n, "title"),
    body: field(n, "body"),
    cta: field(n, "cta"),
    href: field(n, "href"),
    img: fileUrl(n, "image"),
  }));
});

export const loadTestimonials = once(async (): Promise<Testimonial[]> => {
  if (!storefrontEnabled) return REVIEWS;
  return activeInOrder(await metaobjects("testimonial")).map((n) => ({
    quote: field(n, "quote"),
    name: field(n, "name"),
    product: field(n, "product"),
  }));
});

const POST_ORDER = [FEATURED.slug, ...POSTS.map((p) => p.slug)];

function toPost(node: ArticleNode): Post {
  return {
    slug: node.handle,
    title: node.title,
    desc: node.excerpt,
    category: node.tags[0] ?? "",
    minutes: node.metafield?.value ?? "",
    image: node.image?.url ?? "",
  };
}

export const loadPosts = once(async (): Promise<Post[]> => {
  if (!storefrontEnabled) return [FEATURED, ...POSTS];
  const data = await storefrontQuery<{ blog: { articles: { nodes: ArticleNode[] } } | null }>(ARTICLES_QUERY);
  const rank = (slug: string) => {
    const i = POST_ORDER.indexOf(slug);
    return i === -1 ? POST_ORDER.length : i;
  };
  return (data.blog?.articles.nodes ?? []).map(toPost).sort((a, b) => rank(a.slug) - rank(b.slug));
});

// The three articles on the home page, in the order the design shows them.
export function homeArticles(posts: Post[]): Post[] {
  return HOME_ARTICLE_SLUGS.flatMap((slug) => posts.find((p) => p.slug === slug) ?? []);
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Gives each h2 an id and returns the table of contents. Works in the browser and at build time, so the ids match.
export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_match, attrs: string, inner: string) => {
    const label = inner.replace(/<[^>]+>/g, "").trim();
    const id = slugify(label);
    toc.push({ id, label });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

async function loadArticleBody(slug: string): Promise<string> {
  if (!storefrontEnabled) return articleBodyHtml(slug);
  const data = await storefrontQuery<{ blog: { articleByHandle: { contentHtml: string } | null } | null }>(ARTICLE_BODY_QUERY, {
    handle: slug,
  });
  return data.blog?.articleByHandle?.contentHtml ?? "";
}

export async function loadArticle(slug: string): Promise<ArticleView | null> {
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  const { html, toc } = withHeadingIds(await loadArticleBody(slug));
  const candidates = [...new Set([...MORE_SLUGS, ...posts.map((p) => p.slug)])];
  const more = candidates
    .filter((s) => s !== slug)
    .flatMap((s) => posts.find((p) => p.slug === s) ?? [])
    .slice(0, 3);
  return { post, html, toc, more };
}

type ShopPolicyField = "privacyPolicy" | "refundPolicy" | "termsOfService";

const loadPolicyBodies = once(async (): Promise<Record<Policy["key"], string>> => {
  const data = await storefrontQuery<{ shop: Record<ShopPolicyField, { body: string } | null> }>(POLICIES_QUERY);
  return {
    privacy: data.shop.privacyPolicy?.body ?? "",
    refund: data.shop.refundPolicy?.body ?? "",
    terms: data.shop.termsOfService?.body ?? "",
  };
});

export async function loadPolicy(key: Policy["key"]): Promise<PolicyView | null> {
  const policy = POLICIES.find((p) => p.key === key);
  if (!policy) return null;
  const body = storefrontEnabled ? (await loadPolicyBodies())[key] : policyHtml(policy);
  const { html, toc } = withHeadingIds(body);
  return { title: policy.title, html, toc };
}

// Batch passports are keyed by their lowercase code in Shopify. The record holds the whole passport.
export async function loadBatch(code: string): Promise<Batch | null> {
  if (!storefrontEnabled) return BATCHES[code] ?? null;
  const data = await storefrontQuery<{ metaobject: { fields: { key: string; value: string | null }[] } | null }>(BATCH_QUERY, {
    handle: { type: "batch_passport", handle: code.toLowerCase() },
  });
  const record = data.metaobject?.fields.find((f) => f.key === "record")?.value;
  return record ? (JSON.parse(record) as Batch) : null;
}
