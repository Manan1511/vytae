import { useEffect, useState } from "react";
import { inr, type Product } from "../../content/products";

// Anchor tabs that follow the section you are reading. The mini buy bar appears once the buy box has scrolled away.
const SECTION_IDS = ["why", "science", "proof", "reviews", "faq"];

export function ProductSubnav({
  product,
  added,
  addItem,
}: {
  product: Product;
  added: boolean;
  addItem: () => void;
}) {
  const [active, setActive] = useState("");
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      let current = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) current = id;
      }
      setActive(current);
      setPast(window.scrollY > 640);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs = [
    { label: "Why it works", id: "why" },
    ...(product.science ? [{ label: "Science", id: "science" }] : []),
    { label: "Batch Passport", id: "proof" },
    { label: "Reviews", id: "reviews" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <div className="sticky top-14 z-[25] border-b border-line-soft bg-[rgba(246,249,253,0.94)] shadow-[0_1px_0_#dde7f2] backdrop-blur-[12px]">
      <div className="mx-auto flex h-[60px] max-w-[1320px] items-center justify-between gap-5 px-[clamp(20px,3vw,40px)]">
        <nav aria-label="Product sections" className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const on = active === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className={`flex-none rounded-full px-3.5 py-2 text-[13px] font-semibold transition-[background-color,color] duration-300 ${
                  on ? "bg-ink text-white" : "text-ink"
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
        <div
          className="flex flex-none items-center gap-3.5 transition-[opacity,transform] duration-[400ms]"
          style={{
            opacity: past ? 1 : 0,
            transform: past ? "none" : "translateY(6px)",
            pointerEvents: past ? "auto" : "none",
          }}
        >
          <span className="hidden flex-col items-end leading-tight min-[760px]:flex">
            <span className="text-sm font-semibold">{product.name}</span>
            <span className="text-xs text-ink-muted">{inr(product.price)}</span>
          </span>
          <button
            type="button"
            onClick={addItem}
            className="cursor-pointer rounded-full bg-ink px-5 py-[11px] text-[13px] font-semibold whitespace-nowrap text-white hover:bg-ink-hover"
          >
            {added ? "Added ✓" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
