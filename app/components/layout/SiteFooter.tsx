import { Link } from "react-router";
import { whatsappUrl } from "../../lib/whatsapp";
import { BRAND_PATHS } from "../ui/brand";
import { Fill, Stroke } from "../ui/icons";

const SOCIAL_LINK_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] text-white transition-colors duration-[250ms] hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)]";

const FOOTER_LINK_CLASS =
  "flex items-center gap-2 text-sm text-[rgba(255,255,255,0.92)] hover:text-white hover:underline hover:underline-offset-4";

type FooterLink = { label: string; to: string; whatsapp?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/shop" },
      { label: "Night Onset", to: "/products/night-reset" },
      { label: "Rest Well", to: "/products/rest-well" },
      { label: "The Sleep Ritual", to: "/products/sleep-ritual" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Our science", to: "/science" },
      { label: "Articles", to: "/science" },
      { label: "Batch Passport", to: "/batch" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About VYTAE", to: "/about" },
      { label: "Contact us", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", to: "/contact#faq" },
      { label: "Shipping & returns", to: "/policies/refund" },
      { label: "My account", to: "/account" },
      { label: "WhatsApp", to: "/contact#whatsapp", whatsapp: true },
    ],
  },
];

const BADGES = ["[Certification]", "Third-party tested", "Batch-traceable", "Full ingredient disclosure"];

const LEGAL = [
  { label: "Privacy Policy", to: "/policies/privacy" },
  { label: "Terms", to: "/policies/terms" },
  { label: "Refund Policy", to: "/policies/refund" },
];

function FooterItem({ link }: { link: FooterLink }) {
  if (!link.whatsapp) {
    return (
      <Link to={link.to} className={FOOTER_LINK_CLASS}>
        {link.label}
      </Link>
    );
  }
  const href = whatsappUrl("Hi VYTAE, I have a question.");
  const icon = <Fill size={15} d={BRAND_PATHS.whatsapp} className="shrink-0" />;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK_CLASS}>
        {icon}
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.to} className={FOOTER_LINK_CLASS}>
      {icon}
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-footer text-white">
      <div className="mx-auto max-w-[1160px] px-[clamp(20px,3vw,40px)] pt-[clamp(44px,5vw,60px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-[clamp(36px,5vw,80px)] gap-y-8">
          <div className="flex max-w-[300px] flex-col gap-[18px]">
            <Link to="/" className="text-[22px] leading-none font-medium tracking-[0.34em] text-white">
              VYTAE
            </Link>
            <p className="m-0 text-[13px] leading-[1.6] text-[rgba(255,255,255,0.78)]">
              Purposeful, science-led formulas for everyday wellness.
            </p>
            <div className="flex gap-2 pt-1">
              <a href="#" aria-label="Instagram" className={SOCIAL_LINK_CLASS}>
                <Stroke size={14} strokeWidth={1.7}>
                  <path d={BRAND_PATHS.instagram} />
                </Stroke>
              </a>
              <a href="#" aria-label="X" className={SOCIAL_LINK_CLASS}>
                <Stroke size={14} strokeWidth={1.7}>
                  <path d="M5 5l14 14M19 5L5 19" />
                </Stroke>
              </a>
              <a href="#" aria-label="LinkedIn" className={SOCIAL_LINK_CLASS}>
                <Stroke size={14} strokeWidth={1.7}>
                  <path d={BRAND_PATHS.linkedin} />
                </Stroke>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,130px),1fr))] gap-x-6 gap-y-8">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-[10px]">
                <span className="mb-1.5 text-[10px] font-semibold tracking-[0.22em] text-[#bcd0e8] uppercase">
                  {col.title}
                </span>
                {col.links.map((link) => (
                  <FooterItem key={link.label} link={link} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(32px,4vw,44px)] flex flex-wrap gap-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.22)] px-3.5 py-[7px] text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-white"
            >
              <span className="h-[5px] w-[5px] rounded-full bg-[#8fd4b0]" />
              {badge}
            </span>
          ))}
        </div>

        <p className="mt-[18px] mb-0 max-w-[820px] text-[11px] leading-[1.7] text-[rgba(255,255,255,0.6)] text-pretty">
          Food supplements should not be used as a substitute for a varied, balanced diet and a healthy lifestyle. Do not
          exceed the recommended daily dose. Keep out of reach of children. If you are pregnant, breastfeeding, taking
          medication or under medical supervision, consult your healthcare professional before use. These products are
          not intended to diagnose, treat, cure or prevent any disease.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.12)] pt-4 pb-5 text-xs text-[rgba(255,255,255,0.66)]">
          <span className="whitespace-nowrap">© 2026 VYTAE. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-[22px] gap-y-2">
            {LEGAL.map((l) => (
              <Link key={l.to} to={l.to} className="whitespace-nowrap text-[rgba(255,255,255,0.66)] hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
