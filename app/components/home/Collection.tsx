import { useState } from "react";
import { Link } from "react-router";
import { GOALS, type GoalKey } from "../../content/home";
import type { Product } from "../../lib/catalog";
import { addToBag } from "../../lib/bag";
import { Reveal } from "../../lib/motion";
import { Eyebrow } from "../ui/Eyebrow";
import { Stroke } from "../ui/icons";

type CardProps = {
  productKey: string;
  href: string;
  image: string;
  moment: string;
  title: string;
  tag: string;
  desc: string;
  specs: string[];
};

function ProductCard({ productKey, href, image, moment, title, tag, desc, specs }: CardProps) {
  return (
    <Reveal className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_1px_0_rgba(27,54,93,0.04),0_24px_48px_-32px_rgba(27,54,93,0.28)] transition-[transform,box-shadow] duration-[600ms] ease-soft hover:-translate-y-1 hover:shadow-[0_1px_0_rgba(27,54,93,0.04),0_36px_60px_-32px_rgba(27,54,93,0.3)]">
      <Link to={href} className="relative block aspect-[4/3] overflow-hidden bg-frost">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-soft group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white px-3 py-[7px] text-xs font-semibold">
          <span className="h-[7px] w-[7px] rounded-full bg-ink" />
          {moment}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-[18px] p-[clamp(22px,2.4vw,32px)]">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[clamp(28px,2.6vw,36px)] leading-[1.05] font-normal tracking-[-0.025em]">{title}</span>
          <span className="rounded-full bg-frost px-2.5 py-1 text-xs font-semibold whitespace-nowrap tabular-nums">
            {tag}
          </span>
        </div>
        <span className="-mt-2 text-[15px] leading-[1.55] text-pretty text-ink-soft">{desc}</span>
        <div className="flex flex-wrap gap-2">
          {specs.map((spec) => (
            <span key={spec} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium">
              {spec}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-5 pt-1">
          <button
            type="button"
            onClick={() => addToBag(productKey)}
            className="inline-flex cursor-pointer items-center rounded-full border-0 bg-ink px-6 py-[13px] text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-ink-hover"
          >
            Add to bag
          </button>
          <Link to={href} className="border-b border-ink pb-0.5 text-[13px] font-semibold">
            View details
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export function Collection({ products }: { products: Product[] }) {
  const singles = products.filter((p) => !p.categories.includes("Rituals"));
  const ritual = products.find((p) => p.categories.includes("Rituals"));
  const [goal, setGoal] = useState<GoalKey>("sleep");
  const active = GOALS.find((g) => g.key === goal) ?? GOALS[0];

  return (
    <section id="collection" data-screen-label="Collection" className="mx-auto max-w-[1320px] px-10 pb-[clamp(80px,10vw,128px)]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <Eyebrow>Shop by health goal</Eyebrow>
          <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em]">
            Find what your body needs.
          </Reveal>
          <Reveal as="p" className="m-0 max-w-[520px] text-base leading-[1.6] text-ink-body">
            Purposeful formulas for everyday health goals — pick yours and build a routine that fits.
          </Reveal>
        </div>
        <Link to="/shop" className="border-b border-ink pb-0.5 text-[13px] font-semibold whitespace-nowrap">
          Shop all
        </Link>
      </div>

      <Reveal role="tablist" className="mb-7 flex flex-wrap gap-2">
        {GOALS.map((g) => {
          const on = g.key === goal;
          return (
            <button
              key={g.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setGoal(g.key)}
              className={`inline-flex cursor-pointer items-center gap-2.5 rounded-full border py-2.5 pr-[18px] pl-3 text-sm font-semibold transition-[background-color,color,border-color] duration-300 ${
                on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
              }`}
            >
              <Stroke size={18}>
                <path d={g.icon} />
              </Stroke>
              {g.label}
              <span className="text-[11px] font-semibold opacity-75">{g.note}</span>
            </button>
          );
        })}
      </Reveal>

      {goal === "sleep" ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
          {singles.map((p) => (
            <ProductCard
              key={p.handle}
              productKey={p.handle}
              href={`/products/${p.handle}`}
              image={p.home.image}
              moment={p.home.moment}
              title={p.name}
              tag={p.home.tag}
              desc={p.home.desc}
              specs={p.home.specs}
            />
          ))}
          {ritual && (
            <ProductCard
              productKey={ritual.handle}
              href={`/products/${ritual.handle}`}
              image={ritual.home.image}
              moment={ritual.home.moment}
              title={ritual.name}
              tag={ritual.home.tag}
              desc={ritual.home.desc}
              specs={ritual.home.specs}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-[radial-gradient(60%_80%_at_50%_0%,#e6edf6_0%,#dfe8f3_70%)] px-6 py-[clamp(56px,7vw,96px)] text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_18px_36px_-24px_rgba(27,54,93,0.5)]">
            <Stroke size={28} strokeWidth={1.5}>
              <path d={active.icon} />
            </Stroke>
          </span>
          <span className="text-[clamp(26px,2.6vw,36px)] tracking-[-0.02em]">{active.label} formulas are on the way.</span>
          <span className="max-w-[440px] text-[15px] leading-[1.6] text-ink-soft">
            Made to the same standard as our sleep ritual — sourced by us, tested by NABL-accredited labs, traceable batch
            by batch.
          </span>
          <button
            type="button"
            onClick={() => setGoal("sleep")}
            className="mt-1.5 cursor-pointer rounded-full border-0 bg-ink px-6 py-[13px] text-sm font-semibold text-white hover:bg-ink-hover"
          >
            Shop Sleep for now
          </button>
        </div>
      )}
    </section>
  );
}
