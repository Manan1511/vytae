import type { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WhatsAppFab } from "./WhatsAppFab";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#ffffff_0%,#f1f6fc_22%,#e3edf8_60%,#d3e2f2_100%)] text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] opacity-[0.06] mix-blend-multiply"
        style={{ backgroundImage: "url(/assets/grain.svg)" }}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}
