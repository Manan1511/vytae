import { useEffect, type ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation, type LinkDescriptor } from "react-router";
import { initAnalytics, trackPageView } from "./lib/analytics";
import { CartProvider } from "./lib/cart";
import { MotionFx } from "./lib/motion";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/hanken-grotesk/700.css";
import "./styles/app.css";

// The SVG is the modern icon. The .ico and touch icon cover older browsers and iOS.
export function links(): LinkDescriptor[] {
  return [
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  ];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#26497a" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Page views follow the route, so each page is counted once as it opens.
function PageTracking() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    trackPageView(`${pathname}${search}`);
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <CartProvider>
      <PageTracking />
      <MotionFx />
      <Outlet />
    </CartProvider>
  );
}
