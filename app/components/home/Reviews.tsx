import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Testimonial } from "../../lib/catalog";
import { Reveal } from "../../lib/motion";
import { Eyebrow } from "../ui/Eyebrow";
import { SlideDot } from "../ui/SlideDot";
import { Stroke } from "../ui/icons";

const CAROUSEL_MS = 5000;
const FADE_MS = 450;

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

function ReviewCard({
  quote,
  name,
  product,
  className,
  style,
}: {
  quote: string;
  name: string;
  product: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <figure
      style={style}
      className={`m-0 flex flex-col gap-5 rounded-3xl border border-line bg-white p-[clamp(24px,2.6vw,32px)] shadow-[0_1px_0_rgba(27,54,93,0.05),0_30px_60px_-40px_rgba(27,54,93,0.4)] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] tracking-[1px] text-ink">★★★★★</span>
        <span className="rounded-full bg-frost px-2.5 py-1 text-xs font-semibold">{product}</span>
      </div>
      <blockquote className="m-0 flex-1 text-[clamp(19px,1.6vw,22px)] leading-[1.4] tracking-[-0.01em] text-pretty">
        “{quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-[#eef2f7] pt-[18px]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(160deg,#2f5a8f_0%,#26497a_100%)] text-sm font-semibold text-white">
          {initials(name)}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{name}</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-sage">
            <Stroke size={12} strokeWidth={2.6}>
              <path d="M5 12l5 5 9-10" />
            </Stroke>
            Verified buyer
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

// Desktop: three reviews rotate with a fade. Mobile: all reviews in a snap-scroll row.
export function Reviews({ reviews }: { reviews: Testimonial[] }) {
  const count = reviews.length;
  const [rv, setRv] = useState(0);
  const [fade, setFade] = useState(false);
  const held = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const id = window.setInterval(() => {
      if (held.current) return;
      setFade(true);
      timer = window.setTimeout(() => {
        setRv((r) => (r + 1) % count);
        setFade(false);
      }, FADE_MS);
    }, CAROUSEL_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timer);
    };
  }, [count]);

  const pick = (k: number) => {
    held.current = true;
    setRv(k);
    setFade(false);
  };

  if (count === 0) return null;

  const visible = [0, 1, 2].map((o) => reviews[(rv + o) % count]);

  return (
    <section id="reviews" data-screen-label="Testimonials" className="relative pt-[clamp(24px,3vw,40px)] pb-[clamp(80px,10vw,128px)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[520px] w-[min(1100px,140vw)] -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_45%,#e6edf6_0%,rgba(230,237,246,0.5)_45%,rgba(255,255,255,0)_72%)]"
      />
      <div className="relative mx-auto max-w-[1320px] px-10">
        <div className="mb-[clamp(36px,4vw,56px)] flex flex-col items-center gap-4 text-center">
          <Eyebrow centered>Testimonials</Eyebrow>
          <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em] text-balance">
            Nights, as our customers tell it.
          </Reveal>
          <Reveal className="flex items-center gap-2.5 text-sm text-ink-body">
            <span className="flex gap-0.5 text-base tracking-[1px] text-ink">★★★★★</span>
            <span>
              <strong className="font-semibold text-ink">[4.8]</strong> average · [000] reviews
            </span>
          </Reveal>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4 max-[759px]:hidden">
          {visible.map((r, o) => (
            <ReviewCard
              key={`${r.name}-${o}`}
              quote={r.quote}
              name={r.name}
              product={r.product}
              style={{
                opacity: fade ? 0 : 1,
                transform: fade ? "translateY(10px)" : "none",
                transition: "opacity .45s ease, transform .6s cubic-bezier(.2,.7,.2,1)",
              }}
            />
          ))}
        </div>

        <div role="region" aria-label="Customer reviews" tabIndex={0} className="no-scrollbar -mx-10 grid snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto scroll-px-10 px-10 pt-1 pb-6 min-[760px]:hidden">
          {reviews.map((r) => (
            <ReviewCard key={r.name} quote={r.quote} name={r.name} product={r.product} className="snap-start" />
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center max-[759px]:hidden">
          {reviews.map((r, k) => {
            const on = k === rv;
            return (
              <SlideDot
                key={r.name}
                active={on}
                label="Show reviews"
                onClick={() => pick(k)}
                activeColor="#26497a"
                idleColor="#cddbeb"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
