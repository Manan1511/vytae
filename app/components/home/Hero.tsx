import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Reveal } from "../../lib/motion";
import type { HeroSlide } from "../../lib/catalog";

const INTERVAL_MS = 7000;

// Slides crossfade in place. Each slide's copy shares one grid cell, so the tallest copy sets the height.
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section data-screen-label="Hero" className="hero bg-hero text-white">
      {slides.map((slide, i) => (
        <img
          key={`image-${i}`}
          src={slide.image}
          alt={i === index ? slide.alt : ""}
          aria-hidden={i !== index || undefined}
          className="hero-media transition-opacity duration-[800ms] ease-soft"
          style={{ opacity: i === index ? 1 : 0 }}
          fetchPriority={i === 0 ? "high" : undefined}
        />
      ))}
      <div aria-hidden="true" className="hero-scrim" />

      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-[clamp(20px,5vw,40px)] pt-[clamp(100px,10vw,130px)] pb-[clamp(56px,8vw,96px)]">
        <div className="grid">
          {slides.map((slide, i) => (
            <div
              key={`copy-${i}`}
              inert={i !== index}
              className="col-start-1 row-start-1 flex max-w-[480px] flex-col gap-6 transition-opacity duration-[800ms] ease-soft"
              style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
            >
              <Reveal className="flex items-center gap-2 self-start rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.14)] px-3.5 py-[7px] text-xs font-semibold tracking-[0.02em] backdrop-blur-[6px]">
                {slide.eyebrow}
              </Reveal>
              <Reveal as="h1" className="m-0 text-[clamp(48px,6vw,92px)] leading-[0.98] font-normal tracking-[-0.03em] text-balance">
                {slide.headline}
              </Reveal>
              <Reveal as="p" className="m-0 max-w-[440px] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-[rgba(255,255,255,0.9)] text-pretty">
                {slide.lead}
              </Reveal>
              <Reveal className="flex flex-wrap gap-3 pt-1">
                <a
                  href="#collection"
                  className="inline-flex items-center rounded-full bg-white px-[30px] py-4 text-[15px] font-semibold whitespace-nowrap text-ink hover:bg-frost"
                >
                  Explore the collection <span className="ml-2">→</span>
                </a>
                <Link
                  to="/science"
                  className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.6)] px-[26px] py-[15px] text-[15px] font-semibold whitespace-nowrap text-white hover:bg-[rgba(255,255,255,0.12)]"
                >
                  Our science
                </Link>
              </Reveal>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-label={`Show slide ${i + 1}: ${slide.headline}`}
                onClick={() => setIndex(i)}
                className="h-1.5 cursor-pointer rounded-full border-0 p-0 transition-[width,background-color] duration-500"
                style={{ width: i === index ? 28 : 6, background: i === index ? "#ffffff" : "rgba(255,255,255,0.5)" }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
