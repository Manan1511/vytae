import { escapeHtml } from "./html.ts";
import { PRODUCTS } from "./products.ts";

// Science posts and the magnesium article, copied from the design export (Science.dc.html, Article.dc.html).
// Other article bodies are not written yet, so they show the design's placeholder until copy is supplied.

export type Category = string;

export type Post = {
  slug: string;
  title: string;
  desc: string;
  category: Category;
  minutes: string;
  image: string;
};

export const FEATURED: Post = {
  slug: "magnesium-form",
  title: "Why the form of magnesium matters.",
  desc: "Not all magnesium is the same. A plain-language look at bisglycinate, and why we chose it for both VYTAE sleep formulas.",
  category: "Ingredients",
  minutes: "6 min",
  image: "/assets/capsule-molecule.webp",
};

export const POSTS: Post[] = [
  {
    slug: "reading-a-label",
    title: "Reading a supplement label, line by line.",
    desc: "What each part of a label tells you — and what to look for.",
    category: "Quality",
    minutes: "5 min",
    image: "/assets/hands-capsules.webp",
  },
  {
    slug: "how-we-test",
    title: "How we test every VYTAE batch.",
    desc: "From raw materials to the finished pack, step by step.",
    category: "Quality",
    minutes: "7 min",
    image: "/assets/test-tubes.webp",
  },
  {
    slug: "glycine-explained",
    title: "Glycine, explained.",
    desc: "A simple guide to one of the amino acids in Night Onset.",
    category: "Ingredients",
    minutes: "4 min",
    image: "/assets/capsules-dropper.webp",
  },
  {
    slug: "building-a-ritual",
    title: "Building a ritual you’ll actually keep.",
    desc: "Small, consistent steps beat complicated routines.",
    category: "Rituals",
    minutes: "5 min",
    image: "/assets/life-pour.webp",
  },
  {
    slug: "what-is-l-theanine",
    title: "What is L-theanine?",
    desc: "Where it comes from and why it’s part of Night Onset.",
    category: "Ingredients",
    minutes: "4 min",
    image: "/assets/life-sachets.webp",
  },
  {
    slug: "inside-the-batch-passport",
    title: "Inside the Batch Passport.",
    desc: "Why we made every batch traceable from the pack.",
    category: "Quality",
    minutes: "3 min",
    image: "/assets/open-capsule.webp",
  },
];

export const SCIENCE_CATEGORIES = ["All", "Ingredients", "Quality", "Rituals"] as const;

export function findPost(slug: string | undefined): Post | undefined {
  if (slug === FEATURED.slug) return FEATURED;
  return POSTS.find((p) => p.slug === slug);
}

export const PLACEHOLDER_BODY = "[Article body copy — to be written and reviewed.]";

// Body of the magnesium article. Bracketed text is the design's placeholder.
export const MAGNESIUM_ARTICLE = {
  intro:
    "Magnesium is one of the most common minerals in supplements — but on its own, it isn’t stable. It’s always paired with another compound, and that pairing is what we call its ",
  emphasis: "form",
  introEnd: ". [Article body copy — to be written and reviewed.]",
  formP:
    "Common forms include oxide, citrate and bisglycinate. Each behaves differently, and each label should tell you which one you’re getting. [Body copy.]",
  quote: "“The form isn’t a footnote. It’s one of the first things we decide.”",
  bisP: "Magnesium bisglycinate is magnesium bound to two molecules of glycine, an amino acid. [Body copy.]",
  vytaeP:
    "Both VYTAE sleep formulas use magnesium bisglycinate — paired with complementary ingredients in Night Onset, and on its own in Rest Well. [Body copy.]",
  refs: ["1. [Reference citation]", "2. [Reference citation]"],
  disclaimer: "This article is for general information only and is not medical advice.",
};

// Articles on the home page, in order. Slugs are the article handles.
export const HOME_ARTICLE_SLUGS = ["how-we-test", "glycine-explained", "inside-the-batch-passport"];

// Articles suggested under an article. Other posts fill in when these are missing.
export const MORE_SLUGS = ["glycine-explained", "how-we-test", "building-a-ritual"];

const nameOf = (handle: string) => PRODUCTS.find((p) => p.handle === handle)?.name ?? handle;

// Article body as HTML. The seed writes it to Shopify and the fallback renders it, so both show the same copy.
export function articleBodyHtml(slug: string): string {
  if (slug !== FEATURED.slug) return `<p>${escapeHtml(PLACEHOLDER_BODY)}</p>`;
  const m = MAGNESIUM_ARTICLE;
  const found = ["night-reset", "rest-well"].map((h) => `<a href="/products/${h}">${escapeHtml(nameOf(h))} →</a>`).join(" · ");
  return [
    `<p>${escapeHtml(m.intro)}<em>${escapeHtml(m.emphasis)}</em>${escapeHtml(m.introEnd)}</p>`,
    "<h2>What “form” means</h2>",
    `<p>${escapeHtml(m.formP)}</p>`,
    `<blockquote>${escapeHtml(m.quote)}</blockquote>`,
    "<h2>Meet bisglycinate</h2>",
    `<p>${escapeHtml(m.bisP)}</p>`,
    `<p>Found in: ${found}</p>`,
    "<h2>How we use it</h2>",
    `<p>${escapeHtml(m.vytaeP)}</p>`,
    "<h2>References</h2>",
    ...m.refs.map((r) => `<p>${escapeHtml(r)}</p>`),
    `<p>${escapeHtml(m.disclaimer)}</p>`,
  ].join("");
}
