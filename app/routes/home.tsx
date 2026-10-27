import { Collection } from "../components/home/Collection";
import { Hero } from "../components/home/Hero";
import { Marquee } from "../components/home/Marquee";
import { Passport } from "../components/home/Passport";
import { Reviews } from "../components/home/Reviews";
import { Science } from "../components/home/Science";
import { Standard } from "../components/home/Standard";
import { Ugc } from "../components/home/Ugc";
import { SiteShell } from "../components/layout/SiteShell";

export function meta() {
  return [
    { title: "VYTAE · Life, Absorbed." },
    {
      name: "description",
      content: "Purposeful, science-led supplements, formulated around what your body can absorb.",
    },
  ];
}

export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <Marquee />
      <Standard />
      <Collection />
      <Passport />
      <Reviews />
      <Science />
      <Ugc />
    </SiteShell>
  );
}
