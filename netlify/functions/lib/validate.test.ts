import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpError } from "./http.ts";
import { parsePaymentRequest } from "./validate.ts";

const valid = {
  lines: [{ variantId: "gid://shopify/ProductVariant/4001", quantity: 2 }],
  contact: { name: "Asha Rao", phone: "98765 43210", email: "asha@example.com" },
  address: { line: "12 MG Road, Indiranagar", city: "Bengaluru", state: "KA", pin: "560038" },
  discountCode: " welcome10 ",
};

test("a valid request is normalised: phone to +91, code trimmed", () => {
  const parsed = parsePaymentRequest(valid);
  assert.equal(parsed.contact.phone, "+919876543210");
  assert.equal(parsed.discountCode, "welcome10");
  assert.equal(parsed.address.state, "KA");
});

test("an empty discount code is treated as no code", () => {
  assert.equal(parsePaymentRequest({ ...valid, discountCode: "" }).discountCode, null);
});

const rejects = (body: unknown) => {
  assert.throws(
    () => parsePaymentRequest(body),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
};

test("requests with bad lines are rejected", () => {
  rejects({ ...valid, lines: [] });
  rejects({ ...valid, lines: [{ variantId: "4001", quantity: 1 }] });
  rejects({ ...valid, lines: [{ variantId: "gid://shopify/ProductVariant/4001", quantity: 0 }] });
  rejects({ ...valid, lines: [{ variantId: "gid://shopify/ProductVariant/4001", quantity: 11 }] });
});

test("requests with bad contact details are rejected", () => {
  rejects({ ...valid, contact: { ...valid.contact, name: "A" } });
  rejects({ ...valid, contact: { ...valid.contact, phone: "12345" } });
  rejects({ ...valid, contact: { ...valid.contact, phone: "+14155550123" } });
  rejects({ ...valid, contact: { ...valid.contact, email: "not-an-email" } });
});

test("requests with a bad address are rejected", () => {
  rejects({ ...valid, address: { ...valid.address, state: "XX" } });
  rejects({ ...valid, address: { ...valid.address, pin: "5600" } });
  rejects({ ...valid, address: { ...valid.address, line: "ab" } });
});

test("a discount code with odd characters is rejected", () => {
  rejects({ ...valid, discountCode: "bad code!" });
});
