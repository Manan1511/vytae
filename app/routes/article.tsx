import { Link, useParams } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { PRODUCT_BY_HANDLE } from "../content/products";
import {
  ARTICLE_TOC,
  FEATURED,
  MAGNESIUM_ARTICLE,
  PLACEHOLDER_BODY,
  POSTS,
  findPost,
  type Post,
} from "../content/science";
import { Reveal } from "../lib/motion";
import NotFoundPage from "./not-found";

export function meta({ params }: { params: { slug?: string } }) {
  const post = findPost(params.slug);
  return [{ title: post ? `${post.title} | VYTAE` : "Page not found | VYTAE" }];
}

const MORE = ["glycine-explained", "how-we-test", "building-a-ritual"];
const H2 = "m-0 mt-4 scroll-mt-24 text-[32px] leading-[1.15] font-normal tracking-[-0.02em]";

function MagnesiumBody() {
  const m = MAGNESIUM_ARTICLE;
  return (
    <>
      <p className="m-0">
        {m.intro}
        <em>{m.emphasis}</em>
        {m.introEnd}
      </p>
      <h2 id="form" className={H2}>
        What “form” means
      </h2>
      <p className="m-0 text-ink-body">{m.formP}</p>
      <blockquote className="my-4 text-[clamp(26px,2.6vw,34px)] leading-[1.25] tracking-[-0.02em] text-balance">
        {m.quote}
      </blockquote>
      <h2 id="bisglycinate" className={H2}>
        Meet bisglycinate
      </h2>
      <p className="m-0 text-ink-body">{m.bisP}</p>
      <div className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-cloud p-6">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">Found in</span>
        <div className="flex flex-wrap gap-2.5">
          {(["night-reset", "rest-well"] as const).map((h) => (
            <Link
              key={h}
              to={`/products/${h}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-frost"
            >
              {PRODUCT_BY_HANDLE[h].name} →
            </Link>
          ))}
        </div>
      </div>
      <h2 id="vytae" className={H2}>
        How we use it
      </h2>
      <p className="m-0 text-ink-body">{m.vytaeP}</p>
      <div id="refs" className="mt-6 flex flex-col gap-2 border-t border-line-soft pt-6 text-[13px] leading-[1.6] text-ink-muted">
        <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">References</span>
        {m.refs.map((r) => (
          <span key={r}>{r}</span>
        ))}
        <span className="mt-2">{m.disclaimer}</span>
      </div>
    </>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const post = findPost(slug);
  if (!post) return <NotFoundPage />;

  const isMagnesium = post.slug === FEATURED.slug;
  const more = MORE.map((s) => POSTS.find((p) => p.slug === s)).filter((p): p is Post => Boolean(p));

  return (
    <SiteShell variant="solid" active="Science">
      <article>
        <header className="mx-auto flex max-w-[880px] flex-col items-center gap-5 px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,88px)] pb-10 text-center">
          <Link to="/science" className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            <span className="h-[7px] w-[7px] rounded-full bg-ink" />
            Science · {post.category}
          </Link>
          <Reveal as="h1" className="m-0 text-[clamp(40px,5vw,72px)] leading-[1.02] font-normal tracking-[-0.03em] text-balance">
            {post.title}
          </Reveal>
          <p className="m-0 max-w-[600px] text-[19px] leading-[1.55] text-pretty text-ink-body">{post.desc}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-ink-muted">
            <span className="font-semibold text-ink">[Author name]</span>
            <span>[Date]</span>
            <span>{post.minutes} read</span>
          </div>
        </header>

        <div className="px-3">
          <div className="relative mx-auto aspect-[16/7] min-h-[280px] max-w-[1320px] overflow-hidden rounded-[28px] bg-frost">
            <img src={post.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>

        <div className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-12 px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,80px)] pb-[clamp(64px,8vw,104px)]">
          {isMagnesium && (
            <aside className="flex flex-1 basis-[200px] max-w-[240px] flex-col gap-3 text-sm min-[960px]:sticky min-[960px]:top-[84px]">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">In this article</div>
              {ARTICLE_TOC.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="text-ink-body">
                  {t.label}
                </a>
              ))}
              <div className="mt-1 flex gap-3.5 border-t border-line-soft pt-3 text-[13px] font-semibold">
                <button
                  type="button"
                  onClick={() => navigator.share?.({ title: post.title, url: location.href }).catch(() => {})}
                  className="cursor-pointer border-0 bg-transparent p-0 text-ink"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(location.href).catch(() => {})}
                  className="cursor-pointer border-0 bg-transparent p-0 text-ink"
                >
                  Copy link
                </button>
              </div>
            </aside>
          )}
          <div className="flex min-w-0 max-w-[680px] flex-1 basis-[480px] flex-col gap-[22px] text-[18px] leading-[1.7] text-ink">
            {isMagnesium ? <MagnesiumBody /> : <p className="m-0 text-ink-body">{PLACEHOLDER_BODY}</p>}
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section data-screen-label="More" className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pb-[clamp(80px,10vw,128px)]">
          <div className="mb-7 flex items-baseline justify-between gap-4">
            <Reveal as="h2" className="m-0 text-[clamp(28px,2.8vw,40px)] font-normal tracking-[-0.025em]">
              Keep reading
            </Reveal>
            <Link to="/science" className="border-b border-ink pb-0.5 text-[13px] font-semibold">
              All articles
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6">
            {more.map((p) => (
              <Link key={p.slug} to={`/science/${p.slug}`} className="flex flex-col gap-3">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px] bg-frost">
                  <img src={p.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </span>
                <span className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">{p.category}</span>
                <span className="text-[21px] leading-[1.2] tracking-[-0.015em]">{p.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
