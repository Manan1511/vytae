import { INDIAN_STATES } from "../../../app/content/states.ts";
import { HttpError } from "./http.ts";

export const MAX_LINES = 10;
export const MAX_QUANTITY = 10;

const VARIANT = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const PHONE = /^(?:\+91)?([6-9]\d{9})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN = /^\d{6}$/;
const CODE = /^[A-Za-z0-9_-]{1,40}$/;

export type PaymentRequest = {
  lines: { variantId: string; quantity: number }[];
  contact: { name: string; phone: string; email: string };
  address: { line: string; city: string; state: string; pin: string };
  discountCode: string | null;
};

function invalid(message: string): never {
  throw new HttpError(400, message);
}

function text(value: unknown, label: string, min: number, max: number): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (trimmed.length < min || trimmed.length > max) invalid(`Please check your ${label}.`);
  return trimmed;
}

// Checks everything the browser sends. Prices never come from the browser, so they are not read here.
export function parsePaymentRequest(body: unknown): PaymentRequest {
  if (!body || typeof body !== "object") invalid("The request is not valid.");
  const data = body as Record<string, unknown>;

  if (!Array.isArray(data.lines) || data.lines.length < 1 || data.lines.length > MAX_LINES) {
    invalid("Your bag is empty or has too many items.");
  }
  const lines = (data.lines as unknown[]).map((entry) => {
    const line = (entry ?? {}) as Record<string, unknown>;
    if (typeof line.variantId !== "string" || !VARIANT.test(line.variantId)) {
      invalid("Something in your bag is not valid. Refresh and try again.");
    }
    if (typeof line.quantity !== "number" || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
      invalid("Check the quantity of an item in your bag.");
    }
    return { variantId: line.variantId, quantity: line.quantity };
  });

  const contact = (data.contact ?? {}) as Record<string, unknown>;
  const name = text(contact.name, "name", 2, 100);
  const phoneMatch = PHONE.exec(typeof contact.phone === "string" ? contact.phone.replace(/[\s-]/g, "") : "");
  if (!phoneMatch) invalid("Enter a valid 10-digit Indian mobile number.");
  const email = text(contact.email, "email", 5, 120);
  if (!EMAIL.test(email)) invalid("Enter a valid email address.");

  const address = (data.address ?? {}) as Record<string, unknown>;
  const line = text(address.line, "address", 5, 200);
  const city = text(address.city, "city", 2, 60);
  if (typeof address.state !== "string" || !(address.state in INDIAN_STATES)) invalid("Choose your state.");
  const pin = typeof address.pin === "string" ? address.pin.trim() : "";
  if (!PIN.test(pin)) invalid("Enter a valid 6-digit PIN code.");

  let discountCode: string | null = null;
  if (data.discountCode !== undefined && data.discountCode !== null && data.discountCode !== "") {
    if (typeof data.discountCode !== "string" || !CODE.test(data.discountCode.trim())) {
      invalid("That code isn’t valid for this order.");
    }
    discountCode = data.discountCode.trim();
  }

  return {
    lines,
    contact: { name, phone: `+91${phoneMatch[1]}`, email },
    address: { line, city, state: address.state, pin },
    discountCode,
  };
}
