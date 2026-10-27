import type { ReactNode } from "react";
import { Reveal } from "../../lib/motion";

export function Eyebrow({
  children,
  tone = "ink",
  centered = false,
}: {
  children: ReactNode;
  tone?: "ink" | "light";
  centered?: boolean;
}) {
  const light = tone === "light";
  return (
    <Reveal
      className={[
        "flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] uppercase",
        centered && "justify-center",
        light ? "text-[rgba(255,255,255,0.8)]" : "text-ink-muted",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${light ? "bg-white" : "bg-ink"}`} />
      {children}
    </Reveal>
  );
}
