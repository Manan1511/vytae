import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { ShopBanner } from "../components/shop/ShopBanner";
import { ComingSoonCard, ShopCard } from "../components/shop/ShopGrid";
import { BRAND_PATHS } from "../components/ui/brand";
import { Fill, Stroke } from "../components/ui/icons";
import { trackViewItemList } from "../lib/analytics";
import { seoMeta } from "../lib/seo";
import { loadCatalog, loadShopBanners } from "../lib/catalog";
import { Reveal } from "../lib/motion";

export async function loader() {
  const [products, banners] = await Promise.all([loadCatalog(), loadShopBanners()]);
  return { products, banners };
}

export function meta() {
  return seoMeta({
    title: "Shop | VYTAE",
    description: "Considered formulas, tested batch by batch.",
    path: "/shop",
  });
}

// Categories match the product's `categories` list. The two placeholder categories have no products yet.
const CATEGORIES: { label: string; match: (categories: string[]) => boolean }[] = [
  { label: "All", match: () => true },
  { label: "Sleep", match: (c) => c.includes("Sleep") },
  { label: "Rituals", match: (c) => c.includes("Rituals") },
  { label: "Everyday wellness", match: () => false },
  { label: "Coming soon", match: () => false },
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

const ASSURANCES = [
  {
    title: "Secure online payments",
    body: "Pay securely online, with UPI, cards or netbanking.",
    icon: (
      <Stroke size={18}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </Stroke>
    ),
  },
  {
    title: "Tracked delivery",
    body: "Fulfilled and tracked to your door.",
    icon: (
      <Stroke size={18}>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.5" />
        <circle cx="17" cy="17.5" r="1.5" />
      </Stroke>
    ),
  },
  {
    title: "Traceable batches",
    body: "Every pack links to its Batch Passport.",
    icon: (
      <Stroke size={18}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <path d="M14 14h2v2h-2zM18 18h2v2h-2z" />
      </Stroke>
    ),
  },
  {
    title: "Help on WhatsApp",
    body: "Real people, quick answers.",
    icon: <Fill size={18} d={BRAND_PATHS.whatsapp} />,
  },
];

export default function ShopPage() {
  const { products, banners } = useLoaderData<typeof loader>();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const active = CATEGORIES.find((c) => c.label === category) ?? CATEGORIES[0];

  useEffect(() => {
    trackViewItemList(
      "Shop",
      products.map((p) => ({ item_id: p.handle, item_name: p.name, price: p.price, quantity: 1 })),
    );
  }, [products]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter(
      (p) => active.match(p.categories) && (!q || `${p.name} ${p.searchTerms}`.toLowerCase().includes(q)),
    );
    if (sort === "featured") return filtered;
    return [...filtered].sort((a, b) => (sort === "low" ? a.price - b.price : b.price - a.price));
  }, [products, active, query, sort]);

  const q = query.trim();
  const showSoon = !q && (category === "All" || category === "Coming soon" || category === "Everyday wellness");
  const empty = list.length === 0 && category !== "Coming soon" && category !== "Everyday wellness";

  return (
    <SiteShell variant="solid" active="Shop">
      <section
        data-screen-label="Listing"
        className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pt-[clamp(36px,4vw,56px)] pb-[clamp(48px,6vw,72px)]"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2.5">
            <Reveal as="h1" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.04] font-normal tracking-[-0.025em]">
              Shop VYTAE
            </Reveal>
            <Reveal as="p" className="m-0 max-w-[440px] text-base leading-[1.55] text-ink-body">
              Considered formulas, tested batch by batch.
            </Reveal>
          </div>
          <label
            id="search"
            className="flex w-[min(100%,340px)] items-center gap-2.5 rounded-full border border-line bg-white px-[18px] py-3"
          >
            <Stroke size={15} strokeWidth={1.8} className="text-ink-muted">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </Stroke>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or ingredients"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#8a9bb3]"
            />
          </label>
        </div>

        <ShopBanner slides={banners} />

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-y border-line-soft py-3.5">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = c.label === category;
              const count = products.filter((p) => c.match(p.categories)).length;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCategory(c.label)}
                  className={`cursor-pointer rounded-full border px-4 py-[9px] text-[13px] font-semibold transition-[background-color,color,border-color] duration-300 ${
                    on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
                  }`}
                >
                  {c.label} <span className="font-medium opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2.5 text-[13px] text-ink-soft">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="cursor-pointer rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5">
          {list.map((p) => (
            <ShopCard key={p.handle} product={p} />
          ))}
          {showSoon && <ComingSoonCard />}
        </div>
        {empty && (
          <p className="py-12 text-center text-base text-ink-soft">
            No products match “{q}”. Try an ingredient like magnesium.
          </p>
        )}
      </section>

      <section
        data-screen-label="Assurances"
        className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pb-[clamp(80px,10vw,120px)]"
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-7 border-t border-line-soft pt-10">
          {ASSURANCES.map((a) => (
            <Reveal key={a.title} className="flex flex-col gap-2.5">
              <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[rgba(27,54,93,0.12)] bg-[rgba(255,255,255,0.8)]">
                {a.icon}
              </span>
              <span className="text-[17px] font-semibold">{a.title}</span>
              <span className="text-sm leading-[1.55] text-ink-soft">{a.body}</span>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
