import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { PASSPORT_CHECKS, inr, type Product } from "../../content/products";
import { addToBag } from "../../lib/bag";
import { Reveal } from "../../lib/motion";
import { whatsappUrl } from "../../lib/whatsapp";
import { BRAND_PATHS } from "../ui/brand";
import { Fill, Stroke } from "../ui/icons";

export type SectionNumbers = Record<string, string>;

// Numbers count only the sections shown for this product, so the ritual page skips the pairs step.
export function sectionNumbers(product: Product): SectionNumbers {
  const order = [
    "why",
    ...(product.science ? ["sci"] : []),
    "proof",
    ...(product.handle === "sleep-ritual" ? [] : ["ritual"]),
    "reviews",
    "faq",
  ];
  return Object.fromEntries(order.map((key, i) => [key, String(i + 1).padStart(2, "0")]));
}

const HEADING = "m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em] text-balance";
const DARK_PANEL = "bg-[linear-gradient(160deg,#21406f_0%,#2a4c7c_45%,#3a6aa3_100%)] text-white";
const CARD_SHADOW = "shadow-[0_1px_0_rgba(27,54,93,0.04),0_24px_48px_-32px_rgba(27,54,93,0.28)]";
const CARD_SHADOW_HOVER = "hover:shadow-[0_1px_0_rgba(27,54,93,0.04),0_36px_60px_-32px_rgba(27,54,93,0.3)]";

function SectionLabel({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <Reveal
      className={`flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] text-[#4f6b8f] uppercase ${
        centered ? "justify-center" : ""
      }`}
    >
      <span className="h-[7px] w-[7px] rounded-full bg-ink" />
      {children}
    </Reveal>
  );
}

export function WhySection({ product, n }: { product: Product; n: SectionNumbers }) {
  return (
    <section
      id="why"
      data-screen-label="Why"
      className="mx-auto max-w-[1320px] scroll-mt-[132px] px-[clamp(20px,3vw,40px)] pt-[clamp(24px,3vw,40px)] pb-[clamp(56px,6vw,88px)]"
    >
      <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <SectionLabel>{`${n.why} · Why it works`}</SectionLabel>
          <Reveal as="h2" className={HEADING}>
            {product.whyTitle}
          </Reveal>
        </div>
        <p className="m-0 max-w-[440px] text-base leading-[1.65] text-pretty text-[#3d5a80]">{product.whyLede}</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
        {product.why.map((item) => (
          <Reveal key={item.t} className="flex flex-col overflow-hidden rounded-[22px] border border-line bg-white">
            <span className="relative block aspect-[4/3] bg-frost">
              <img src={item.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </span>
            <div className="flex flex-col gap-2 px-6 pt-[22px] pb-[26px]">
              <span className="flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.01em]">
                <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-[#16a34a] text-[11px] text-white">
                  ✓
                </span>
                {item.t}
              </span>
              <span className="text-[15px] leading-[1.6] text-pretty text-[#3d5a80]">{item.d}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ScienceSection({ product, n }: { product: Product; n: SectionNumbers }) {
  const science = product.science;
  if (!science) return null;

  return (
    <section
      id="science"
      data-screen-label="Science"
      className="mx-auto max-w-[1320px] scroll-mt-[132px] px-[clamp(20px,3vw,40px)] pb-[clamp(56px,6vw,88px)]"
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(24px,4vw,64px)]">
        <div className="flex flex-col gap-[18px] min-[760px]:sticky min-[760px]:top-[84px]">
          <SectionLabel>{`${n.sci} · The science`}</SectionLabel>
          <Reveal as="h2" className={HEADING}>
            {science.title}
          </Reveal>
          <p className="m-0 text-[17px] leading-[1.6] text-pretty text-[#3d5a80]">{science.lede}</p>
          <Reveal className={`mt-2 flex flex-col gap-3 rounded-[22px] p-[clamp(24px,2.8vw,32px)] ${DARK_PANEL}`}>
            <span className="flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] text-[rgba(255,255,255,0.9)] uppercase">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16a34a] text-[10px]">✓</span>
              VYTAE’s takeaway
            </span>
            <span className="text-[clamp(18px,1.5vw,21px)] leading-[1.45] tracking-[-0.01em] text-pretty">
              {science.take}
            </span>
            <span className="border-t border-[rgba(255,255,255,0.22)] pt-3 text-sm leading-[1.55] text-pretty text-[rgba(255,255,255,0.9)]">
              {science.limit}
            </span>
          </Reveal>
          <div className="flex flex-col gap-1.5 text-xs leading-[1.6] text-ink-soft">
            <span className="text-[11px] font-bold tracking-[0.14em] text-ink uppercase">Key references</span>
            <span className="[overflow-wrap:anywhere]">{science.refs}</span>
            <em>{science.note}</em>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {science.cards.map((card) => (
            <Reveal
              key={card.k}
              className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_48px_-36px_rgba(27,54,93,0.35)]"
            >
              <div className="flex flex-col gap-3 px-[clamp(22px,2.6vw,30px)] pt-[clamp(22px,2.6vw,30px)] pb-[clamp(18px,2vw,22px)]">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <span className="text-xs font-bold tracking-[0.14em] whitespace-nowrap text-[#4f6b8f] uppercase">
                    {card.k}
                  </span>
                  <span className="rounded-full bg-[#dcfce7] px-[11px] py-[5px] text-xs font-bold whitespace-nowrap text-[#15803d]">
                    {card.dose}
                  </span>
                </div>
                <span className="text-[clamp(24px,2.2vw,30px)] leading-[1.12] tracking-[-0.02em] text-balance">
                  {card.t}
                </span>
              </div>
              {card.studies.map((study) => (
                <div
                  key={study.who}
                  className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-x-6 gap-y-2 border-t border-[#e3eaf3] px-[clamp(22px,2.6vw,30px)] py-[18px]"
                >
                  <div className="flex max-w-[180px] flex-col gap-1.5">
                    <span className="text-sm font-bold text-[#1b3a66]">{study.who}</span>
                    <div className="flex flex-wrap gap-1">
                      {study.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-frost px-[9px] py-[3px] text-[11px] font-bold whitespace-nowrap text-ink"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="min-w-0 text-[15px] leading-[1.6] text-pretty text-[#3d5a80] [grid-column:span_3]">
                    {study.d}
                  </span>
                </div>
              ))}
              <span className="flex gap-2.5 border-t border-[#e3eaf3] bg-[#f2f6fb] px-[clamp(22px,2.6vw,30px)] py-4 text-[13px] leading-[1.55] text-[#3d5a80]">
                <span className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-[1.5px] border-ink text-[10px] font-bold text-ink">
                  i
                </span>
                {card.ctx}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProofSection({ product, n }: { product: Product; n: SectionNumbers }) {
  return (
    <section id="proof" data-screen-label="Proof" className="scroll-mt-[132px] px-3 pb-[clamp(56px,6vw,88px)]">
      <div
        className={`relative mx-auto max-w-[1320px] overflow-hidden rounded-[28px] px-[clamp(20px,5vw,72px)] py-[clamp(36px,6vw,88px)] ${DARK_PANEL}`}
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-center gap-[clamp(32px,5vw,72px)]">
          <div className="flex flex-col gap-[18px]">
            <span className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] text-[rgba(255,255,255,0.88)] uppercase">
              <span className="h-[7px] w-[7px] rounded-full bg-white" />
              {`${n.proof} · Batch Passport`}
            </span>
            <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.04] font-normal tracking-[-0.025em] text-balance">
              Every batch earns a passport.
            </Reveal>
            <p className="m-0 max-w-[460px] text-base leading-[1.65] text-[rgba(255,255,255,0.88)]">{product.proof}</p>
            <Link
              to="/batch"
              className="self-start rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-ink hover:bg-frost"
            >
              See a Batch Passport →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {PASSPORT_CHECKS.map((check) => (
              <Reveal
                key={check.n}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[18px] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.1)] px-5 py-[18px]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,255,255,0.5)] text-[13px] font-semibold">
                  {check.n}
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-[17px] font-medium">{check.t}</span>
                  <span className="text-[13px] text-[rgba(255,255,255,0.8)]">{check.d}</span>
                </span>
                <span className="rounded-full bg-white px-2.5 py-[5px] text-xs font-bold text-ink">✓</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const PAIR_ROLE: Record<string, string> = {
  "night-reset": "Glycine + L-theanine. Stir one sachet into water as you wind down.",
  "rest-well": "Magnesium bisglycinate. Two capsules, 30–60 min before bed.",
};

function PairCard({ item, current }: { item: Product; current: boolean }) {
  const [added, setAdded] = useState(false);
  const href = `/products/${item.handle}`;

  return (
    <Reveal
      className={`flex flex-col overflow-hidden rounded-3xl border border-line bg-cloud ${CARD_SHADOW} transition-[transform,box-shadow] duration-[600ms] ease-soft hover:-translate-y-1 ${CARD_SHADOW_HOVER}`}
    >
      <Link to={href} className="group relative block aspect-[4/3] overflow-hidden bg-frost">
        <img
          src={item.images[1]}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-soft group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white px-3 py-[7px] text-xs font-semibold whitespace-nowrap">
          <span className="h-[7px] w-[7px] rounded-full bg-ink" />
          {item.step.split(" · ")[0]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-[18px] p-[clamp(22px,2.4vw,32px)]">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[clamp(28px,2.6vw,36px)] leading-[1.05] tracking-[-0.025em]">{item.name}</span>
          <span className="text-base font-semibold tabular-nums">{inr(item.price)}</span>
        </div>
        <span className="-mt-2 text-[15px] leading-[1.55] text-pretty text-ink-soft">{PAIR_ROLE[item.handle]}</span>
        <div className="mt-auto flex flex-wrap items-center gap-x-[18px] gap-y-3 pt-1">
          {current ? (
            <span className="inline-flex items-center rounded-full border border-line bg-white px-[18px] py-3 text-sm font-semibold whitespace-nowrap text-ink-body">
              Viewing now
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  addToBag(item.handle);
                  setAdded(true);
                }}
                className="cursor-pointer rounded-full border-0 bg-ink px-[22px] py-[13px] text-sm font-semibold whitespace-nowrap text-white hover:bg-ink-hover"
              >
                {added ? "Added ✓" : "Add to bag"}
              </button>
              <Link to={href} className="border-b border-ink pb-0.5 text-[13px] font-semibold">
                View details
              </Link>
            </>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function RitualSetCard({ set, singles }: { set: Product; singles: number }) {
  const [added, setAdded] = useState(false);

  return (
    <Reveal
      className={`flex flex-col overflow-hidden rounded-3xl text-white shadow-[0_24px_48px_-32px_rgba(27,54,93,0.5)] ${DARK_PANEL}`}
    >
      <Link to="/products/sleep-ritual" className="group relative block aspect-[4/3] overflow-hidden bg-[#24456d]">
        <img
          src="/assets/life-group.webp"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-soft group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white px-3 py-[7px] text-xs font-semibold whitespace-nowrap text-ink">
          <span className="h-[7px] w-[7px] rounded-full bg-[#16a34a]" />
          Best value · Save [00]%
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-[18px] p-[clamp(22px,2.4vw,32px)]">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[clamp(28px,2.6vw,36px)] leading-[1.05] tracking-[-0.025em]">The Sleep Ritual</span>
          <span className="flex items-baseline gap-2">
            <span className="text-sm text-[rgba(255,255,255,0.75)] line-through">{inr(singles)}</span>
            <span className="text-base font-semibold tabular-nums">{inr(set.price)}</span>
          </span>
        </div>
        <span className="-mt-2 text-[15px] leading-[1.55] text-pretty text-[rgba(255,255,255,0.9)]">
          Night Onset + Rest Well together — both steps, one set.
        </span>
        <div className="mt-auto flex flex-wrap items-center gap-x-[18px] gap-y-3 pt-1">
          <button
            type="button"
            onClick={() => {
              addToBag(set.handle);
              setAdded(true);
            }}
            className="cursor-pointer rounded-full bg-white px-[22px] py-[13px] text-sm font-semibold whitespace-nowrap text-ink hover:bg-frost"
          >
            {added ? "Set added ✓" : "Add the set to bag"}
          </button>
          <Link to="/products/sleep-ritual" className="border-b border-white pb-0.5 text-[13px] font-semibold text-white">
            View details
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

// Pairs appear on the single-product pages only. The ritual page already is the set.
export function PairsSection({ product, n, catalog }: { product: Product; n: SectionNumbers; catalog: Product[] }) {
  if (product.handle === "sleep-ritual") return null;
  const night = catalog.find((p) => p.handle === "night-reset");
  const rest = catalog.find((p) => p.handle === "rest-well");
  const set = catalog.find((p) => p.handle === "sleep-ritual");
  if (!night || !rest || !set) return null;
  const items = [night, rest];
  const singles = night.price + rest.price;

  return (
    <section
      id="ritual"
      data-screen-label="Pairs"
      className="mx-auto max-w-[1320px] scroll-mt-[132px] px-[clamp(20px,3vw,40px)] pb-[clamp(56px,6vw,88px)]"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <SectionLabel>{`${n.ritual} · The VYTAE ritual`}</SectionLabel>
          <Reveal as="h2" className={HEADING}>
            Complete your VYTAE ritual.
          </Reveal>
          <Reveal as="p" className="m-0 max-w-[520px] text-base leading-[1.6] text-ink-body">
            {product.pairBody}
          </Reveal>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-4">
        {items.map((item) => (
          <PairCard key={item.handle} item={item} current={item.handle === product.handle} />
        ))}
        <RitualSetCard set={set} singles={singles} />
      </div>
    </section>
  );
}

export function ReviewsSection({ product, n }: { product: Product; n: SectionNumbers }) {
  return (
    <section
      id="reviews"
      data-screen-label="Testimonials"
      className="mx-auto max-w-[1320px] scroll-mt-[132px] px-[clamp(20px,3vw,40px)] pb-[clamp(56px,6vw,88px)]"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <SectionLabel>{`${n.reviews} · Reviews`}</SectionLabel>
          <Reveal as="h2" className={HEADING}>
            Nights, as our customers tell it.
          </Reveal>
          <Reveal className="flex items-center gap-2.5 text-sm text-ink-body">
            <span className="text-base tracking-[1px] text-ink">★★★★★</span>
            <span>
              <strong className="font-semibold text-ink">[4.8]</strong> average · [000] reviews
            </span>
          </Reveal>
        </div>
        {/* Judge.me writing is not connected yet. */}
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-full border border-ink bg-white px-[22px] py-3 text-sm font-semibold whitespace-nowrap text-ink opacity-60"
        >
          Write a review
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
        {product.testimonials.map((r) => (
          <Reveal
            key={r.q}
            as="figure"
            className="m-0 flex flex-col gap-5 rounded-3xl border border-line bg-white p-[clamp(24px,2.6vw,32px)] shadow-[0_1px_0_rgba(27,54,93,0.05),0_30px_60px_-40px_rgba(27,54,93,0.4)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[15px] tracking-[1px] text-ink">★★★★★</span>
              <span className="flex-none rounded-full bg-frost px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                {r.product}
              </span>
            </div>
            <blockquote className="m-0 flex-1 text-[clamp(19px,1.6vw,22px)] leading-[1.4] tracking-[-0.01em] text-pretty">
              “{r.q}”
            </blockquote>
            <figcaption className="flex items-center gap-3 border-t border-[#eef2f7] pt-[18px]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(160deg,#2f5a8f_0%,#26497a_100%)] text-sm font-semibold text-white">
                C
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">[Customer name]</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-sage">
                  <Stroke size={12} strokeWidth={2.6}>
                    <path d="M5 12l5 5 9-10" />
                  </Stroke>
                  Verified buyer
                </span>
              </span>
            </figcaption>
          </Reveal>
        ))}
      </div>
      <span className="sr-only">{`${product.name} reviews`}</span>
    </section>
  );
}

export function FaqSection({ product, n }: { product: Product; n: SectionNumbers }) {
  const [open, setOpen] = useState(0);
  const external = whatsappUrl(`Hi VYTAE, I have a question about ${product.name}.`);

  return (
    <section
      id="faq"
      data-screen-label="FAQ"
      className="mx-auto max-w-[1320px] scroll-mt-[132px] px-[clamp(20px,3vw,40px)] pb-[clamp(56px,6vw,88px)]"
    >
      <div className="mb-[clamp(36px,4vw,56px)] flex flex-col items-center gap-4 text-center">
        <SectionLabel centered>{`${n.faq} · FAQ`}</SectionLabel>
        <Reveal as="h2" className={HEADING}>
          Questions, answered with care.
        </Reveal>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-stretch gap-[clamp(20px,3vw,40px)]">
        <Reveal className="relative min-h-[clamp(360px,34vw,480px)] overflow-hidden rounded-[28px] bg-frost">
          <img src="/assets/hands-capsules.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute right-4 bottom-4 left-4 flex flex-col gap-4 rounded-[22px] bg-[rgba(255,255,255,0.94)] px-6 py-[22px] shadow-[0_24px_48px_-28px_rgba(30,62,106,0.55)] backdrop-blur-[10px]">
            <div className="flex items-center gap-3.5">
              <span className="flex">
                <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white shadow-[0_0_0_3px_#ffffff]">
                  [A]
                </span>
                <span className="-ml-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#2f5a8f] text-[13px] font-semibold text-white shadow-[0_0_0_3px_#ffffff]">
                  [N]
                </span>
                <span className="-ml-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#9fc3e6] text-[13px] font-semibold text-ink shadow-[0_0_0_3px_#ffffff]">
                  [R]
                </span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-semibold">Talk to our care team</span>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-sage">
                  <span className="h-[7px] w-[7px] rounded-full bg-sage" />
                  Real people · [Mon–Sat, 10am–7pm]
                </span>
              </span>
            </div>
            <a
              href={external ?? "/contact#whatsapp"}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="flex items-center justify-center gap-2.5 rounded-full bg-ink px-[22px] py-3.5 text-sm font-semibold text-white hover:bg-ink-hover"
            >
              <Fill size={17} d={BRAND_PATHS.whatsapp} />
              Ask us on WhatsApp
            </a>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3">
          {product.faqs.map((item, i) => {
            const on = open === i;
            return (
              <Reveal
                key={item.q}
                className="overflow-hidden rounded-[22px] border border-line transition-[background-color,box-shadow] duration-[400ms]"
                style={{
                  background: on ? "#ffffff" : "#f3f6fa",
                  boxShadow: on ? "0 1px 0 rgba(27,54,93,0.05),0 30px 60px -40px rgba(27,54,93,0.4)" : "none",
                }}
              >
                <button
                  type="button"
                  aria-expanded={on}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_36px] items-center gap-4 border-0 bg-transparent px-[clamp(20px,2.4vw,28px)] py-[clamp(20px,2.2vw,26px)] text-left text-[clamp(17px,1.4vw,19px)] leading-[1.35] font-medium text-ink"
                >
                  <span className="text-pretty">{item.q}</span>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-[transform,background-color,color] duration-500 ease-soft"
                    style={{
                      background: on ? "#26497a" : "#ffffff",
                      color: on ? "#ffffff" : "#26497a",
                      transform: on ? "rotate(45deg)" : "none",
                    }}
                  >
                    <Stroke size={12} strokeWidth={2.4}>
                      <path d="M12 5v14M5 12h14" />
                    </Stroke>
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-soft"
                  style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className="flex flex-col gap-3.5 px-[clamp(20px,2.4vw,28px)] pb-[clamp(22px,2.4vw,28px)] transition-opacity duration-500"
                      style={{ opacity: on ? 1 : 0 }}
                    >
                      <p className="m-0 max-w-[600px] text-base leading-[1.65] text-pretty text-ink-body">{item.a}</p>
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-muted">
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-ink text-[9px] font-bold tracking-[0.06em] text-white">
                          V
                        </span>
                        Answered by VYTAE Care
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
