import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: [
    "/",
    "/shop",
    "/products/night-reset",
    "/products/rest-well",
    "/products/sleep-ritual",
    "/bag",
    "/science",
    "/science/magnesium-form",
    "/science/reading-a-label",
    "/science/how-we-test",
    "/science/glycine-explained",
    "/science/building-a-ritual",
    "/science/what-is-l-theanine",
    "/science/inside-the-batch-passport",
    "/about",
    "/contact",
    "/batch",
    "/account",
    "/policies/privacy",
    "/policies/refund",
    "/policies/terms",
  ],
} satisfies Config;
