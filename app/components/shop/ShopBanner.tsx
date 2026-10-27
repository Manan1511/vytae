import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { ShopBannerSlide } from "../../lib/catalog";
import { Reveal } from "../../lib/motion";
import { sizedImage, sizedSrcSet } from "../../lib/shopify/image";
import { SlideDot } from "../ui/SlideDot";

const INTERVAL_MS = 6000;

// Crossfading banner. Autoplay pauses on hover and stays off for reduced motion.
export function ShopBanner({ slides }: { slides: ShopBannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState([0]);

  useEffect(() => {
    setSeen((s) => (s.includes(index) ? s : [...s, index]));
  }, [index]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <Reveal
      className="relative mb-7 min-h-[clamp(260px,28vw,360px)] overflow-hidden rounded-[28px] bg-hero text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => {
        const on = i === index;
        return (
          <div
            key={slide.title}
            aria-hidden={!on}
            className="absolute inset-0 transition-opacity duration-[800ms] ease-soft"
            style={{ opacity: on ? 1 : 0, pointerEvents: on ? "auto" : "none" }}
          >
            {seen.includes(i) && (
              <img
                src={sizedImage(slide.img, 1200)}
                srcSet={sizedSrcSet(slide.img, [800, 1200, 1600])}
                sizes="(min-width: 1320px) 1200px, 100vw"
                alt=""
                fetchPriority={i === 0 ? "high" : undefined}
                className="absolute inset-0 h-full w-full object-cover object-[62%_55%]"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,36,68,0.7)_0%,rgba(16,36,68,0.3)_45%,rgba(16,36,68,0)_75%)]"
            />
            <div className="relative flex h-full max-w-[520px] flex-col justify-end gap-4 p-[clamp(24px,4vw,48px)]">
              <span className="self-start rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.14)] px-3.5 py-[7px] text-xs font-semibold tracking-[0.02em]">
                {slide.eyebrow}
              </span>
              <h2 className="m-0 text-[clamp(32px,4vw,52px)] leading-[1.02] font-normal tracking-[-0.03em]">
                {slide.title}
              </h2>
              <p className="m-0 text-base text-[rgba(255,255,255,0.9)]">{slide.body}</p>
              <Link
                to={slide.href}
                tabIndex={on ? 0 : -1}
                className="inline-flex w-fit items-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-ink hover:bg-frost"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        );
      })}
      <div className="absolute right-[clamp(24px,4vw,48px)] bottom-[clamp(24px,4vw,40px)] flex items-center">
        {slides.map((slide, i) => (
          <SlideDot
            key={slide.title}
            active={i === index}
            label={`Show ${slide.title}`}
            onClick={() => setIndex(i)}
            activeColor="#ffffff"
            idleColor="rgba(255,255,255,0.5)"
          />
        ))}
      </div>
    </Reveal>
  );
}
