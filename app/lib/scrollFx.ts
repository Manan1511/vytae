import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

const EASE = "cubic-bezier(.2,.7,.2,1)";
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const onScrollOrResize = (fn: () => void) => {
  window.addEventListener("scroll", fn, { passive: true });
  window.addEventListener("resize", fn);
  return () => {
    window.removeEventListener("scroll", fn);
    window.removeEventListener("resize", fn);
  };
};
const frame = (fn: () => void) => {
  let raf = 0;
  return () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fn);
  };
};

// Cards that pile up under the sticky header on phones. Each card shrinks and dims slightly as the next one
// slides over it. A card too tall to sit fully under the header is left to scroll. Cards are the [data-stack-card] children of `ref`; wider screens and reduced motion leave them alone.
export function useStackedCards(ref: RefObject<HTMLElement | null>, top: number) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const narrow = window.matchMedia("(max-width: 759px)");
    const cards = () => [...root.querySelectorAll<HTMLElement>("[data-stack-card]")];
    let stacked = false;

    const reset = () => {
      cards().forEach((c) => c.removeAttribute("style"));
      stacked = false;
    };
    const update = () => {
      if (!narrow.matches || reducedMotion()) {
        if (stacked) reset();
        return;
      }
      stacked = true;
      const list = cards();
      const vh = window.innerHeight;
      list.forEach((c, i) => {
        // A card taller than the room under the header would have its heading tucked behind it, so it scrolls normally.
        if (c.offsetHeight > vh - top - 16) {
          c.removeAttribute("style");
          return;
        }
        const stick = top;
        const next = list[i + 1];
        let p = 0;
        if (next) {
          const end = Math.max(top, stick) + 24;
          p = Math.max(0, Math.min(1, (vh - next.getBoundingClientRect().top) / (vh - end)));
        }
        Object.assign(c.style, {
          animation: "none",
          opacity: "1",
          position: "sticky",
          top: `${stick}px`,
          zIndex: String(i + 1),
          transform: `scale(${(1 - 0.06 * p).toFixed(4)})`,
          filter: `brightness(${(1 - 0.08 * p).toFixed(3)})`,
        });
      });
    };

    const tick = frame(update);
    update();
    const off = onScrollOrResize(tick);
    return () => {
      off();
      reset();
    };
  }, [ref, top]);
}

// Keeps the active tab of a horizontally scrolling tab row on screen, scrolling only the row itself.
export function useFollowActiveTab(navRef: RefObject<HTMLElement | null>, active: string) {
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!nav || !tab) return;
    const left = tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? "auto" : "smooth" });
  }, [navRef, active]);
}

// The passport page's scroll story. A green line fills down the stages as you read, each handover lights up with a
// pulse when the line reaches it, stage cards rise in and the one under the reading line is highlighted, and the
// three checkpoint cards pop in with their tick and result pill.
export function usePassportFlow(wrapRef: RefObject<HTMLElement | null>, glanceRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const reduce = reducedMotion();
    const fill = wrap.querySelector<HTMLElement>("[data-flow-fill]");
    const nodes = [...wrap.querySelectorAll<HTMLElement>("[data-node]")];
    const boxes = [...wrap.querySelectorAll<HTMLElement>("[data-stage]")];
    const vh = () => window.innerHeight;
    const set = (n: HTMLElement, on: boolean) => {
      n.dataset.on = on ? "1" : "";
      n.style.borderColor = on ? "#16a34a" : "#cddbeb";
      n.querySelector<HTMLElement>("[data-dot]")!.style.background = on ? "#16a34a" : "#cddbeb";
    };

    boxes.forEach((el) => {
      if (!reduce && el.getBoundingClientRect().top > vh() * 0.9) {
        el.style.opacity = "0";
        el.style.transform = "translateY(40px) scale(0.98)";
      }
      el.style.transition = `opacity .9s ${EASE}, transform .9s ${EASE}, border-color .5s ${EASE}, box-shadow .5s ${EASE}`;
    });
    nodes.forEach((n) => set(n, false));

    const tick = () => {
      const r = wrap.getBoundingClientRect();
      const line = vh() * 0.62;
      const h = reduce ? r.height : Math.max(0, Math.min(r.height, line - r.top));
      if (fill) fill.style.height = `${h}px`;
      nodes.forEach((n) => {
        const on = h >= n.getBoundingClientRect().top + 7 - r.top;
        if (on && !n.dataset.on) {
          set(n, true);
          if (!reduce) {
            n.querySelector<HTMLElement>("[data-ring]")?.animate(
              [
                { transform: "scale(1)", opacity: 0.8 },
                { transform: "scale(2.6)", opacity: 0 },
              ],
              { duration: 1100, easing: EASE },
            );
          }
        } else if (!on && n.dataset.on) set(n, false);
      });
      boxes.forEach((el) => {
        const b = el.getBoundingClientRect();
        if (el.style.opacity === "0" && b.top < vh() * 0.88) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
        const act = !reduce && b.top < line && b.bottom > line;
        if (act !== (el.dataset.act === "1")) {
          el.dataset.act = act ? "1" : "";
          el.style.borderColor = act ? "#a9c2df" : "#cddbeb";
          el.style.boxShadow = act ? "0 0 0 4px rgba(205,219,235,0.55), 0 32px 64px -40px rgba(70,110,160,0.35)" : "none";
        }
      });
    };

    const run = frame(tick);
    tick();
    const off = onScrollOrResize(run);

    // Checkpoint cards: held back until the row scrolls into view, then staggered in.
    const glance = glanceRef.current;
    let io: IntersectionObserver | undefined;
    if (glance && !reduce) {
      const cards = [...glance.querySelectorAll<HTMLElement>("[data-glance]")];
      cards.forEach((c) => (c.style.opacity = "0"));
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io?.disconnect();
          cards.forEach((c, i) => {
            const d = i * 140;
            c.style.opacity = "";
            c.animate(
              [
                { opacity: 0, transform: "translateY(36px) scale(0.97)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 900, delay: d, easing: EASE, fill: "backwards" },
            );
            c.querySelector("[data-gcheck]")?.animate(
              [
                { transform: "scale(0)", opacity: 0 },
                { transform: "scale(1.25)", opacity: 1, offset: 0.7 },
                { transform: "scale(1)", opacity: 1 },
              ],
              { duration: 600, delay: d + 650, easing: EASE, fill: "backwards" },
            );
            c.querySelector("[data-gpill]")?.animate(
              [
                { opacity: 0, transform: "translateY(8px)", clipPath: "inset(0 100% 0 0 round 999px)" },
                { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0 round 999px)" },
              ],
              { duration: 700, delay: d + 850, easing: EASE, fill: "backwards" },
            );
          });
        },
        { threshold: 0.25 },
      );
      io.observe(glance);
    }

    return () => {
      off();
      io?.disconnect();
    };
  }, [wrapRef, glanceRef]);
}

type Pin = { narrow: boolean; dist: number; vh: number; ch: number };

// On phones the three checkpoint cards sit in a row that is pinned while the page scrolls, and the row slides
// sideways in step with the scroll. `bar` is the little progress line under it. Returns the sizes the markup needs.
export function usePinnedTrack(
  pinRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  barRef: RefObject<HTMLElement | null>,
): Pin {
  const [pin, setPin] = useState<Pin>({ narrow: false, dist: 0, vh: 800, ch: 0 });

  useLayoutEffect(() => {
    const narrow = window.innerWidth < 760;
    setPin((p) => (p.narrow === narrow ? p : { ...p, narrow }));
  }, []);

  // Measure after layout and again when fonts or the viewport change.
  useEffect(() => {
    const measure = () => {
      const t = trackRef.current;
      const narrow = window.innerWidth < 760;
      if (!t) return;
      if (!narrow) {
        t.style.transform = "";
        setPin((p) => (p.narrow ? { ...p, narrow, dist: 0 } : p));
        return;
      }
      const parent = t.parentElement!;
      const next = {
        narrow,
        dist: Math.max(0, t.scrollWidth - parent.clientWidth + 40),
        vh: window.innerHeight,
        ch: parent.offsetHeight,
      };
      setPin((p) => (p.narrow === narrow && p.dist === next.dist && p.vh === next.vh && p.ch === next.ch ? p : next));
    };
    const run = frame(measure);
    run();
    const timer = window.setTimeout(run, 400);
    window.addEventListener("resize", run);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", run);
    };
  }, [trackRef, pin.narrow]);

  useEffect(() => {
    const el = pinRef.current;
    const t = trackRef.current;
    if (!el || !t) return undefined;
    if (!pin.narrow) {
      t.style.transform = "";
      return undefined;
    }
    const reduce = reducedMotion();
    let target = 0;
    let cur = 0;
    let raf = 0;
    const step = () => {
      raf = 0;
      const diff = target - cur;
      cur = reduce || Math.abs(diff) < 0.0005 ? target : cur + diff * 0.14;
      t.style.transform = `translate3d(${(-cur * pin.dist).toFixed(2)}px,0,0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${(0.333 + cur * 0.667).toFixed(4)})`;
      if (cur !== target) raf = requestAnimationFrame(step);
    };
    const tick = () => {
      const start = pin.vh - pin.ch - 24;
      target = pin.dist > 0 ? Math.min(1, Math.max(0, (start - el.getBoundingClientRect().top) / pin.dist)) : 0;
      if (!raf) raf = requestAnimationFrame(step);
    };
    tick();
    const off = onScrollOrResize(tick);
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, [pinRef, trackRef, barRef, pin]);

  return pin;
}
