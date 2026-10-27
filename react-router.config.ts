import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: ["/", "/shop", "/products/night-reset", "/products/rest-well", "/products/sleep-ritual"],
} satisfies Config;
