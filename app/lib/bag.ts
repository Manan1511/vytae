import { useMemo, useSyncExternalStore } from "react";

// Mock cart using the design's localStorage key. Replaced by the Shopify cart in the cart phase.
const KEY = "vytae-bag";
const EVENT = "vytae-bag-change";

export type Bag = Record<string, number>;

function read(): Bag {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return v && typeof v === "object" ? (v as Bag) : {};
  } catch {
    return {};
  }
}

function count(): number {
  return Object.values(read()).reduce((sum, n) => sum + n, 0);
}

export function addToBag(key: string, qty = 1) {
  const bag = read();
  bag[key] = (bag[key] ?? 0) + qty;
  try {
    localStorage.setItem(KEY, JSON.stringify(bag));
  } catch {
    // Storage blocked: the count still updates for this tab via the event below.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useBagCount() {
  return useSyncExternalStore(subscribe, count, () => 0);
}

// Raw JSON string as the snapshot, so the hook returns the same value until the bag changes.
function snapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

export function useBag(): Bag {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}");
  return useMemo(() => {
    try {
      const v: unknown = JSON.parse(raw);
      return v && typeof v === "object" ? (v as Bag) : {};
    } catch {
      return {};
    }
  }, [raw]);
}

export function writeBag(bag: Bag) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bag));
  } catch {
    // Storage blocked: the change is not saved.
  }
  window.dispatchEvent(new Event(EVENT));
}
