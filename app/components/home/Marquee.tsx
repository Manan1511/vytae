import { Stroke } from "../ui/icons";

const ITEMS = [
  { label: "Third-party tested", d: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zM9 12l2 2 4-4" },
  { label: "Batch-traceable", d: "M4 6v12M7 6v12M11 6v12M14 6v12M18 6v12M20 6v12" },
  {
    label: "[Certification]",
    d: "M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM8.5 14l-1.5 7 5-3 5 3-1.5-7",
  },
  { label: "Clear formulations", d: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9" },
  { label: "Purposeful ingredients", d: "M12 21V11M12 11c0-4 3-7 8-7 0 5-3 7-8 7zM12 14c0-3-2-5-7-5 0 4 2 5 7 5z" },
];

// The track is rendered twice so the -50% loop is seamless. The second copy is hidden from assistive tech.
export function Marquee() {
  return (
    <section aria-label="VYTAE standards" className="overflow-hidden border-b border-line-soft bg-mist py-5">
      <div className="marquee flex w-max">
        {[false, true].map((duplicate) => (
          <div key={String(duplicate)} aria-hidden={duplicate || undefined} className="flex">
            {ITEMS.map((item) => (
              <span
                key={`${item.label}-${duplicate}`}
                className="flex shrink-0 items-center gap-3 px-[clamp(24px,3vw,44px)] text-sm font-medium whitespace-nowrap"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-frost">
                  <Stroke size={18} strokeWidth={1.5}>
                    <path d={item.d} />
                  </Stroke>
                </span>
                {item.label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
