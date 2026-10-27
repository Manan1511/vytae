// Product and science copy from the design export (Product.dc.html and Shop.dc.html).
// Prices are the seeded values from Bag.dc.html. Bracketed placeholders from the design stay in the copy.
// Seed source for Shopify (scripts/seed-shopify.ts) and the offline fallback when the Storefront is not configured.

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export type Study = { who: string; tags: string[]; d: string };
export type EvidenceCard = { k: string; dose: string; t: string; studies: Study[]; ctx: string };
export type Science = {
  title: string;
  lede: string;
  take: string;
  limit: string;
  refs: string;
  note: string;
  cards: EvidenceCard[];
};

// Home page card copy. Shopify stores it with the rest of the product content.
export type HomeCard = { moment: string; desc: string; specs: string[]; tag: string; image: string };

export type Product = {
  handle: string;
  name: string;
  price: number;
  // Shop card
  format: string;
  cardStep: string;
  short: string;
  categories: string[];
  searchTerms: string;
  home: HomeCard;
  // Product page
  step: string;
  eyebrow: string;
  sub: string;
  verify: string;
  meta: string[];
  supply: string;
  points: string[];
  exploreHref: string;
  exploreLabel: string;
  images: string[];
  whyTitle: string;
  whyLede: string;
  why: { t: string; d: string; img: string }[];
  science: Science | null;
  proof: string;
  pairBody: string;
  testimonials: { q: string; product: string }[];
  faqs: { q: string; a: string }[];
};

// Shared evidence cards. The sleep ritual page reuses them.
const GLYCINE: EvidenceCard = {
  k: "01 · Glycine",
  dose: "3 g before bed",
  t: "A sleep-onset signal at 3 g",
  studies: [
    {
      who: "Yamadera et al.",
      tags: ["2007", "n = 11"],
      d: "Randomised, single-blind crossover. With 3 g before bed, polysomnography-measured sleep-onset latency was shorter (p = 0.01), and time to reach slow-wave (deep) sleep also fell. Participants reported better sleep satisfaction, and sleep efficiency improved.",
    },
    {
      who: "Inagawa et al.",
      tags: ["2006", "3 g before bed"],
      d: "Randomised, double-blind crossover. Participants reporting poor sleep rated next-morning fatigue, liveliness and clear-headedness more favourably after glycine. These were self-reported morning-after outcomes, not objective measurements of how quickly people fell asleep.",
    },
  ],
  ctx: "Small, short studies; several glycine researchers were affiliated with Ajinomoto, an amino acid manufacturer.",
};

const THEANINE: EvidenceCard = {
  k: "02 · L-Theanine",
  dose: "200 mg / day",
  t: "Relevant dose; encouraging signal",
  studies: [
    {
      who: "Hidese et al.",
      tags: ["2019", "n = 30", "4 weeks"],
      d: "Double-blind, placebo-controlled crossover using 200 mg/day, taken before sleep. The study reported improvements in some self-reported sleep measures, including sleep latency and sleep disturbances. Small trial with self-reported measures; read with caution.",
    },
    {
      who: "Kurdi et al.",
      tags: ["2024", "n = 120 randomised"],
      d: "In a 14-day study, 200 mg/day improved Athens Insomnia Scale scores versus placebo, though melatonin performed better. The short duration and specific study population limit generalisation.",
    },
  ],
  ctx: "Evidence is stronger for self-reported sleep outcomes than objective measures; more pure-ingredient trials are needed.",
};

const MAGNESIUM: EvidenceCard = {
  k: "The independent study · 2025",
  dose: "Randomised · placebo-controlled",
  t: "A modest improvement in sleep-difficulty scores at 4 weeks.",
  studies: [
    {
      who: "Design",
      tags: ["Adults 18–65", "Double-blind"],
      d: "A randomised, placebo-controlled trial in adults aged 18–65 who reported poor sleep. Neither participants nor researchers knew who received magnesium or placebo.",
    },
    {
      who: "Result",
      tags: ["ISI score", "p = 0.049"],
      d: "Average Insomnia Severity Index drop: 3.9 points with magnesium vs 2.3 with placebo — a +1.6 point greater reduction. Both groups improved; the difference was statistically significant but modest.",
    },
  ],
  ctx: "Tolerability: 93% reported no side effects; no serious adverse events were reported.",
};

const EXPLORATORY: EvidenceCard = {
  k: "Exploratory finding",
  dose: "r = 0.25 · p = 0.036",
  t: "Lower reported intake. Greater improvement.",
  studies: [
    {
      who: "Finding",
      tags: ["Same trial"],
      d: "Participants who reported eating fewer magnesium-rich foods tended to see larger improvements in sleep-difficulty scores.",
    },
  ],
  ctx: "Dietary intake was self-reported, not confirmed by blood or urine tests. This is a research lead — not proof of deficiency or a guarantee of response.",
};

const NIGHT_REFS =
  "Yamadera W et al. Sleep Biol Rhythms. 2007;5:126–131. doi:10.1111/j.1479-8425.2007.00262.x · Inagawa K et al. Sleep Biol Rhythms. 2006;4:75–77. doi:10.1111/j.1479-8425.2006.00193.x · Hidese S et al. Nutrients. 2019;11:2362. doi:10.3390/nu11102362 · Kurdi MS et al. Indian J Palliat Care. 2024;30:176–181. doi:10.25259/IJPC_89_2023";
const REST_REFS =
  "Schuster J, Cycelskij I, Lopresti A, Hahn A. Nature and Science of Sleep. 2025;17:2027–2040. doi:10.2147/NSS.S524348";

export const PRODUCTS: Product[] = [
  {
    handle: "sleep-ritual",
    home: { moment: "Full ritual", desc: "Night Onset + Rest Well together — both steps, best value. Save [00]%.", specs: ["Night Onset · Sachet", "Rest Well · Capsule"], tag: "Set", image: "/assets/life-sachets.webp" },
    name: "The Sleep Ritual",
    price: 1799,
    format: "Night Onset + Rest Well",
    cardStep: "Best value · Save [00]%",
    short: "Both steps, one ritual set",
    categories: ["Sleep", "Rituals"],
    searchTerms: "ritual combo bundle set night reset rest well magnesium sleep",
    step: "Ritual set · Best value",
    eyebrow: "VYTAE · Two-step sleep ritual",
    sub: "Night Onset + Rest Well",
    verify: "Both products batch-tested and QR-traceable.",
    meta: ["30 sachets", "60 capsules", "30 nights"],
    supply: "One set · 30-night supply of both steps",
    points: ["Both steps, designed together", "Best value vs. buying separately"],
    exploreHref: "#why",
    exploreLabel: "How the ritual works",
    images: ["/assets/life-sachets.webp", "/assets/deep-sleep-sachet.webp", "/assets/night-reset-jar.webp", "/assets/life-group.webp"],
    whyTitle: "Two steps that work as one.",
    whyLede: "One simple evening routine.",
    why: [
      { t: "Step 01 · Night Onset", d: "Glycine + L-theanine, stirred into water as you wind down.", img: "/assets/life-pour.webp" },
      { t: "Step 02 · Rest Well", d: "200 mg elemental magnesium as fully chelated bisglycinate, in the evening.", img: "/assets/night-reset-scene.webp" },
      { t: "One routine", d: "Simple enough to keep every night — and consistency is what counts.", img: "/assets/life-group.webp" },
    ],
    science: {
      title: "Three ingredients. What human studies found.",
      lede: "Night Onset and Rest Well bring together ingredients each studied for sleep on their own. Here is what the research shows — and where it is still limited.",
      take: "Night Onset brings together 3 g glycine + 200 mg L-theanine. Each 2-capsule Rest Well serving provides 200 mg elemental magnesium as fully chelated bisglycinate.",
      limit: "The magnesium trial used 250 mg/day in another brand’s capsule. Neither Night Onset, Rest Well nor the set has been clinically tested.",
      refs: `${NIGHT_REFS} · ${REST_REFS}`,
      note: "Ingredient-level evidence only. Several studies are small or industry-linked; findings should not be read as proof of product efficacy.",
      cards: [
        { ...GLYCINE, k: "Night Onset · Glycine", dose: "3 g before bed" },
        { ...THEANINE, k: "Night Onset · L-Theanine", dose: "200 mg / day" },
        { ...MAGNESIUM, k: "Rest Well · Magnesium", dose: "250 mg / day studied" },
      ],
    },
    proof:
      "Both products are sourced, made and independently tested before release. Enter the batch number from either pack to see the full record for your batch.",
    pairBody: "",
    testimonials: [
      { q: "Night Onset as I wind down, Rest Well before bed. The ritual is the simplest part of my day.", product: "Sleep Ritual" },
      { q: "Having both steps in one set made it easy to stay consistent.", product: "Sleep Ritual" },
      { q: "No big claims, no complicated steps. VYTAE is simply a ritual I actually keep.", product: "Sleep Ritual" },
    ],
    faqs: [
      {
        q: "Do I need both products?",
        a: "They work on their own, but are designed as a pair: Night Onset to wind down, Rest Well for deep sleep.",
      },
      { q: "How much do I save?", a: "The set is priced [00]% lower than buying both separately." },
    ],
  },
  {
    handle: "night-reset",
    home: { moment: "Sleep onset", desc: "Stir into water as you start to wind down.", specs: ["Glycine", "L-Theanine"], tag: "Sachet", image: "/assets/life-pour.webp" },
    name: "Night Onset",
    price: 899,
    format: "Sachet",
    cardStep: "Sleep onset",
    short: "Glycine and L-theanine",
    categories: ["Sleep"],
    searchTerms: "magnesium glycine theanine cherry monk fruit sachet sleep",
    step: "Step 01 · Sachet",
    eyebrow: "VYTAE · Glycine + L-theanine",
    sub: "Stir-in sleep-onset sachet",
    verify: "Every batch independently tested before release.",
    meta: ["30 sachets", "30 servings", "1 sachet per serving"],
    supply: "One pack · 30-night supply at the suggested serving",
    points: ["Two actives at studied doses", "Stirs into water"],
    exploreHref: "#science",
    exploreLabel: "See what the research found",
    images: ["/assets/deep-sleep-sachet.webp", "/assets/life-pour.webp", "/assets/life-sachets.webp", "/assets/deep-sleep-scene.webp"],
    whyTitle: "Two actives. One focused formula.",
    whyLede: "Each chosen for a defined role in your wind-down.",
    why: [
      { t: "Glycine", d: "A naturally occurring amino acid, taken as your evening slows.", img: "/assets/capsule-molecule.webp" },
      { t: "L-Theanine", d: "An amino acid found in tea leaves, for a calm, unhurried wind-down.", img: "/assets/life-pour.webp" },
      { t: "A light stir-in", d: "One sachet in a glass of water. Nothing to swallow.", img: "/assets/life-sachets.webp" },
    ],
    science: {
      title: "Two ingredients. What human studies found.",
      lede: "Glycine and L-theanine have each been studied for sleep on their own. Here is what the research shows, where it is encouraging, and where the evidence is still limited.",
      take: "Night Onset brings together 3 g glycine + 200 mg L-theanine — doses investigated individually in human studies.",
      limit: "Research has explored sleep-onset latency, next-morning fatigue/grogginess, and overall subjective sleep quality.",
      refs: NIGHT_REFS,
      note: "Ingredient-level evidence only. Several studies are small or industry-linked; findings should not be read as proof of product efficacy.",
      cards: [GLYCINE, THEANINE],
    },
    proof:
      "Every batch of Night Onset is sourced, made and independently tested before release — and every pack links to its own record.",
    pairBody: "Follow Night Onset with Rest Well before bed — or take both as a set and save.",
    testimonials: [
      { q: "The sachet mixes easily and tastes light. It fits right into the routine I already had.", product: "Night Onset" },
      { q: "A calm, simple way to signal the day is done. I know what’s in it and why.", product: "Night Onset" },
      { q: "I like that the label is short and readable. Nothing hidden.", product: "Night Onset" },
    ],
    faqs: [
      { q: "Can I take it on its own?", a: "Yes. It’s designed as step one of the ritual, but works on its own too." },
      {
        q: "Has Night Onset itself been clinically tested?",
        a: "No. The studies cited tested each ingredient on its own, not this product.",
      },
      {
        q: "Can I take it with medicines?",
        a: "If you take regular medication or have a medical condition, ask your doctor or pharmacist first.",
      },
    ],
  },
  {
    handle: "rest-well",
    home: { moment: "Deep sleep", desc: "Take one before bed, as the second step.", specs: ["Magnesium bisglycinate"], tag: "Capsule", image: "/assets/night-reset-scene.webp" },
    name: "Rest Well",
    price: 1099,
    format: "Capsule",
    cardStep: "Deep sleep",
    short: "Fully chelated magnesium bisglycinate · 60 capsules",
    categories: ["Sleep"],
    searchTerms: "magnesium bisglycinate capsule sleep",
    step: "Step 02 · Capsule",
    eyebrow: "VYTAE · Magnesium bisglycinate",
    sub: "Fully Chelated Magnesium Bisglycinate",
    verify: "Identity and structure verified through FTIR & XRD.",
    meta: ["60 capsules", "30 servings", "2 capsules per serving"],
    supply: "One bottle · 30-night supply at the suggested serving",
    points: ["Plant-based HPMC capsules", "No fillers or buffering agents"],
    exploreHref: "#science",
    exploreLabel: "Explore the science behind Rest Well",
    images: ["/assets/night-reset-jar.webp", "/assets/night-reset-scene.webp", "/assets/hands-capsules.webp", "/assets/open-capsule.webp"],
    whyTitle: "A thoughtful addition to your nightly routine.",
    whyLede: "Fully chelated magnesium bisglycinate, made for your evening routine.",
    why: [
      { t: "Designed around rest", d: "Magnesium supports normal nervous system and muscle function — important aspects of everyday wellbeing.", img: "/assets/glass-rest.webp" },
      {
        t: "A considered magnesium choice",
        d: "We use fully chelated magnesium bisglycinate, selected for its potential for good absorption and digestive tolerability.",
        img: "/assets/open-capsule.webp",
      },
      { t: "Easy to keep", d: "Two capsules in the evening, as part of your wind-down.", img: "/assets/hands-capsules.webp" },
    ],
    science: {
      title: "A form chosen for evidence, not exaggerated claims.",
      lede: "Understand what’s inside. See what a human study found. No exaggerated claims. No empty hype.",
      take: "Each 2-capsule serving provides 200 mg elemental magnesium. We have made deliberate use of the available capsule space while keeping fully chelated magnesium bisglycinate and ingredient quality at the centre of the formula.",
      limit: "The cited study used 250 mg/day, so the dose is not identical. The trial used another brand’s capsule — Rest Well itself has not been clinically tested.",
      refs: REST_REFS,
      note: "Ingredient-level evidence. Not a guarantee of individual results.",
      cards: [MAGNESIUM, EXPLORATORY],
    },
    proof:
      "Much of the market sells “buffered” magnesium — cheap oxide mixed in to inflate the label. Every Rest Well batch is tested by FTIR, proving magnesium is bound to glycine, and XRD, confirming zero unreacted oxide.",
    pairBody: "Start your evening with Night Onset — or take both as a set and save.",
    testimonials: [
      { q: "Two capsules after dinner is easy to remember. I like knowing exactly which form of magnesium I’m taking.", product: "Rest Well" },
      { q: "I checked my batch on the Batch Passport in seconds. That transparency is why I reordered.", product: "Rest Well" },
      { q: "No big claims, no complicated steps. It’s simply part of my evening now.", product: "Rest Well" },
    ],
    faqs: [
      {
        q: "Why bisglycinate, not citrate or oxide?",
        a: "It is the form used in the sleep trial we cite, and it was well tolerated there. Evidence that one form is absorbed better than another is limited, so we don’t claim that it is.",
      },
      {
        q: "What does “elemental magnesium” mean?",
        a: "Magnesium is only part of the total weight of the compound. Elemental magnesium is the magnesium itself — the number to compare across food and supplement labels.",
      },
      {
        q: "Has Rest Well itself been tested in a clinical trial?",
        a: "No. The published trial tested magnesium bisglycinate in another brand’s capsule. Rest Well’s own quality approach is batch-level laboratory testing; it is not evidence that the product has been clinically tested.",
      },
      {
        q: "How long should I take it?",
        a: "The study lasted four weeks and does not establish long-term effects. Follow the label directions and speak with a healthcare professional if you are unsure whether it is appropriate for you.",
      },
      {
        q: "Can I take it with other supplements or medicines?",
        a: "Magnesium can interact with some medicines. Ask your doctor or pharmacist before use if you take regular medication or have a medical condition.",
      },
    ],
  },
];

// Product-page evidence checks, shown in the Batch Passport band.
export const PASSPORT_CHECKS = [
  { n: "01", t: "Ingredient sourcing", d: "Sourced by VYTAE against global purity specs" },
  { n: "02", t: "Manufacturing", d: "GMP, WHO-GMP and FSSAI-licensed facility" },
  { n: "03", t: "Independent testing", d: "NABL-accredited third-party lab" },
];

export const SHOP_BANNERS = [
  {
    eyebrow: "Best value",
    title: "The Sleep Ritual",
    body: "Night Onset + Rest Well",
    cta: "Shop · " + inr(1799),
    href: "/products/sleep-ritual",
    img: "/assets/life-sachets.webp",
  },
  {
    eyebrow: "Sachet",
    title: "Night Onset",
    body: "Stir in as you wind down",
    cta: "Shop · " + inr(899),
    href: "/products/night-reset",
    img: "/assets/life-pour.webp",
  },
  {
    eyebrow: "Capsule",
    title: "Rest Well",
    body: "Fully chelated magnesium",
    cta: "Shop · " + inr(1099),
    href: "/products/rest-well",
    img: "/assets/night-reset-scene.webp",
  },
];
