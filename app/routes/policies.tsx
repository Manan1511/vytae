import { Link, useLoaderData } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { COMPANY, POLICIES } from "../content/policies";
import { loadPolicy, type PolicyView } from "../lib/catalog";
import { Reveal } from "../lib/motion";
import NotFoundPage from "./not-found";

async function loadPolicyRoute(doc: string | undefined) {
  const key = POLICIES.find((p) => p.key === doc)?.key;
  return { doc: key ?? null, policy: key ? await loadPolicy(key) : null };
}

export function loader({ params }: { params: { doc?: string } }) {
  return loadPolicyRoute(params.doc);
}

export async function clientLoader({
  serverLoader,
  params,
}: {
  serverLoader: () => Promise<unknown>;
  params: { doc?: string };
}) {
  try {
    return await serverLoader();
  } catch {
    return loadPolicyRoute(params.doc);
  }
}
clientLoader.hydrate = true;

export function meta({ loaderData }: { loaderData?: { policy: PolicyView | null } }) {
  const policy = loaderData?.policy;
  return [{ title: policy ? `${policy.title} | VYTAE` : "Page not found | VYTAE" }];
}

// The policy body is HTML from Shopify. Each section heading starts a bordered block, as in the design.
const BODY_CLASS = [
  "[&>p:first-child]:mt-3 [&>p:first-child]:text-[17px]",
  "[&_p]:m-0 [&_p]:text-base [&_p]:leading-[1.7] [&_p]:text-ink-body",
  "[&_h2]:mt-3.5 [&_h2]:scroll-mt-24 [&_h2]:border-t [&_h2]:border-line-soft [&_h2]:pt-7 [&_h2]:text-[22px] [&_h2]:font-medium [&_h2]:tracking-[-0.01em]",
].join(" ");

export default function PolicyPage() {
  const { doc, policy } = useLoaderData<typeof loader>();
  if (!policy) return <NotFoundPage />;

  return (
    <SiteShell variant="solid">
      <section
        data-screen-label="Legal"
        className="mx-auto max-w-[1120px] px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,88px)] pb-[clamp(80px,10vw,128px)]"
      >
        <div className="mb-10 flex flex-wrap gap-2">
          {POLICIES.map((p) => {
            const on = p.key === doc;
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
            {policy.toc.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="leading-[1.4] text-ink-body">
                {t.label}
              </a>
            ))}
          </aside>

          <div className="flex min-w-0 max-w-[700px] flex-1 basis-[480px] flex-col gap-3.5">
            <Reveal as="h1" className="m-0 text-[clamp(40px,4.6vw,64px)] leading-none font-normal tracking-[-0.03em]">
              {policy.title}
            </Reveal>
            <span className="text-sm text-ink-muted">Last updated [DD Month YYYY]</span>
            <div
              className={`flex flex-col gap-2.5 ${BODY_CLASS}`}
              dangerouslySetInnerHTML={{ __html: policy.html }}
            />
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
