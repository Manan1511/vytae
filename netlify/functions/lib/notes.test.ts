import assert from "node:assert/strict";
import { test } from "node:test";
import { packNotes, unpackNotes, type CheckoutNotes } from "./notes.ts";

const base: CheckoutNotes = {
  lines: [
    { variantId: "gid://shopify/ProductVariant/4001", quantity: 2 },
    { variantId: "gid://shopify/ProductVariant/4002", quantity: 1 },
  ],
  contact: { name: "Asha Rao", email: "asha@example.com", phone: "+919876543210" },
  address: { line: "12 MG Road, Indiranagar", city: "Bengaluru", state: "KA", pin: "560038" },
  discountCode: "WELCOME10",
  discountPaise: 29_800,
  shippingPaise: 0,
  totalPaise: 268_200,
};

test("checkout notes round-trip through Razorpay note values", () => {
  const notes = packNotes(base);
  assert.equal(notes.l, "4001:2,4002:1");
  assert.deepEqual(unpackNotes(notes), base);
});

test("a checkout without a discount code round-trips with null", () => {
  const checkout = { ...base, discountCode: null, discountPaise: 0 };
  const notes = packNotes(checkout);
  assert.equal(notes.d, undefined);
  assert.deepEqual(unpackNotes(notes), checkout);
});

test("a long address is split across note values and joined back", () => {
  const line = "Flat 4B, Sunrise Residency, ".repeat(20).trim(); // about 540 characters
  const checkout = { ...base, address: { ...base.address, line } };
  const notes = packNotes(checkout);
  assert.ok(notes.a1 && notes.a2 && notes.a3, "three address chunks");
  assert.equal(unpackNotes(notes).address.line, line);
});

test("an address too long for three notes is refused, not truncated", () => {
  const checkout = { ...base, address: { ...base.address, line: "x".repeat(800) } };
  assert.throws(() => packNotes(checkout), /too long/);
});

test("a note value above the limit is refused", () => {
  const checkout = { ...base, contact: { ...base.contact, name: "n".repeat(300) } };
  assert.throws(() => packNotes(checkout), /too long/);
});

test("unpacking fails loudly when a required note is missing", () => {
  const notes = packNotes(base);
  delete notes.e;
  assert.throws(() => unpackNotes(notes), /note e is missing/);
});

test("a line note that is not a variant number is refused", () => {
  const notes = packNotes(base);
  notes.l = "4001:two";
  assert.throws(() => unpackNotes(notes), /malformed/);
});
