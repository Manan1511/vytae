// The cart. With the Storefront connected it is a Shopify cart, kept in one browser-saved cart ID. Without it, the cart
// is a local list keyed by product handle, so the site still works offline. Both backends run through one store, which
// queues operations so a slow response can never overwrite a newer cart.
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { PRODUCTS } from "../content/products";
import { trackAddToCart, trackRemoveFromCart } from "./analytics";
import { storefrontEnabled, storefrontQuery } from "./shopify/storefront";

export type CartLine = {
  id: string; // Shopify line ID, or the product handle in the local cart
  variantId: string | null; // null in the local cart, which cannot take payment
  handle: string;
  name: string;
  image: string;
  unitPrice: number; // INR
  quantity: number;
};

export type Cart = {
  lines: CartLine[];
  count: number; // units across all lines
  subtotal: number; // before discounts
  discount: number;
  total: number; // after discounts, before delivery
  discountCode: string | null;
};

export type CartSnapshot = { cart: Cart | null; error: string | null };

export type CartStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CartSnapshot;
  load: () => Promise<void>;
  add: (handle: string, quantity: number) => Promise<void>;
  replace: (handle: string, quantity: number) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  // Resolves to the message to show when the code is not accepted, or null when it is applied.
  applyDiscount: (code: string) => Promise<string | null>;
  removeDiscount: () => Promise<void>;
  // Empties the saved cart after a paid order. Buy-now carts are never saved, so they never need it.
  clear: () => Promise<void>;
};

export type BuyLine = { handle: string; quantity: number };

// Buy now opens checkout with one product and leaves the saved cart alone. The link format is handle:quantity.
export function buyNowHref(handle: string, quantity: number) {
  return `/bag?step=details&buy=${handle}:${quantity}`;
}

export function parseBuyLine(value: string | null): BuyLine | null {
  const match = /^([a-z0-9-]+):(\d{1,2})$/.exec(value ?? "");
  if (!match) return null;
  const quantity = Number(match[2]);
  return quantity >= 1 && quantity <= 10 ? { handle: match[1], quantity } : null;
}

type Persist = { get: () => string | null; set: (value: string | null) => void };

// Browser storage is read only when the cart runs, never during prerender. A blocked store means the cart lasts one visit.
function browserStorage(key: string): Persist {
  return {
    get: () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set: (value) => {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        // Storage blocked: the change holds for this visit only.
      }
    },
  };
}

function memoryStorage(): Persist {
  let value: string | null = null;
  return {
    get: () => value,
    set: (next) => {
      value = next;
    },
  };
}

type Operation =
  | { kind: "add"; handle: string; quantity: number }
  | { kind: "replace"; handle: string; quantity: number }
  | { kind: "setQuantity"; lineId: string; quantity: number }
  | { kind: "remove"; lineId: string }
  | { kind: "discount"; code: string | null }
  | { kind: "clear" };

type Outcome = { cart: Cart; error?: string };

type CartBackend = {
  load: () => Promise<Cart>;
  apply: (operation: Operation) => Promise<Outcome>;
};

const EMPTY_CART: Cart = { lines: [], count: 0, subtotal: 0, discount: 0, total: 0, discountCode: null };
const INITIAL: CartSnapshot = { cart: null, error: null };

function createCartStore(backend: CartBackend): CartStore {
  let snapshot: CartSnapshot = INITIAL;
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<() => void>();

  const publish = (next: CartSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  // Each operation waits for the one before it. A response therefore never lands on top of a newer cart.
  // Returns the message to show for a rejected discount code, or for a failed operation.
  function run(task: () => Promise<Outcome>, report = true): Promise<string | null> {
    const next = queue.then(async () => {
      try {
        const outcome = await task();
        publish({ cart: outcome.cart, error: null });
        return outcome.error ?? null;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong. Try again.";
        if (report) publish({ cart: snapshot.cart, error: message });
        return message;
      }
    });
    queue = next;
    return next;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    async load() {
      await run(async () => ({ cart: await backend.load() }));
    },
    async add(handle, quantity) {
      await run(() => backend.apply({ kind: "add", handle, quantity }));
      const line = snapshot.cart?.lines.find((item) => item.handle === handle);
      if (line && !snapshot.error) trackAddToCart({ item_id: handle, item_name: line.name, price: line.unitPrice, quantity });
    },
    async replace(handle, quantity) {
      await run(() => backend.apply({ kind: "replace", handle, quantity }));
    },
    async setQuantity(lineId, quantity) {
      await run(() => backend.apply(quantity < 1 ? { kind: "remove", lineId } : { kind: "setQuantity", lineId, quantity }));
    },
    async remove(lineId) {
      const line = snapshot.cart?.lines.find((item) => item.id === lineId);
      await run(() => backend.apply({ kind: "remove", lineId }));
      if (line && !snapshot.error) {
        trackRemoveFromCart({ item_id: line.handle, item_name: line.name, price: line.unitPrice, quantity: line.quantity });
      }
    },
    applyDiscount: (code) => run(() => backend.apply({ kind: "discount", code: code.trim() || null }), false),
    async removeDiscount() {
      await run(() => backend.apply({ kind: "discount", code: null }), false);
    },
    async clear() {
      await run(() => backend.apply({ kind: "clear" }));
    },
  };
}

// ---- Storefront (Shopify cart) ----

const CART_FIELDS = `
  id
  totalQuantity
  cost { subtotalAmount { amount } totalAmount { amount } }
  discountCodes { code applicable }
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          price { amount }
          product { handle title featuredImage { url } }
        }
      }
    }
  }
`;

const CART_QUERY = `query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`;
const CART_CREATE = `mutation CartCreate($input: CartInput!) {
  cartCreate(input: $input) { cart { ${CART_FIELDS} } userErrors { message } }
}`;
const CART_LINES_ADD = `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } }
}`;
const CART_LINES_UPDATE = `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } }
}`;
const CART_LINES_REMOVE = `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { message } }
}`;
const CART_DISCOUNTS = `mutation CartDiscounts($cartId: ID!, $codes: [String!]!) {
  cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) { cart { ${CART_FIELDS} } userErrors { message } }
}`;
const VARIANT_QUERY = `query VariantId($handle: String!) {
  product(handle: $handle) { variants(first: 1) { nodes { id } } }
}`;

type StorefrontCart = {
  id: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string }; totalAmount: { amount: string } };
  discountCodes: { code: string; applicable: boolean }[];
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        price: { amount: string };
        product: { handle: string; title: string; featuredImage: { url: string } | null };
      };
    }[];
  };
};

type CartPayload = { cart: StorefrontCart | null; userErrors: { message: string }[] };

function toCart(cart: StorefrontCart): Cart {
  const lines = cart.lines.nodes.map((line) => ({
    id: line.id,
    variantId: line.merchandise.id,
    handle: line.merchandise.product.handle,
    name: line.merchandise.product.title,
    image: line.merchandise.product.featuredImage?.url ?? "",
    unitPrice: Math.round(Number(line.merchandise.price.amount)),
    quantity: line.quantity,
  }));
  const subtotal = Math.round(Number(cart.cost.subtotalAmount.amount));
  const total = Math.round(Number(cart.cost.totalAmount.amount));
  return {
    lines,
    count: cart.totalQuantity,
    subtotal,
    discount: Math.max(0, subtotal - total),
    total,
    discountCode: cart.discountCodes.find((c) => c.applicable)?.code ?? null,
  };
}

async function fetchCart(id: string): Promise<Cart | null> {
  const data = await storefrontQuery<{ cart: StorefrontCart | null }>(CART_QUERY, { id });
  return data.cart ? toCart(data.cart) : null;
}

async function mutate(query: string, variables: Record<string, unknown>, field: string): Promise<CartPayload> {
  const data = await storefrontQuery<Record<string, CartPayload>>(query, variables);
  return data[field];
}

const messageOf = (payload: CartPayload) =>
  payload.userErrors.map((e) => e.message).join(" ") || "Something went wrong. Try again.";

// The bag keeps its cart while Shopify still has it. If Shopify has dropped the cart, the bag starts empty.
async function resolveCart(persist: Persist, id: string, payload: CartPayload): Promise<Cart> {
  if (payload.cart) return toCart(payload.cart);
  if (await fetchCart(id)) throw new Error(messageOf(payload));
  persist.set(null);
  return EMPTY_CART;
}

async function createCart(persist: Persist, merchandiseId: string, quantity: number): Promise<Cart> {
  const payload = await mutate(CART_CREATE, { input: { lines: [{ merchandiseId, quantity }] } }, "cartCreate");
  if (!payload.cart) throw new Error(messageOf(payload));
  persist.set(payload.cart.id);
  return toCart(payload.cart);
}

// Variant IDs are looked up once per product and reused for the rest of the visit.
const variantIds = new Map<string, Promise<string>>();

function variantIdFor(handle: string): Promise<string> {
  let found = variantIds.get(handle);
  if (!found) {
    found = storefrontQuery<{ product: { variants: { nodes: { id: string }[] } } | null }>(VARIANT_QUERY, { handle }).then(
      (data) => {
        const id = data.product?.variants.nodes[0]?.id;
        if (!id) throw new Error("That product isn’t available right now.");
        return id;
      },
    );
    variantIds.set(handle, found);
    found.catch(() => variantIds.delete(handle));
  }
  return found;
}

function storefrontBackend(persist: Persist): CartBackend {
  return {
    async load() {
      const id = persist.get();
      if (!id) return EMPTY_CART;
      const cart = await fetchCart(id);
      if (!cart) persist.set(null);
      return cart ?? EMPTY_CART;
    },
    async apply(operation) {
      switch (operation.kind) {
        case "replace":
          return { cart: await createCart(persist, await variantIdFor(operation.handle), operation.quantity) };

        case "add": {
          const merchandiseId = await variantIdFor(operation.handle);
          const id = persist.get();
          if (!id) return { cart: await createCart(persist, merchandiseId, operation.quantity) };
          const payload = await mutate(CART_LINES_ADD, { cartId: id, lines: [{ merchandiseId, quantity: operation.quantity }] }, "cartLinesAdd");
          if (payload.cart) return { cart: toCart(payload.cart) };
          if (await fetchCart(id)) throw new Error(messageOf(payload));
          // The saved cart has expired, so the item starts a new one.
          return { cart: await createCart(persist, merchandiseId, operation.quantity) };
        }

        case "setQuantity": {
          const id = persist.get();
          if (!id) return { cart: EMPTY_CART };
          const payload = await mutate(CART_LINES_UPDATE, { cartId: id, lines: [{ id: operation.lineId, quantity: operation.quantity }] }, "cartLinesUpdate");
          return { cart: await resolveCart(persist, id, payload) };
        }

        case "remove": {
          const id = persist.get();
          if (!id) return { cart: EMPTY_CART };
          const payload = await mutate(CART_LINES_REMOVE, { cartId: id, lineIds: [operation.lineId] }, "cartLinesRemove");
          return { cart: await resolveCart(persist, id, payload) };
        }

        case "clear":
          persist.set(null);
          return { cart: EMPTY_CART };

        case "discount": {
          const id = persist.get();
          const code = operation.code;
          if (!id) return { cart: EMPTY_CART, error: code ? "Add something to your bag before using a code." : undefined };
          const payload = await mutate(CART_DISCOUNTS, { cartId: id, codes: code ? [code] : [] }, "cartDiscountCodesUpdate");
          const cart = await resolveCart(persist, id, payload);
          if (!code) return { cart };
          const applicable = payload.cart?.discountCodes.some((c) => c.applicable && c.code.toUpperCase() === code.toUpperCase());
          if (applicable) return { cart };
          // Not valid for this cart. Take it off again so it doesn't stay in the bag.
          const cleared = await mutate(CART_DISCOUNTS, { cartId: id, codes: [] }, "cartDiscountCodesUpdate");
          return { cart: cleared.cart ? toCart(cleared.cart) : cart, error: "That code isn’t valid for this order." };
        }
      }
    },
  };
}

// ---- Offline (no Storefront) ----

type Bag = Record<string, number>;

function readBag(persist: Persist): Bag {
  try {
    const value: unknown = JSON.parse(persist.get() ?? "{}");
    return value && typeof value === "object" ? (value as Bag) : {};
  } catch {
    return {};
  }
}

function localCart(bag: Bag): Cart {
  const lines = Object.entries(bag).flatMap(([handle, quantity]) => {
    const product = PRODUCTS.find((p) => p.handle === handle);
    if (!product || quantity < 1) return [];
    return [{ id: handle, variantId: null, handle, name: product.name, image: product.images[0] ?? "", unitPrice: product.price, quantity }];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    discount: 0,
    total: subtotal,
    discountCode: null,
  };
}

function localBackend(persist: Persist): CartBackend {
  return {
    async load() {
      return localCart(readBag(persist));
    },
    async apply(operation) {
      if (operation.kind === "clear") {
        persist.set("{}");
        return { cart: localCart({}) };
      }
      if (operation.kind === "discount") {
        return {
          cart: localCart(readBag(persist)),
          error: operation.code ? "Discount codes are available once the store is connected." : undefined,
        };
      }
      const bag: Bag = operation.kind === "replace" ? {} : readBag(persist);
      if (operation.kind === "add" || operation.kind === "replace") {
        bag[operation.handle] = (bag[operation.handle] ?? 0) + operation.quantity;
      } else if (operation.kind === "setQuantity") {
        bag[operation.lineId] = operation.quantity;
      } else if (operation.kind === "remove") {
        delete bag[operation.lineId];
      }
      persist.set(JSON.stringify(bag));
      return { cart: localCart(bag) };
    },
  };
}

// ---- Stores and React ----

export function createSavedCartStore(): CartStore {
  return createCartStore(
    storefrontEnabled ? storefrontBackend(browserStorage("vytae-cart-id")) : localBackend(browserStorage("vytae-bag")),
  );
}

function createBuyNowStore(): CartStore {
  return createCartStore(storefrontEnabled ? storefrontBackend(memoryStorage()) : localBackend(memoryStorage()));
}

const SavedCartContext = createContext<CartStore | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createSavedCartStore);
  useEffect(() => {
    void store.load();
  }, [store]);
  return <SavedCartContext.Provider value={store}>{children}</SavedCartContext.Provider>;
}

export function useSavedCartStore(): CartStore {
  const store = useContext(SavedCartContext);
  if (!store) throw new Error("useSavedCartStore must be used inside CartProvider");
  return store;
}

export function useCartStore(store: CartStore): CartSnapshot {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => INITIAL);
}

export function useCartCount(): number {
  return useCartStore(useSavedCartStore()).cart?.count ?? 0;
}

// The buy-now cart holds one product. It is separate from the saved cart and starts again on each visit.
export function useBuyNowStore(line: BuyLine | null): CartStore | null {
  const key = line ? `${line.handle}:${line.quantity}` : "";
  const store = useMemo(() => (key ? createBuyNowStore() : null), [key]);
  useEffect(() => {
    if (store && line) void store.replace(line.handle, line.quantity);
    // The store is rebuilt whenever the line changes, so the effect only needs to run for a new store.
  }, [store]);
  return store;
}
