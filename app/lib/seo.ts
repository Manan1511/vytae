// Search and social metadata. Pages are prerendered, so this metadata is in the HTML that search engines read.
// Canonical links, Open Graph URLs and JSON-LD URLs need the public site address, which is VITE_SITE_URL.
import type { Product } from "../content/products";

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").trim().replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

// Shopify images are already absolute. The design's local assets are made absolute with the site address.
function absoluteImage(src: string): string {
  return /^https?:\/\//.test(src) ? src : absoluteUrl(src);
}

type MetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "product" | "article";
  jsonLd?: object[];
  noindex?: boolean;
};

// Route meta for React Router. Every route returns this, so canonical, Open Graph and JSON-LD stay consistent.
export function seoMeta(input: MetaInput): Record<string, unknown>[] {
  const url = SITE_URL ? absoluteUrl(input.path) : undefined;
  const image = input.image && SITE_URL ? absoluteImage(input.image) : undefined;
  return [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:site_name", content: "VYTAE" },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: input.type ?? "website" },
    ...(url ? [{ property: "og:url", content: url }, { tagName: "link", rel: "canonical", href: url }] : []),
    ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    ...(input.noindex ? [{ name: "robots", content: "noindex" }] : []),
    ...(input.jsonLd ?? []).map((data) => ({ "script:ld+json": data })),
  ];
}

const CONTEXT = "https://schema.org";

export function organizationLd() {
  return { "@context": CONTEXT, "@type": "Organization", name: "VYTAE", ...(SITE_URL ? { url: SITE_URL } : {}) };
}

export function websiteLd() {
  return { "@context": CONTEXT, "@type": "WebSite", name: "VYTAE", ...(SITE_URL ? { url: SITE_URL } : {}) };
}

export function productLd(product: Product, path: string) {
  return {
    "@context": CONTEXT,
    "@type": "Product",
    name: product.name,
    description: product.sub,
    brand: { "@type": "Brand", name: "VYTAE" },
    image: product.images.map(absoluteImage),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price.toFixed(2),
      url: SITE_URL ? absoluteUrl(path) : path,
    },
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: SITE_URL ? absoluteUrl(item.path) : item.path,
    })),
  };
}

export function articleLd(post: { title: string; desc: string; image: string }, path: string) {
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline: post.title,
    description: post.desc,
    ...(post.image ? { image: absoluteImage(post.image) } : {}),
    author: { "@type": "Organization", name: "VYTAE" },
    publisher: { "@type": "Organization", name: "VYTAE" },
    mainEntityOfPage: SITE_URL ? absoluteUrl(path) : path,
  };
}
