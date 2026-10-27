import { Link } from "react-router";
import { HERO } from "../../content/home";
import { Reveal } from "../../lib/motion";

export function Hero() {
  return (
    <section data-screen-label="Hero" className="hero bg-hero text-white">
      <img src={HERO.image} alt={HERO.alt} className="hero-media" fetchPriority="high" />
      <div aria-hidden="true" className="hero-scrim" />

      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-[clamp(20px,5vw,40px)] pt-[clamp(100px,10vw,130px)] pb-[clamp(56px,8vw,96px)]">
        <div className="flex max-w-[480px] flex-col gap-6">
          <Reveal className="flex items-center gap-2 self-start rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.14)] px-3.5 py-[7px] text-xs font-semibold tracking-[0.02em] backdrop-blur-[6px]">
            {HERO.eyebrow}
          </Reveal>
          <Reveal as="h1" className="m-0 text-[clamp(48px,6vw,92px)] leading-[0.98] font-normal tracking-[-0.03em] text-balance">
            {HERO.headline}
          </Reveal>
          <Reveal as="p" className="m-0 max-w-[440px] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-[rgba(255,255,255,0.9)] text-pretty">
            {HERO.lead}
          </Reveal>
          <Reveal className="flex flex-wrap gap-3 pt-1">
            <a
              href="#collection"
              className="inline-flex items-center rounded-full bg-white px-[30px] py-4 text-[15px] font-semibold whitespace-nowrap text-ink hover:bg-frost"
            >
              Explore the collection <span className="ml-2">→</span>
            </a>
            <Link
              to="/science"
              className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.6)] px-[26px] py-[15px] text-[15px] font-semibold whitespace-nowrap text-white hover:bg-[rgba(255,255,255,0.12)]"
            >
              Our science
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
