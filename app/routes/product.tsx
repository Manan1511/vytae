import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { ProductHero } from "../components/product/ProductHero";
import { ProductSubnav } from "../components/product/ProductSubnav";
import {
  FaqSection,
  PairsSection,
  ProofSection,
  ReviewsSection,
  ScienceSection,
  WhySection,
  sectionNumbers,
} from "../components/product/ProductSections";
import type { Product } from "../content/products";
import { useSavedCartStore } from "../lib/cart";
import { trackViewItem } from "../lib/analytics";
import { breadcrumbLd, faqLd, productLd, seoMeta } from "../lib/seo";
import { loadCatalog } from "../lib/catalog";
import NotFoundPage from "./not-found";

async function loadProductRoute(handle: string | undefined) {
  const catalog = await loadCatalog();
  const product = catalog.find((p) => p.handle === handle) ?? null;
  return { product, catalog };
}

export function loader({ params }: { params: { handle?: string } }) {
  return loadProductRoute(params.handle);
}

// A product added after the last build has no prerendered data, so the browser reads it from the Storefront.
export async function clientLoader({
  serverLoader,
  params,
}: {
  serverLoader: () => Promise<unknown>;
  params: { handle?: string };
}) {
  try {
    return await serverLoader();
  } catch {
    return loadProductRoute(params.handle);
  }
}
clientLoader.hydrate = true;

export function meta({ loaderData }: { loaderData?: { product: Product | null } }) {
  const product = loaderData?.product;
  if (!product) return [{ title: "Page not found | VYTAE" }];
  const path = `/products/${product.handle}`;
  return seoMeta({
    title: `${product.name} | VYTAE`,
    description: product.sub,
    path,
    image: product.images[0],
    type: "product",
    jsonLd: [
      productLd(product, path),
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: product.name, path },
      ]),
      ...(product.faqs.length > 0 ? [faqLd(product.faqs)] : []),
    ],
  });
}

export default function ProductPage() {
  const { product, catalog } = useLoaderData<typeof loader>();
  if (!product) return <NotFoundPage />;
  return <ProductView key={product.handle} product={product} catalog={catalog} />;
}

// Quantity and the added state live here so the buy box and the sticky mini bar stay in step.
function ProductView({ product, catalog }: { product: Product; catalog: Product[] }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const cartStore = useSavedCartStore();
  const addItem = () => {
    void cartStore.add(product.handle, qty);
    setAdded(true);
  };
  const n = sectionNumbers(product);

  useEffect(() => {
    trackViewItem({ item_id: product.handle, item_name: product.name, price: product.price, quantity: 1 });
  }, [product.handle, product.name, product.price]);

  return (
    <SiteShell variant="solid" active="Shop">
      <ProductHero product={product} qty={qty} setQty={setQty} added={added} addItem={addItem} />
      <ProductSubnav product={product} added={added} addItem={addItem} />
      <WhySection product={product} n={n} />
      <ScienceSection product={product} n={n} />
      <ProofSection product={product} n={n} />
      <PairsSection product={product} n={n} catalog={catalog} />
      <ReviewsSection product={product} n={n} />
      <FaqSection product={product} n={n} />
    </SiteShell>
  );
}
