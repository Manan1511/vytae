import { useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router";
import { inr, type Product } from "../../content/products";
import { buyNowHref } from "../../lib/cart";
import { Stroke } from "../ui/icons";

type HeroProps = {
  product: Product;
  qty: number;
  setQty: Dispatch<SetStateAction<number>>;
  added: boolean;
  addItem: () => void;
};

// Gallery and buy box. Subscribe & Save appears as in the design but is not available yet.
export function ProductHero({ product, qty, setQty, added, addItem }: HeroProps) {
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const badge = product.step.replace(/^Step \d+ · /, "");

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate("/shop"));
  const buyNow = () => navigate(buyNowHref(product.handle, qty));

  return (
    <section
      data-screen-label="Product"
      className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pt-5 pb-[clamp(56px,7vw,96px)]"
    >
      <button
        type="button"
        onClick={back}
        className="mb-5 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(27,54,93,0.14)] bg-[rgba(255,255,255,0.6)] py-[7px] pr-3.5 pl-2.5 text-[13px] font-semibold text-ink hover:bg-white"
      >
        <Stroke size={14} strokeWidth={1.6}>
          <path d="M15 5l-7 7 7 7" />
        </Stroke>
        Back
      </button>

      <nav aria-label="Breadcrumb" className="mb-5 flex gap-2 text-[13px] text-ink-muted">
        <Link to="/shop" className="text-ink-muted">
          Shop
        </Link>
        <span>/</span>
        <span aria-current="page" className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-[clamp(28px,4.5vw,72px)]">
        <div className="grid min-w-0 gap-3 min-[760px]:grid-cols-[64px_minmax(0,1fr)]">
          <div className="flex gap-2.5 max-[759px]:order-2 min-[760px]:flex-col">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label="View image"
                onClick={() => setImg(i)}
                className="relative aspect-square min-w-0 flex-1 cursor-pointer overflow-hidden rounded-xl border-0 bg-frost p-0 transition-opacity duration-300 min-[760px]:flex-none"
                style={{ opacity: i === img ? 1 : 0.6, boxShadow: i === img ? "0 0 0 2px #26497a" : "none" }}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="relative w-full overflow-hidden bg-frost max-[759px]:order-1 max-[759px]:h-[96vw] max-[759px]:rounded-[20px] min-[760px]:h-[min(64vh,600px,110vw)] min-[760px]:min-h-[320px] min-[760px]:rounded-3xl">
            {product.images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={i === img ? product.name : ""}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[600ms]"
                style={{ opacity: i === img ? 1 : 0 }}
              />
            ))}
            <span className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-full bg-white px-3 py-[7px] text-xs font-semibold whitespace-nowrap">
              <span className="h-[7px] w-[7px] rounded-full bg-ink" />
              {badge}
            </span>
          </div>
        </div>

        <div className="sticky top-[84px] flex flex-col gap-[18px] pt-1">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">{product.eyebrow}</span>
            <h1 className="m-0 text-[clamp(44px,5vw,72px)] leading-[0.98] font-normal tracking-[-0.03em]">
              {product.name}
            </h1>
            <a href="#reviews" className="flex items-center gap-2.5 text-sm text-ink-body">
              <span className="text-[15px] tracking-[1px] text-ink">★★★★★</span>
              <span>
                <strong className="font-semibold text-ink">[4.8]</strong> · [000] verified reviews
              </span>
            </a>
            <span className="text-[clamp(18px,1.5vw,21px)] font-semibold tracking-[-0.01em]">{product.sub}</span>
            <span className="text-[15px] leading-normal text-ink-body">{product.verify}</span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-soft">
              {product.meta.map((m, i) => (
                <span key={m} className="flex items-center gap-3">
                  {i > 0 && <span className="h-1 w-1 rounded-full bg-[#9fb3cc]" />}
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-baseline gap-3 border-t border-line-soft pt-4">
            <span className="text-[clamp(34px,3vw,42px)] font-medium tracking-[-0.025em] tabular-nums">
              {inr(product.price)}
            </span>
            <span className="text-[13px] text-ink-soft">Inclusive of all taxes</span>
          </div>
          <span className="-mt-2 text-[13px] text-ink-soft">{product.supply}</span>

          <div role="radiogroup" aria-label="Purchase option" className="flex flex-col gap-2.5">
            <button
              type="button"
              role="radio"
              aria-checked="true"
              className="grid cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[14px] border-[1.5px] border-ink bg-[#f5f8fc] px-4 py-3.5 text-left text-ink"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-ink">
                <span className="h-2.5 w-2.5 rounded-full bg-ink" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">One-time purchase</span>
                <span className="text-[13px] text-ink-soft">Pay once. No recurring commitment.</span>
              </span>
              <span className="text-[15px] font-semibold tabular-nums">{inr(product.price)}</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked="false"
              disabled
              className="grid cursor-not-allowed grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[14px] border border-line bg-white px-4 py-3.5 text-left text-ink opacity-60"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-[#9fb3cc]" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">Subscribe & Save</span>
                <span className="text-[13px] text-ink-soft">Recurring delivery · save [10]% on every order</span>
              </span>
              <span className="text-xs font-semibold text-ink-muted">Coming soon</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="flex flex-none items-center rounded-full border border-line bg-white">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease"
                className="h-[52px] w-11 cursor-pointer border-0 bg-transparent text-lg font-medium text-ink"
              >
                −
              </button>
              <span className="min-w-[18px] text-center font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                aria-label="Increase"
                className="h-[52px] w-11 cursor-pointer border-0 bg-transparent text-lg font-medium text-ink"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="h-[52px] min-w-[140px] flex-1 cursor-pointer rounded-full border border-ink bg-white text-[15px] font-semibold whitespace-nowrap text-ink hover:bg-frost"
            >
              {added ? "Added ✓" : "Add to bag"}
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="flex h-[52px] min-w-[140px] flex-1 cursor-pointer items-center justify-center rounded-full bg-ink text-[15px] font-semibold whitespace-nowrap text-white hover:bg-ink-hover"
            >
              Buy now →
            </button>
          </div>

          <span className="flex items-start gap-2.5 text-sm leading-[1.45] text-ink-body">
            <Stroke size={18} strokeWidth={1.8} className="mt-px flex-none text-[#16a34a]">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M8 12.5l2.5 2.5 5-5.5" />
            </Stroke>
            <span>
              <strong className="font-semibold text-ink">Dispatches within 24 hours.</strong> Tracking shared after
              dispatch.
            </span>
          </span>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-5 gap-y-3 border-y border-line-soft py-4">
            {product.points.map((point) => (
              <span key={point} className="flex items-start gap-2.5 text-sm leading-[1.45]">
                <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border border-line text-[11px] font-bold text-ink">
                  ✓
                </span>
                {point}
              </span>
            ))}
          </div>

          <a href={product.exploreHref} className="self-start border-b border-ink pb-0.5 text-sm font-semibold">
            {product.exploreLabel} ↓
          </a>
          <span className="text-xs leading-normal text-ink-muted">
            Food supplement for adults. Not a medicine. Individual results vary.
          </span>
        </div>
      </div>
    </section>
  );
}
