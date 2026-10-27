import { Link, useParams } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { COMPANY, POLICIES } from "../content/policies";
import { Reveal } from "../lib/motion";
import NotFoundPage from "./not-found";

export function meta({ params }: { params: { doc?: string } }) {
  const policy = POLICIES.find((p) => p.key === params.doc);
  return [{ title: policy ? `${policy.title} | VYTAE` : "Page not found | VYTAE" }];
}

export default function PolicyPage() {
  const { doc } = useParams();
  const policy = POLICIES.find((p) => p.key === doc);
  if (!policy) return <NotFoundPage />;

  return (
    <SiteShell variant="solid">
      <section
        data-screen-label="Legal"
        className="mx-auto max-w-[1120px] px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,88px)] pb-[clamp(80px,10vw,128px)]"
      >
        <div className="mb-10 flex flex-wrap gap-2">
          {POLICIES.map((p) => {
            const on = p.key === policy.key;
            return (
              <Link
                key={p.key}
                to={`/policies/${p.key}`}
                className={`rounded-full border px-4 py-[9px] text-[13px] font-semibold ${
                  on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-frost"
                }`}
              >
                {p.title}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-start gap-12">
          <aside className="flex flex-1 basis-[200px] max-w-[240px] flex-col gap-2.5 text-sm min-[960px]:sticky min-[960px]:top-[84px]">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">On this page</div>
            {policy.sections.map((s, i) => (
              <a key={s.heading} href={`#sec-${i}`} className="leading-[1.4] text-ink-body">
                {s.heading}
              </a>
            ))}
          </aside>

          <div className="flex min-w-0 max-w-[700px] flex-1 basis-[480px] flex-col gap-3.5">
            <Reveal as="h1" className="m-0 text-[clamp(40px,4.6vw,64px)] leading-none font-normal tracking-[-0.03em]">
              {policy.title}
            </Reveal>
            <span className="text-sm text-ink-muted">Last updated [DD Month YYYY]</span>
            <p className="m-0 mt-3 text-[17px] leading-[1.7] text-ink-body">{policy.intro}</p>
            {policy.sections.map((s, i) => (
              <div key={s.heading} id={`sec-${i}`} className="mt-3.5 flex scroll-mt-24 flex-col gap-2.5 border-t border-line-soft pt-7">
                <Reveal as="h2" className="m-0 text-[22px] font-medium tracking-[-0.01em]">
                  {s.heading}
                </Reveal>
                {s.paragraphs.map((p) => (
                  <p key={p} className="m-0 text-base leading-[1.7] text-ink-body">
                    {p}
                  </p>
                ))}
              </div>
            ))}
            <div className="mt-8 rounded-[20px] border border-line bg-cloud p-6 text-[15px] leading-[1.6]">
              Questions about this policy?{" "}
              <Link to="/contact" className="font-semibold underline">
                Contact us
              </Link>{" "}
              or email [hello@vytae.com]. {COMPANY}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
