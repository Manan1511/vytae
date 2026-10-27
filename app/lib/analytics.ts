// Google Analytics 4 and Meta Pixel. Each one loads only when its ID is set, so nothing is sent in development or before
// the client supplies the IDs. Tracking never throws into the page.
const GA4_ID = (import.meta.env.VITE_GA4_ID ?? "").trim();
const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID ?? "").trim();
const CURRENCY = "INR";

export type TrackedItem = { item_id: string; item_name: string; price: number; quantity: number };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

let started = false;
let pixelReady = false;
const pixelQueue: unknown[][] = [];

function loadScript(src: string): void {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

function pixel(...args: unknown[]): void {
  if (pixelReady && window.fbq) window.fbq(...args);
  else pixelQueue.push(args);
}

function ga(...args: unknown[]): void {
  window.gtag?.(...args);
}

// Starts both tags once. Google's loader reads the arguments object, so the function is a plain function.
export function initAnalytics(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  if (GA4_ID) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  }

  if (PIXEL_ID) {
    pixelQueue.push(["init", PIXEL_ID]);
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
    const check = window.setInterval(() => {
      if (!window.fbq) return;
      window.clearInterval(check);
      pixelReady = true;
      pixelQueue.splice(0).forEach((args) => window.fbq?.(...args));
    }, 200);
  }
}

const value = (items: TrackedItem[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const contentIds = (items: TrackedItem[]) => items.map((item) => item.item_id);

export function trackPageView(path: string): void {
  ga("event", "page_view", { page_location: `${window.location.origin}${path}`, page_path: path });
  pixel("track", "PageView");
}

export function trackViewItem(item: TrackedItem): void {
  ga("event", "view_item", { currency: CURRENCY, value: item.price, items: [item] });
  pixel("track", "ViewContent", { content_ids: [item.item_id], content_type: "product", value: item.price, currency: CURRENCY });
}

export function trackViewItemList(listName: string, items: TrackedItem[]): void {
  ga("event", "view_item_list", { item_list_name: listName, items });
}

export function trackAddToCart(item: TrackedItem): void {
  ga("event", "add_to_cart", { currency: CURRENCY, value: item.price * item.quantity, items: [item] });
  pixel("track", "AddToCart", { content_ids: [item.item_id], content_type: "product", value: item.price * item.quantity, currency: CURRENCY });
}

export function trackRemoveFromCart(item: TrackedItem): void {
  ga("event", "remove_from_cart", { currency: CURRENCY, value: item.price * item.quantity, items: [item] });
}

export function trackBeginCheckout(items: TrackedItem[]): void {
  ga("event", "begin_checkout", { currency: CURRENCY, value: value(items), items });
  pixel("track", "InitiateCheckout", { content_ids: contentIds(items), num_items: items.length, value: value(items), currency: CURRENCY });
}

export function trackAddPaymentInfo(items: TrackedItem[]): void {
  ga("event", "add_payment_info", { currency: CURRENCY, value: value(items), items });
}

// Sent once per order, even if the confirmation page is reloaded.
export function trackPurchase(orderName: string, items: TrackedItem[], totalRupees: number, shippingRupees: number): void {
  const key = `vytae-tracked-${orderName}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Storage blocked: the purchase may be counted twice on a reload, which is the lesser problem.
  }
  ga("event", "purchase", { transaction_id: orderName, currency: CURRENCY, value: totalRupees, shipping: shippingRupees, items });
  pixel("track", "Purchase", { content_ids: contentIds(items), content_type: "product", num_items: items.length, value: totalRupees, currency: CURRENCY }, { eventID: orderName });
}
