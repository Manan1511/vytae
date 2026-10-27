import { Link } from "react-router";
import type { Post } from "../../lib/catalog";
import { Reveal } from "../../lib/motion";
import { Eyebrow } from "../ui/Eyebrow";

export function Science({ articles }: { articles: Post[] }) {
  return (
    <section id="science" data-screen-label="Science band" className="mx-auto max-w-[1320px] px-10 pb-[clamp(80px,10vw,128px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-stretch gap-[clamp(40px,6vw,96px)]">
        <div className="flex flex-col justify-between gap-10 py-[clamp(8px,2vw,24px)]">
          <Eyebrow>Our Science</Eyebrow>
          <div className="flex max-w-[520px] flex-col gap-6">
            <Reveal as="h2" className="m-0 text-[clamp(40px,4.8vw,68px)] leading-none font-normal tracking-[-0.03em] text-balance">
              Made for what your body absorbs.
            </Reveal>
            <Reveal as="p" className="m-0 text-[17px] leading-[1.6] text-ink-body text-pretty">
              We look at the details at every stage — the form, the dose and how it works with your body — because
              consistency matters.
            </Reveal>
            <Reveal
              as={Link}
              to="/science"
              className="inline-flex items-center gap-4 self-start rounded-full bg-ink py-1.5 pr-1.5 pl-[26px] text-[15px] font-semibold text-white hover:bg-ink-hover"
            >
              Discover
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.16)]">
                <svg width={12} height={12} viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </Reveal>
          </div>
        </div>
        <Reveal className="relative min-h-[clamp(360px,44vw,620px)] overflow-hidden rounded-[28px] bg-[#c9d8ea]">
          <img
            src="/assets/science-body-c.webp"
            alt="VYTAE formulation science"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </Reveal>
      </div>

      <div className="no-scrollbar mt-[clamp(40px,5vw,64px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-4 gap-y-10 max-[759px]:-mx-10 max-[759px]:grid-flow-col max-[759px]:auto-cols-[82%] max-[759px]:grid-cols-none max-[759px]:snap-x max-[759px]:snap-mandatory max-[759px]:overflow-x-auto max-[759px]:px-10 max-[759px]:pb-6 max-[759px]:scroll-px-10">
        {articles.map((a) => (
          <Reveal
            key={a.slug}
            as={Link}
            to={`/science/${a.slug}`}
            className="group flex snap-start flex-col gap-4 overflow-hidden rounded-3xl border border-line bg-white text-ink shadow-[0_1px_0_rgba(27,54,93,0.04),0_24px_48px_-32px_rgba(27,54,93,0.28)]"
          >
            <span className="relative block aspect-[4/3] overflow-hidden bg-frost">
              <img src={a.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute top-3.5 left-3.5 rounded-full bg-white px-[11px] py-[5px] text-xs font-semibold">
                {a.category}
              </span>
            </span>
            <span className="flex flex-col gap-2 px-[22px] pt-1 pb-6">
              <span className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">{a.minutes} read</span>
              <span className="text-[clamp(20px,1.7vw,24px)] leading-[1.2] font-medium tracking-[-0.015em] text-balance">
                {a.title}
              </span>
              <span className="text-sm leading-[1.55] text-ink-soft">{a.desc}</span>
              <span className="mt-1 text-[13px] font-semibold">Read article →</span>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
