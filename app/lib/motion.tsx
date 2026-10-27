import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>;

// Fades and lifts an element in once it scrolls into view. Renders the element itself, no wrapper.
export function Reveal({ as = "div", delay = 0, className, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (shown || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return createElement(
    as,
    {
      ...rest,
      ref,
      className: ["reveal", shown && "is-in", className].filter(Boolean).join(" "),
      style: { ...style, "--reveal-delay": `${delay}ms` } as CSSProperties,
    },
    children,
  );
}

// Pointer and scroll effects from the design, on every page: a glow and a ring that follow the cursor, tilt on
// [data-tilt], a magnetic pull on primary buttons (and any [data-magnetic]) and parallax on [data-parallax] images.
// The pointer effects need a fine pointer. Everything is off under reduced motion.
const PRIMARY_FILL = "rgb(36, 73, 122)";
const HOT = "a,button,input,textarea,select,label,[data-tilt]";

export function MotionFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const glow = document.createElement("div");
    Object.assign(glow.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "560px",
      height: "560px",
      marginLeft: "-280px",
      marginTop: "-280px",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "1",
      background: "radial-gradient(circle, rgba(120,160,215,0.16) 0%, rgba(120,160,215,0) 62%)",
      mixBlendMode: "multiply",
      opacity: "0",
      transition: "opacity .6s",
    });
    const ring = document.createElement("div");
    Object.assign(ring.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "30px",
      height: "30px",
      marginLeft: "-15px",
      marginTop: "-15px",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "80",
      border: "1.5px solid rgba(27,54,93,0.45)",
      background: "rgba(27,54,93,0)",
      opacity: "0",
      transition: "opacity .3s, width .3s, height .3s, margin .3s, background .3s, border-color .3s",
    });
    if (fine) document.body.append(glow, ring);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;
    let rx = mx;
    let ry = my;
    let hot = false;
    let tiltEl: HTMLElement | null = null;
    let magEl: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      glow.style.opacity = "1";
      ring.style.opacity = "1";
      const target = e.target instanceof Element ? e.target : null;

      const isHot = target?.closest(HOT) != null;
      if (isHot !== hot) {
        hot = isHot;
        Object.assign(
          ring.style,
          isHot
            ? {
                width: "46px",
                height: "46px",
                marginLeft: "-23px",
                marginTop: "-23px",
                background: "rgba(27,54,93,0.08)",
                borderColor: "rgba(27,54,93,0.25)",
              }
            : {
                width: "30px",
                height: "30px",
                marginLeft: "-15px",
                marginTop: "-15px",
                background: "rgba(27,54,93,0)",
                borderColor: "rgba(27,54,93,0.45)",
              },
        );
      }

      const tl = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tiltEl && tiltEl !== tl) {
        tiltEl.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)";
        tiltEl.style.transform = "";
        tiltEl = null;
      }
      if (tl) {
        const r = tl.getBoundingClientRect();
        const px = (mx - r.left) / r.width - 0.5;
        const py = (my - r.top) / r.height - 0.5;
        tl.style.transition = "transform .15s ease-out";
        tl.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
        tiltEl = tl;
      }

      const mg = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magEl && magEl !== mg) {
        magEl.style.transition = "transform .5s cubic-bezier(.3,1.5,.5,1)";
        magEl.style.transform = "";
        magEl = null;
      }
      if (mg) {
        const r = mg.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        mg.style.transition = "transform .2s ease-out";
        mg.style.transform = `translate(${(dx * 0.18).toFixed(1)}px,${(dy * 0.28).toFixed(1)}px)`;
        magEl = mg;
      }
    };
    const onLeave = () => {
      glow.style.opacity = "0";
      ring.style.opacity = "0";
    };

    let raf = 0;
    const frame = () => {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      rx += (mx - rx) * 0.28;
      ry += (my - ry) * 0.28;
      glow.style.transform = `translate3d(${gx}px,${gy}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const box = el.parentElement?.getBoundingClientRect();
        if (!box || box.bottom < 0 || box.top > vh) return;
        const p = (box.top + box.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0,${(p * -48).toFixed(1)}px,0) scale(1.14)`;
      });
      raf = requestAnimationFrame(frame);
    };

    const tagMagnetic = () => {
      document.querySelectorAll<HTMLElement>("a, button").forEach((el) => {
        if (!el.hasAttribute("data-magnetic") && getComputedStyle(el).backgroundImage.includes(PRIMARY_FILL)) {
          el.setAttribute("data-magnetic", "");
        }
      });
    };
    tagMagnetic();
    let timer = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tagMagnetic, 80);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      glow.remove();
      ring.remove();
    };
  }, []);

  return null;
}
