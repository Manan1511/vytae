import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("shop", "routes/shop.tsx"),
  route("products/:handle", "routes/product.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
