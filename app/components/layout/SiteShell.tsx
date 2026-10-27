import { useEffect, useState, type ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WhatsAppFab } from "./WhatsAppFab";

// Scroll position as a 0–1 share of the page. Drives the thin line along the top of solid-header pages.
function useScrollProgress(enabled: boolean) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);
  return progress;
}

type SiteShellProps = {
  children: ReactNode;
  // "hero" overlays the header on a full-bleed hero. "solid" keeps the header in flow on every scroll position.
  variant?: "hero" | "solid";
  active?: string;
};

export function SiteShell({ children, variant = "hero", active }: SiteShellProps) {
  const progress = useScrollProgress(variant === "solid");

  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#ffffff_0%,#f1f6fc_22%,#e3edf8_60%,#d3e2f2_100%)] text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] opacity-[0.06] mix-blend-multiply"
        style={{ backgroundImage: "url(/assets/grain.svg)" }}
      />
      {variant === "solid" && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-[60] h-0.5 w-full origin-left bg-ink"
          style={{ transform: `scaleX(${progress})` }}
        />
      )}
      <AnnouncementBar />
      <SiteHeader variant={variant} active={active} />
      <main>
        {children}
        <WhatsAppFab />
      </main>
      <SiteFooter />
    </div>
  );
}
