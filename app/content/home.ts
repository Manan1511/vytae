// Homepage copy and data, copied from the design (Landing Page v13). Replaced by Shopify metaobjects in the CMS phase.

export const HERO = {
  image: "/assets/hero-night-e.webp",
  alt: "A VYTAE Night Reset jar and Deep Sleep sachet floating in soft blue light",
  eyebrow: "VYTAE · Life, Absorbed.",
  headline: "Just what your body needs.",
  lead: "Purposeful, science-led supplements, formulated around what your body can absorb.",
};

export const GOALS = [
  { key: "sleep", label: "Sleep", icon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z", note: "" },
  {
    key: "focus",
    label: "Focus",
    icon: "M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    note: "Soon",
  },
  { key: "gut", label: "Gut", icon: "M8 3v5c0 2 2 3 4 3s4 1 4 3v1c0 3-2 6-6 6M8 8c-2 0-3 1-3 3", note: "Soon" },
] as const;

export type GoalKey = (typeof GOALS)[number]["key"];

// `key` matches the Shopify product handle and the design's bag keys.
export const SLEEP_PRODUCTS = [
  {
    key: "night-reset",
    href: "/products/night-reset",
    format: "Sachet",
    name: "Night Onset",
    moment: "Sleep onset",
    desc: "Stir into water as you start to wind down.",
    specs: ["Glycine", "L-Theanine"],
    image: "/assets/life-pour.webp",
  },
  {
    key: "rest-well",
    href: "/products/rest-well",
    format: "Capsule",
    name: "Rest Well",
    moment: "Deep sleep",
    desc: "Take one before bed, as the second step.",
    specs: ["Magnesium bisglycinate"],
    image: "/assets/night-reset-scene.webp",
  },
];

export const RITUAL = {
  key: "sleep-ritual",
  href: "/products/sleep-ritual",
  name: "The Sleep Ritual",
  desc: "Night Onset + Rest Well together — both steps, best value. Save [00]%.",
  specs: ["Night Onset · Sachet", "Rest Well · Capsule"],
  image: "/assets/life-sachets.webp",
};

// Placeholder testimonials from the design. Replace with real Judge.me reviews before launch.
export const REVIEWS = [
  {
    quote: "Sleep comes easier now, and I wake up without that heavy feeling. Two steps I actually keep up with.",
    name: "Ananya R.",
    product: "Sleep Ritual",
  },
  {
    quote: "I checked my Batch Passport before my first dose. Seeing the lab results for my exact batch sold me.",
    name: "Karan M.",
    product: "Rest Well",
  },
  {
    quote: "Night Onset mixes in seconds and tastes light. It’s become my signal to put the phone down.",
    name: "Priya S.",
    product: "Night Onset",
  },
  {
    quote: "No big claims, no complicated steps. Just a routine I actually stick to.",
    name: "Rohan D.",
    product: "Sleep Ritual",
  },
  {
    quote: "Gentle on my stomach, and I finally feel rested in the mornings.",
    name: "Meera K.",
    product: "Rest Well",
  },
  {
    quote: "I like knowing exactly what’s in it, and why. The label is short and honest.",
    name: "Arjun P.",
    product: "Night Onset",
  },
];

export const ARTICLES = [
  {
    title: "How we test every VYTAE batch.",
    desc: "From raw materials to the finished pack, step by step.",
    category: "Quality",
    minutes: "7 min",
    image: "/assets/test-tubes.webp",
    href: "/science/how-we-test",
  },
  {
    title: "Glycine, explained.",
    desc: "A simple guide to one of the amino acids in Night Onset.",
    category: "Ingredients",
    minutes: "4 min",
    image: "/assets/capsules-dropper.webp",
    href: "/science/glycine-explained",
  },
  {
    title: "Inside the Batch Passport.",
    desc: "Why we made every batch traceable from the pack.",
    category: "Quality",
    minutes: "3 min",
    image: "/assets/open-capsule.webp",
    href: "/science/inside-the-batch-passport",
  },
];

export const UGC = [
  { product: "Night Onset", handle: "@[creator]" },
  { product: "Rest Well", handle: "@[creator]" },
  { product: "Sleep Ritual", handle: "@[creator]" },
  { product: "Night Onset", handle: "@[creator]" },
  { product: "Rest Well", handle: "@[creator]" },
];
