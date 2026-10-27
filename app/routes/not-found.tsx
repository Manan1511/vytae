import { Link } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";

export function meta() {
  return [{ title: "Page not found | VYTAE" }];
}

export default function NotFound() {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-[1320px] flex-col items-start gap-5 px-10 pt-[clamp(140px,16vw,220px)] pb-[clamp(80px,10vw,128px)]">
        <span className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">Error 404</span>
        <h1 className="m-0 text-[clamp(44px,6vw,88px)] leading-none font-normal tracking-[-0.03em] text-balance">
          This page is off the shelf.
        </h1>
        <p className="m-0 max-w-[440px] text-base leading-[1.6] text-ink-soft">
          The page you were looking for doesn’t exist or has moved.
        </p>
        <Link to="/" className="mt-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink-hover">
          Back to home
        </Link>
      </section>
    </SiteShell>
  );
}
