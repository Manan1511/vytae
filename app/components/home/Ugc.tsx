import { UGC } from "../../content/home";
import { Reveal } from "../../lib/motion";
import { Eyebrow } from "../ui/Eyebrow";
import { Fill } from "../ui/icons";

// Video tiles have no media yet, so they render as framed placeholders until creator content is supplied.
export function Ugc() {
  return (
    <section id="ugc" data-screen-label="UGC videos" className="mx-auto max-w-[1320px] px-10 pb-[clamp(80px,10vw,128px)]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <Eyebrow>From our community</Eyebrow>
          <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em] text-balance">
            Real rituals, real nights.
          </Reveal>
        </div>
        <a href="#" className="border-b border-ink pb-0.5 text-[13px] font-semibold whitespace-nowrap">
          Share yours @vytae
        </a>
      </div>

      <div className="no-scrollbar grid auto-cols-[minmax(220px,1fr)] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto">
        {UGC.map((u, i) => (
          <Reveal key={i} className="relative aspect-[9/16] snap-start overflow-hidden rounded-[20px] bg-frost">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,rgba(30,62,106,0)_0%,rgba(30,62,106,0.75)_100%)]"
            />
            <span className="pointer-events-none absolute top-1/2 left-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)]">
              <Fill size={16} d="M8 5v14l11-7z" className="text-ink" />
            </span>
            <div className="pointer-events-none absolute right-3.5 bottom-3.5 left-3.5 flex flex-col gap-1.5 text-white">
              <span className="self-start rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink">
                {u.product}
              </span>
              <span className="text-sm font-semibold">{u.handle}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
