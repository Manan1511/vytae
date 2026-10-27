import { useLoaderData } from "react-router";
import { Collection } from "../components/home/Collection";
import { Hero } from "../components/home/Hero";
import { Marquee } from "../components/home/Marquee";
import { Passport } from "../components/home/Passport";
import { Reviews } from "../components/home/Reviews";
import { Science } from "../components/home/Science";
import { Standard } from "../components/home/Standard";
import { Ugc } from "../components/home/Ugc";
import { SiteShell } from "../components/layout/SiteShell";
import { homeArticles, loadCatalog, loadHero, loadPosts, loadTestimonials } from "../lib/catalog";
import { organizationLd, seoMeta, websiteLd } from "../lib/seo";

export function meta() {
  return seoMeta({
    title: "VYTAE · Life, Absorbed.",
    description: "Purposeful, science-led supplements, formulated around what your body can absorb.",
    path: "/",
    jsonLd: [organizationLd(), websiteLd()],
  });
}

export async function loader() {
  const [products, hero, reviews, posts] = await Promise.all([
    loadCatalog(),
    loadHero(),
    loadTestimonials(),
    loadPosts(),
  ]);
  return { products, hero, reviews, articles: homeArticles(posts) };
}

export default function Home() {
  const { products, hero, reviews, articles } = useLoaderData<typeof loader>();
  return (
    <SiteShell>
      <Hero slides={hero} />
      <Marquee />
      <Standard />
      <Collection products={products} />
      <Passport />
      <Reviews reviews={reviews} />
      <Science articles={articles} />
      <Ugc />
    </SiteShell>
  );
}
