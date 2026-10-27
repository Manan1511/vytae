// Razorpay order notes carry the checkout to the webhook, which can run without the browser.
// Each value stays under 255 characters, a conservative limit, and an order has at most 15 keys.
const NOTE_VALUE_LIMIT = 255;
const MAX_ADDRESS_CHUNKS = 3;
const VARIANT_PREFIX = "gid://shopify/ProductVariant/";

export type CheckoutNotes = {
  lines: { variantId: string; quantity: number }[];
  contact: { name: string; email: string; phone: string };
  address: { line: string; city: string; state: string; pin: string };
  discountCode: string | null;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
};

export function packNotes(checkout: CheckoutNotes): Record<string, string> {
  const lines = checkout.lines
    .map((line) => {
      if (!line.variantId.startsWith(VARIANT_PREFIX)) throw new Error(`Unknown variant: ${line.variantId}`);
      return `${line.variantId.slice(VARIANT_PREFIX.length)}:${line.quantity}`;
    })
    .join(",");

  const notes: Record<string, string> = {
    v: "1",
    l: lines,
    n: checkout.contact.name,
    e: checkout.contact.email,
    p: checkout.contact.phone,
    c: checkout.address.city,
    s: checkout.address.state,
    z: checkout.address.pin,
    dp: String(checkout.discountPaise),
    sh: String(checkout.shippingPaise),
    t: String(checkout.totalPaise),
  };
  if (checkout.discountCode) notes.d = checkout.discountCode;

  const address = checkout.address.line;
  const chunks = Math.ceil(address.length / NOTE_VALUE_LIMIT);
  if (chunks > MAX_ADDRESS_CHUNKS) throw new Error("Address is too long for checkout.");
  for (let i = 0; i < chunks; i++) {
    notes[`a${i + 1}`] = address.slice(i * NOTE_VALUE_LIMIT, (i + 1) * NOTE_VALUE_LIMIT);
  }

  for (const [key, value] of Object.entries(notes)) {
    if (value.length > NOTE_VALUE_LIMIT) throw new Error(`Checkout note ${key} is too long.`);
  }
  if (Object.keys(notes).length > 15) throw new Error("Too many checkout notes.");
  return notes;
}

export function unpackNotes(notes: Record<string, string | undefined>): CheckoutNotes {
  const required = (key: string): string => {
    const value = notes[key];
    if (!value) throw new Error(`Checkout note ${key} is missing.`);
    return value;
  };
  if (required("v") !== "1") throw new Error("Unknown checkout note version.");

  const lines = required("l")
    .split(",")
    .map((entry) => {
      const [id, qty] = entry.split(":");
      const quantity = Number(qty);
      if (!/^\d+$/.test(id ?? "") || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Checkout line note is malformed.");
      }
      return { variantId: `${VARIANT_PREFIX}${id}`, quantity };
    });

  const address = Array.from({ length: MAX_ADDRESS_CHUNKS }, (_, i) => notes[`a${i + 1}`] ?? "").join("");
  return {
    lines,
    contact: { name: required("n"), email: required("e"), phone: required("p") },
    address: { line: address, city: required("c"), state: required("s"), pin: required("z") },
    discountCode: notes.d || null,
    discountPaise: Number(required("dp")),
    shippingPaise: Number(required("sh")),
    totalPaise: Number(required("t")),
  };
}
