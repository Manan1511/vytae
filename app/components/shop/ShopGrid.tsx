import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { inr, type Product } from "../../content/products";
import { useSavedCartStore } from "../../lib/cart";
import { Reveal } from "../../lib/motion";

export function ShopCard({ product }: { product: Product }) {
  const cartStore = useSavedCartStore();
  const [added, setAdded] = useState(false);
  const href = `/products/${product.handle}`;

  return (
    <Reveal className="flex flex-col overflow-hidden rounded-3xl border border-line bg-cloud shadow-[0_1px_0_rgba(27,54,93,0.04),0_24px_48px_-32px_rgba(27,54,93,0.28)] transition-[transform,box-shadow] duration-[600ms] ease-soft hover:-translate-y-1 hover:shadow-[0_1px_0_rgba(27,54,93,0.04),0_36px_60px_-32px_rgba(27,54,93,0.3)]">
      <Link to={href} className="relative block aspect-square overflow-hidden bg-frost">
        <img src={product.images[0]} alt={product.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white px-3 py-[7px] text-xs font-semibold whitespace-nowrap">
          <span className="h-[7px] w-[7px] rounded-full bg-ink" />
          {product.cardStep}
        </span>
      </Link>
      <div className="flex flex-col gap-3.5 p-6">
        <div className="flex items-baseline justify-between gap-3">
          <Link to={href} className="text-[28px] leading-[1.05] tracking-[-0.025em] text-ink">
            {product.name}
          </Link>
          <span className="text-base font-semibold tabular-nums">{inr(product.price)}</span>
        </div>
        <span className="-mt-1.5 text-sm leading-[1.55] text-ink-soft">
          {product.format} · {product.short}
        </span>
        <span className="text-[13px] text-ink-muted">★ [4.8] · [000] reviews</span>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              void cartStore.add(product.handle, 1);
              setAdded(true);
            }}
            className="cursor-pointer rounded-full border border-ink bg-white px-4 py-[13px] text-sm font-semibold whitespace-nowrap text-ink hover:bg-frost"
          >
            {added ? "Added ✓" : "Add to bag"}
          </button>
          <Link
            to={href}
            className="flex items-center justify-center rounded-full bg-ink px-4 py-[13px] text-sm font-semibold whitespace-nowrap text-white hover:bg-ink-hover"
          >
            Buy now
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

// Notify form is frontend-only for now. Nothing is submitted until the notify backend exists.
export function ComingSoonCard() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Reveal className="flex flex-col justify-center gap-4 rounded-3xl border border-dashed border-[#a9bdd6] bg-white p-7">
      <div className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">Coming soon</div>
      <div className="text-[28px] leading-[1.1] tracking-[-0.025em] text-balance">More VYTAE rituals are on the way.</div>
      <p className="m-0 text-sm leading-[1.55] text-ink-soft">Be the first to know when new formulas launch.</p>
      <form onSubmit={submit} className="flex gap-2 rounded-full border border-line bg-white p-[5px]">
        <input
          type="email"
          required
          placeholder="Your email"
          className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm text-ink outline-none"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-full border-0 bg-ink px-[18px] py-2.5 text-[13px] font-semibold whitespace-nowrap text-white hover:bg-ink-hover"
        >
          {sent ? "Done ✓" : "Notify me"}
        </button>
      </form>
    </Reveal>
  );
}
