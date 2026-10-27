import { useState } from "react";
import { useParams } from "react-router";
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
import { getProduct, type Product } from "../content/products";
import { addToBag } from "../lib/bag";
import NotFoundPage from "./not-found";

export function meta({ params }: { params: { handle?: string } }) {
  const product = getProduct(params.handle);
  if (!product) return [{ title: "Page not found | VYTAE" }];
  return [{ title: `${product.name} | VYTAE` }, { name: "description", content: product.sub }];
}

export default function ProductPage() {
  const { handle } = useParams();
  const product = getProduct(handle);
  if (!product) return <NotFoundPage />;
  return <ProductView key={product.handle} product={product} />;
}

// Quantity and the added state live here so the buy box and the sticky mini bar stay in step.
function ProductView({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = () => {
    addToBag(product.handle, qty);
    setAdded(true);
  };
  const n = sectionNumbers(product);

  return (
    <SiteShell variant="solid" active="Shop">
      <ProductHero product={product} qty={qty} setQty={setQty} added={added} addItem={addItem} />
      <ProductSubnav product={product} added={added} addItem={addItem} />
      <WhySection product={product} n={n} />
      <ScienceSection product={product} n={n} />
      <ProofSection product={product} n={n} />
      <PairsSection product={product} n={n} />
      <ReviewsSection product={product} n={n} />
      <FaqSection product={product} n={n} />
    </SiteShell>
  );
}
