import { Link, useLoaderData } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { loadArticle, type ArticleView } from "../lib/catalog";
import { Reveal } from "../lib/motion";
import { articleLd, breadcrumbLd, seoMeta } from "../lib/seo";
import NotFoundPage from "./not-found";

async function loadArticleRoute(slug: string | undefined) {
  return { article: await loadArticle(slug ?? "") };
}

export function loader({ params }: { params: { slug?: string } }) {
  return loadArticleRoute(params.slug);
}

// An article added after the last build has no prerendered data, so the browser reads it from the Storefront.
export async function clientLoader({
  serverLoader,
  params,
}: {
  serverLoader: () => Promise<unknown>;
  params: { slug?: string };
}) {
  try {
    return await serverLoader();
  } catch {
    return loadArticleRoute(params.slug);
  }
}
clientLoader.hydrate = true;

export function meta({ loaderData }: { loaderData?: { article: ArticleView | null } }) {
  const post = loaderData?.article?.post;
  if (!post) return [{ title: "Page not found | VYTAE" }];
  const path = `/science/${post.slug}`;
  return seoMeta({
    title: `${post.title} | VYTAE`,
    description: post.desc,
    path,
    image: post.image,
    type: "article",
    jsonLd: [
      articleLd(post, path),
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Science", path: "/science" },
        { name: post.title, path },
      ]),
    ],
  });
}

// The body is HTML from Shopify, so the styles reach into its elements.
const BODY_CLASS = [
  "[&_h2]:mt-4 [&_h2]:scroll-mt-24 [&_h2]:text-[32px] [&_h2]:leading-[1.15] [&_h2]:font-normal [&_h2]:tracking-[-0.02em]",
  "[&_p]:m-0 [&_p]:text-ink-body [&>p:first-child]:text-ink",
  "[&_blockquote]:my-4 [&_blockquote]:text-[clamp(26px,2.6vw,34px)] [&_blockquote]:leading-[1.25] [&_blockquote]:tracking-[-0.02em] [&_blockquote]:text-balance",
  "[&_a]:font-semibold [&_a]:text-ink [&_a]:underline",
  "[&_#references]:mt-6 [&_#references]:border-t [&_#references]:border-line-soft [&_#references]:pt-6 [&_#references]:text-[11px] [&_#references]:tracking-[0.14em] [&_#references]:text-ink-muted [&_#references]:uppercase",
  "[&_#references~p]:text-[13px] [&_#references~p]:leading-[1.6] [&_#references~p]:text-ink-muted",
].join(" ");

export default function ArticlePage() {
  const { article } = useLoaderData<typeof loader>();
  if (!article) return <NotFoundPage />;
  const { post, html, toc, more } = article;

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
          <div className="relative mx-auto aspect-[16/7] min-[760px]:min-h-[280px] max-w-[1320px] overflow-hidden rounded-[28px] bg-frost">
            {post.image && <img src={post.image} alt="" data-parallax className="absolute inset-0 h-full w-full object-cover" />}
          </div>
        </div>

        <div className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-12 px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,80px)] pb-[clamp(64px,8vw,104px)]">
          {toc.length > 0 && (
            <aside className="flex flex-1 basis-[200px] max-w-[240px] flex-col gap-3 text-sm min-[960px]:sticky min-[960px]:top-[84px]">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">In this article</div>
              {toc.map((t) => (
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
          <div
            className={`flex min-w-0 max-w-[680px] flex-1 basis-[480px] flex-col gap-[22px] text-[18px] leading-[1.7] text-ink ${BODY_CLASS}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
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
