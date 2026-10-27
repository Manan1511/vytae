import { useState } from "react";
import { Link } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { Eyebrow } from "../components/ui/Eyebrow";
import { FEATURED, POSTS, SCIENCE_CATEGORIES } from "../content/science";
import { Reveal } from "../lib/motion";

export function meta() {
  return [
    { title: "Science | VYTAE" },
    { name: "description", content: "Clear writing on ingredients, quality and everyday rituals." },
  ];
}

export default function SciencePage() {
  const [category, setCategory] = useState<(typeof SCIENCE_CATEGORIES)[number]>("All");
  const [subscribed, setSubscribed] = useState(false);
  const posts = POSTS.filter((p) => category === "All" || p.category === category);

  return (
    <SiteShell variant="solid" active="Science">
      <section
        data-screen-label="Intro"
        className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pt-[clamp(56px,7vw,104px)] pb-[clamp(40px,5vw,64px)] text-center"
      >
        <div className="flex flex-col items-center gap-[18px]">
          <Eyebrow centered>VYTAE Science</Eyebrow>
          <Reveal as="h1" className="m-0 text-[clamp(48px,6vw,88px)] leading-none font-normal tracking-[-0.03em] text-balance">
            The thinking behind the formula.
          </Reveal>
          <p className="m-0 max-w-[560px] text-lg leading-[1.6] text-pretty text-ink-body">
            Clear writing on ingredients, quality and everyday rituals — so you always know what you’re taking, and why.
          </p>
        </div>
      </section>

      <section data-screen-label="Featured" className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pb-[clamp(56px,6vw,88px)]">
        <Reveal
          as={Link}
          to={`/science/${FEATURED.slug}`}
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] overflow-hidden rounded-[28px] border border-line bg-cloud shadow-[0_1px_0_rgba(27,54,93,0.04),0_24px_48px_-32px_rgba(27,54,93,0.28)] transition-shadow duration-500 hover:shadow-[0_36px_60px_-32px_rgba(27,54,93,0.3)]"
        >
          <span className="relative block min-h-[clamp(300px,32vw,460px)] overflow-hidden bg-frost">
            <img src={FEATURED.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </span>
          <span className="flex flex-col justify-center gap-[18px] p-[clamp(32px,4vw,64px)]">
            <span className="flex gap-2.5 text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">
              <span>Featured</span>
              <span>·</span>
              <span>{FEATURED.category}</span>
            </span>
            <span className="text-[clamp(30px,3vw,44px)] leading-[1.08] tracking-[-0.025em] text-balance">
              {FEATURED.title}
            </span>
            <span className="text-base leading-[1.6] text-ink-body">{FEATURED.desc}</span>
            <span className="text-[13px] text-ink-muted">{FEATURED.minutes} read · [Author name]</span>
          </span>
        </Reveal>
      </section>

      <section data-screen-label="Articles" className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pb-[clamp(80px,10vw,128px)]">
        <div className="mb-8 flex flex-wrap gap-2 border-b border-line-soft pb-7">
          {SCIENCE_CATEGORIES.map((c) => {
            const on = c === category;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`cursor-pointer rounded-full border px-4 py-[9px] text-[13px] font-semibold transition-[background-color,color,border-color] duration-300 ${
                  on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-x-6 gap-y-12">
          {posts.map((p) => (
            <Reveal
              key={p.slug}
              as={Link}
              to={`/science/${p.slug}`}
              className="flex flex-col overflow-hidden rounded-3xl border border-line bg-cloud shadow-[0_1px_0_rgba(27,54,93,0.04),0_24px_48px_-32px_rgba(27,54,93,0.28)]"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-frost">
                <img src={p.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </span>
              <span className="flex flex-col gap-3 px-[22px] pt-5 pb-6">
                <span className="flex gap-2.5 text-xs font-semibold tracking-[0.12em] text-ink-body uppercase">
                  <span>{p.category}</span>
                  <span>·</span>
                  <span>{p.minutes}</span>
                </span>
                <span className="text-[22px] leading-[1.2] tracking-[-0.015em] text-balance">{p.title}</span>
                <span className="text-[15px] leading-[1.55] text-ink-body">{p.desc}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Newsletter sign-up is frontend-only until the email provider is connected. */}
      <section data-screen-label="Newsletter" className="px-3 pb-[clamp(80px,10vw,128px)]">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-5 rounded-[28px] bg-[linear-gradient(160deg,#21406f_0%,#2a4c7c_45%,#3a6aa3_100%)] px-[clamp(24px,5vw,72px)] py-[clamp(48px,6vw,88px)] text-center text-white">
          <Reveal as="h2" className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.06] font-normal tracking-[-0.025em]">
            New writing, once a month.
          </Reveal>
          <p className="m-0 max-w-[460px] text-base leading-[1.6] text-[rgba(255,255,255,0.88)]">
            Ingredient notes, quality updates and simple rituals — straight to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            className="flex w-[min(100%,440px)] gap-2 rounded-full bg-white p-[5px]"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-ink outline-none"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-full border-0 bg-ink px-[22px] py-3 text-[13px] font-semibold whitespace-nowrap text-white hover:bg-ink-hover"
            >
              {subscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
