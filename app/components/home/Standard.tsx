import { useEffect, useRef, type RefObject } from "react";
import { Link } from "react-router";
import { Reveal } from "../../lib/motion";
import { drawOrb, ORB, type Palette } from "../../lib/orb";
import { Eyebrow } from "../ui/Eyebrow";

const ORB_SEQUENCE: Palette[] = [ORB.sunset, ORB.violet, ORB.cyan, ORB.citrus, ORB.green];
const ORB_PHASE = 9;

const LEFT = [
  {
    n: "01",
    title: "Purposeful Formulations",
    body: "Evidence-backed ingredients, in forms your body absorbs, at doses that matter.",
  },
  {
    n: "02",
    title: "Ingredients Sourced by Vytae",
    body: "We buy every ingredient ourselves, from trusted global suppliers, to our own purity standards.",
  },
];

const RIGHT = [
  {
    n: "03",
    title: "Tested for Purity & Safety",
    body: "Every batch is checked by NABL-accredited labs before it reaches you.",
  },
  {
    n: "04",
    title: "Radical transparency, every batch",
    body: "Enter the batch number on your pack to trace its journey, source to shelf.",
    link: true,
  },
];

// Animated orb: cycles palettes, rotates, and pauses off-screen. Reduced motion draws one static frame.
function useOrbCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, sequence: Palette[], phase: number) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawOrb(cv, sequence, 0);
      return;
    }
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(cv);
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      if (visible) drawOrb(cv, sequence, (now - t0) / 1000 + phase);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [canvasRef, sequence, phase]);
}

function StandardItem({
  n,
  title,
  body,
  link,
  side,
}: {
  n: string;
  title: string;
  body: string;
  link?: boolean;
  side: "left" | "right";
}) {
  const alignment =
    side === "left"
      ? "items-end text-right max-[759px]:items-start max-[759px]:text-left"
      : "items-start text-left";
  return (
    <Reveal className={`flex flex-col gap-3.5 ${alignment}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-frost text-sm font-semibold tabular-nums">
        {n}
      </span>
      <span className="max-w-[320px] text-[clamp(24px,2.2vw,30px)] leading-[1.1] font-medium tracking-[-0.02em] text-balance">
        {title}
      </span>
      <span className="max-w-[340px] text-base leading-[1.6] text-pretty text-ink-soft">{body}</span>
      {link && (
        <Link to="/batch" className="border-b border-ink pb-0.5 text-[13px] font-semibold">
          Check your Batch Passport →
        </Link>
      )}
    </Reveal>
  );
}

export function Standard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useOrbCanvas(canvasRef, ORB_SEQUENCE, ORB_PHASE);

  return (
    <section
      data-screen-label="Standard"
      className="mx-auto max-w-[1320px] px-10 pt-[clamp(56px,6vw,88px)] pb-[clamp(80px,10vw,128px)]"
    >
      <div className="mb-[clamp(40px,5vw,64px)] flex flex-col items-center gap-[18px] text-center">
        <Eyebrow centered>The VYTAE Standard</Eyebrow>
        <Reveal
          as="h2"
          className="m-0 text-[clamp(44px,6vw,88px)] leading-none font-normal tracking-[-0.03em] text-balance"
        >
          Four checks. One standard.
        </Reveal>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] items-center gap-[clamp(32px,4vw,56px)] max-[759px]:grid-cols-[minmax(0,1fr)]">
        <div className="flex flex-col gap-[clamp(40px,6vw,80px)]">
          {LEFT.map((item) => (
            <StandardItem key={item.n} {...item} side="left" />
          ))}
        </div>
        <div className="flex justify-center max-[759px]:-order-1">
          <canvas ref={canvasRef} className="block aspect-square w-full max-w-[560px]" />
        </div>
        <div className="flex flex-col gap-[clamp(40px,6vw,80px)]">
          {RIGHT.map((item) => (
            <StandardItem key={item.n} {...item} side="right" />
          ))}
        </div>
      </div>
    </section>
  );
}
