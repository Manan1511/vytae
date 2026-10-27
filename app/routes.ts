import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("shop", "routes/shop.tsx"),
  route("products/:handle", "routes/product.tsx"),
  route("bag", "routes/bag.tsx"),
  route("science", "routes/science.tsx"),
  route("science/:slug", "routes/article.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("batch", "routes/batch.tsx"),
  route("batch/:code", "routes/batch-code.tsx"),
  route("account", "routes/account.tsx"),
  route("policies/:doc", "routes/policies.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
