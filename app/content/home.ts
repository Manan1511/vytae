// Homepage copy and mock data. Hero slides, testimonials and products come from Shopify when the Storefront is configured.

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


export const UGC = [
  { product: "Night Onset", handle: "@[creator]" },
  { product: "Rest Well", handle: "@[creator]" },
  { product: "Sleep Ritual", handle: "@[creator]" },
  { product: "Night Onset", handle: "@[creator]" },
  { product: "Rest Well", handle: "@[creator]" },
];
