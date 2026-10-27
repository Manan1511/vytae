import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useBagCount } from "../../lib/bag";
import { Stroke } from "../ui/icons";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Science", to: "/science" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

function useScrolled(threshold: number) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function SiteHeader() {
  const scrolled = useScrolled(40);
  const bagCount = useBagCount();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={[
        "sticky top-0 z-30 -mb-14 h-14 transition-[background-color,color,box-shadow] duration-[400ms] ease-in-out",
        scrolled
          ? "bg-[rgba(246,249,253,0.95)] text-ink shadow-[0_8px_24px_-20px_rgba(27,54,93,0.35)] backdrop-blur-[12px]"
          : "bg-transparent text-white",
      ].join(" ")}
    >
      <div className="mx-auto grid h-full max-w-[1320px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-[clamp(16px,3vw,40px)] whitespace-nowrap min-[760px]:gap-6">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="-ml-[11px] hidden h-11 w-11 cursor-pointer justify-self-start border-0 bg-transparent p-0 [color:inherit] max-[959px]:block"
        >
          <span className="relative mx-auto block h-3.5 w-[22px]">
            <span
              className="absolute inset-x-0 top-0 h-[1.6px] rounded-[2px] bg-current transition-transform duration-300 ease-soft"
              style={{ transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }}
            />
            <span
              className="absolute inset-x-0 top-[6px] h-[1.6px] rounded-[2px] bg-current transition-opacity duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="absolute inset-x-0 top-3 h-[1.6px] rounded-[2px] bg-current transition-transform duration-300 ease-soft"
              style={{ transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }}
            />
          </span>
        </button>

        <nav className="hidden gap-[26px] text-[13px] font-medium tracking-[0.01em] min-[960px]:flex">
          {NAV.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="border-b border-transparent py-1.5 [color:inherit] transition-colors duration-[250ms] hover:border-current"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="col-start-2 pl-[0.32em] text-[17px] font-bold tracking-[0.32em] [color:inherit]">
          VYTAE
        </Link>

        <div className="col-start-3 flex items-center justify-self-end gap-[10px] text-[13px] font-medium min-[760px]:gap-[22px]">
          <Link
            to="/batch"
            title="Check your Batch Passport"
            className="flex items-center border-b border-current py-1 text-[13px] font-semibold tracking-[0.01em] whitespace-nowrap [color:inherit] hover:opacity-75"
          >
            <span className="hidden min-[760px]:inline">Batch-Verification</span>
            <span className="min-[760px]:hidden">Verify</span>
          </Link>
          <Link to="/account" aria-label="Account" className="flex items-center p-1 [color:inherit]">
            <Stroke size={20}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </Stroke>
          </Link>
          <Link to="/bag" aria-label="Bag" className="relative flex items-center p-1 [color:inherit]">
            <Stroke size={20}>
              <path d="M5 8h14l-1 12H6z" />
              <path d="M9 8a3 3 0 0 1 6 0" />
            </Stroke>
            {bagCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-ink px-1 text-[10px] leading-[17px] font-bold text-white tabular-nums shadow-[0_0_0_2px_#f6f9fd]">
                {bagCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="absolute top-14 right-0 left-0 z-40 hidden flex-col bg-mist px-5 pt-2 pb-5 text-ink shadow-[0_1px_0_#dde7f2,0_24px_40px_-24px_rgba(27,54,93,0.3)] max-[959px]:flex">
          {NAV.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="border-b border-line-soft py-3.5 text-[22px] tracking-[-0.01em] text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
