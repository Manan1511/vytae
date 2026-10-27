import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Reveal } from "../lib/motion";

export function meta() {
  return [
    { title: "About | VYTAE" },
    { name: "description", content: "VYTAE makes considered supplements for everyday rituals, traceable down to the batch." },
  ];
}

// Tones for the three value circles, in the order they light up.
const TONES = [
  [122, 214, 190],
  [118, 140, 255],
  [246, 178, 107],
];

const VALUES = [
  { n: "01", t: "Trust", d: "Clear labels, honest language and a Batch Passport behind every batch." },
  {
    n: "02",
    t: "Science",
    d: "Ingredients chosen for a defined role, in forms and amounts with a reason behind them.",
  },
  { n: "03", t: "Ritual", d: "Simple steps designed to fit into the routines you already have." },
];

const STEPS = [
  { n: "01", t: "Formulate", d: "Every ingredient earns its place." },
  { n: "02", t: "Source", d: "Raw materials from qualified suppliers." },
  { n: "03", t: "Make & test", d: "Produced and checked against defined specifications." },
  { n: "04", t: "Trace", d: "Each batch recorded and linked to its Batch Passport." },
];

export default function AboutPage() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [scrollLit, setScrollLit] = useState(0);
  const [hover, setHover] = useState(0);
  const [narrow, setNarrow] = useState(false);

  // Values light up as the row scrolls into view, and when hovered.
  useEffect(() => {
    const onScroll = () => {
      const el = rowRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const p = (window.innerHeight * 0.92 - top) / (window.innerHeight * 0.45);
      setScrollLit(Math.min(3, Math.max(0, Math.ceil(p * 3))));
      setNarrow(window.innerWidth < 900);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const lit = Math.max(hover, scrollLit);
  const dir = narrow ? "180deg" : "90deg";

  return (
    <SiteShell variant="solid" active="About">
      <section data-screen-label="Intro" className="mx-auto max-w-[1320px] px-10 pt-[clamp(56px,7vw,104px)] pb-[clamp(48px,6vw,80px)]">
        <div className="flex max-w-[980px] flex-col gap-5">
          <Eyebrow>About VYTAE</Eyebrow>
          <Reveal as="h1" className="m-0 text-[clamp(44px,6vw,92px)] leading-none font-normal tracking-[-0.035em] text-balance">
            We believe wellness should be easy to trust.
          </Reveal>
          <p className="m-0 max-w-[600px] text-[19px] leading-[1.6] text-pretty text-ink-body">
            VYTAE makes considered supplements for everyday rituals — clearly formulated, carefully made and traceable down
            to the batch.
          </p>
        </div>
      </section>

      <section data-screen-label="Image" className="px-3">
        <div className="relative mx-auto aspect-[16/7] max-w-[1480px] min-h-[300px] overflow-hidden rounded-[28px] bg-frost">
          <img src="/assets/life-group.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </section>

      <section data-screen-label="Story" className="mx-auto max-w-[1320px] px-10 py-[clamp(80px,10vw,128px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-[clamp(32px,6vw,96px)]">
          <div className="flex flex-col gap-4">
            <Eyebrow>Our story</Eyebrow>
            <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em] text-balance">
              Why we started VYTAE.
            </Reveal>
          </div>
          <div className="flex flex-col gap-5 text-[17px] leading-[1.7] text-ink-body">
            <p className="m-0">
              Choosing a supplement shouldn’t require a chemistry degree. Too often, labels are crowded, claims are loud and
              it’s hard to know what’s actually inside.
            </p>
            <p className="m-0">
              We started VYTAE to do the opposite: fewer, purposeful ingredients; plain-language labels; and a Batch Passport
              on every pack so you can see exactly where your batch came from.
            </p>
            <p className="m-0">Our first ritual is sleep. It won’t be our last. [Founder story — to be confirmed.]</p>
          </div>
        </div>
      </section>

      <section id="values" data-screen-label="Values" className="px-3 pb-[clamp(80px,10vw,128px)]">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,#21406f_0%,#2a4c7c_45%,#3a6aa3_100%)] px-[clamp(24px,5vw,72px)] py-[clamp(48px,6vw,88px)] text-white">
          <div className="relative flex flex-col gap-4">
            <Eyebrow tone="light">Our values</Eyebrow>
            <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em]">
              What we stand for.
            </Reveal>
          </div>
          <div
            ref={rowRef}
            className="relative mx-auto mt-[clamp(40px,5vw,64px)] flex max-w-[1080px] flex-col items-center justify-center text-center min-[900px]:flex-row min-[900px]:items-start"
          >
            {VALUES.map((v, i) => {
              const on = i < lit;
              const c = TONES[i].join(",");
              const next = (TONES[i + 1] ?? TONES[i]).join(",");
              const fraction = Math.min(1, Math.max(0, lit - (i + 1)));
              return (
                <Fragment key={v.n}>
                  <div
                    className="flex w-[clamp(200px,22vw,260px)] flex-col items-center gap-[22px]"
                    onMouseEnter={() => setHover(i + 1)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <div
                      className="flex aspect-square w-[clamp(140px,13vw,176px)] flex-col items-center justify-center gap-3 rounded-full border-[1.5px] transition-[border-color,box-shadow,background,transform] duration-[800ms] ease-soft"
                      style={{
                        borderColor: on ? `rgba(${c},0.95)` : "rgba(255,255,255,0.22)",
                        background: `radial-gradient(circle, ${on ? `rgba(${c},0.16)` : "rgba(255,255,255,0.03)"} 0%, rgba(255,255,255,0) 70%)`,
                        boxShadow: on
                          ? `0 0 36px rgba(${c},0.55), 0 0 90px rgba(${c},0.18), inset 0 0 40px rgba(${c},0.25)`
                          : "none",
                        transform: on ? "scale(1)" : "scale(0.96)",
                      }}
                    >
                      <span className="pl-[0.3em] text-[13px] tracking-[0.3em] text-white/75">{v.n}</span>
                      <span className="pl-[0.22em] text-[clamp(14px,1.2vw,16px)] font-bold tracking-[0.22em] uppercase">
                        {v.t}
                      </span>
                    </div>
                    <p
                      className="m-0 max-w-[240px] text-[15px] leading-[1.6] text-white/80 transition-[opacity,transform] duration-[800ms] ease-soft"
                      style={{ opacity: on ? 1 : 0.45, transform: on ? "none" : "translateY(6px)" }}
                    >
                      {v.d}
                    </p>
                  </div>
                  {i < VALUES.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="relative my-5 h-12 w-0.5 overflow-hidden rounded-sm min-[900px]:my-0 min-[900px]:mt-[calc(clamp(140px,13vw,176px)/2-1px)] min-[900px]:h-0.5 min-[900px]:w-[clamp(32px,5vw,80px)]"
                      style={{
                        background: `repeating-linear-gradient(${dir}, rgba(255,255,255,0.28) 0 4px, rgba(255,255,255,0) 4px 10px)`,
                      }}
                    >
                      <span
                        className="absolute top-0 left-0 transition-[width,height] duration-1000"
                        style={{
                          width: narrow ? "100%" : `${fraction * 100}%`,
                          height: narrow ? `${fraction * 100}%` : "100%",
                          background: `linear-gradient(${dir}, rgb(${c}), rgb(${next}))`,
                          boxShadow: `0 0 10px rgb(${next})`,
                        }}
                      />
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>

      <section data-screen-label="Process" className="mx-auto max-w-[1320px] px-10 pb-[clamp(80px,10vw,128px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(32px,5vw,72px)]">
          <div className="relative aspect-[4/5] max-h-[620px] overflow-hidden rounded-3xl bg-frost">
            <img src="/assets/test-tubes.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Eyebrow>How we work</Eyebrow>
              <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em]">
                From formula to front door.
              </Reveal>
            </div>
            <div className="flex flex-col">
              {STEPS.map((s) => (
                <Reveal key={s.n} className="grid grid-cols-[48px_1fr] gap-4 border-t border-[#dbe5f1] py-5">
                  <span className="text-[13px] font-semibold text-ink-muted">{s.n}</span>
                  <span className="flex flex-col gap-1">
                    <span className="text-lg">{s.t}</span>
                    <span className="text-[15px] leading-[1.55] text-[#5f7797]">{s.d}</span>
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-screen-label="CTA" className="mx-auto max-w-[1320px] px-10 pb-[clamp(80px,10vw,128px)] text-center">
        <div className="flex flex-col items-center gap-[22px]">
          <Eyebrow centered>Get started</Eyebrow>
          <Reveal as="h2" className="m-0 text-[clamp(40px,4.6vw,64px)] leading-[1.02] font-normal tracking-[-0.03em] text-balance">
            Start your VYTAE ritual.
          </Reveal>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full bg-[linear-gradient(180deg,#24497a_0%,#26497a_100%)] px-7 py-[15px] text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_24px_-14px_rgba(30,62,106,0.7)] hover:brightness-110"
            >
              Shop the collection
            </Link>
            <Link to="/science" className="rounded-full border border-ink px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-frost">
              Read the science
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
