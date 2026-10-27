import assert from "node:assert/strict";
import { test } from "node:test";
import { toPaise, toRupeeString } from "./money.ts";
import { shippingPaise } from "./shipping.ts";

test("toPaise reads Shopify rupee strings without float error", () => {
  assert.equal(toPaise("1099"), 109_900);
  assert.equal(toPaise("1099.0"), 109_900);
  assert.equal(toPaise("1099.9"), 109_990);
  assert.equal(toPaise("1099.99"), 109_999);
  assert.equal(toPaise("0.05"), 5);
  assert.equal(toPaise(1099), 109_900);
});

test("toPaise rejects negative, over-precise and non-numeric amounts", () => {
  assert.throws(() => toPaise("-5"));
  assert.throws(() => toPaise("10.999"));
  assert.throws(() => toPaise("abc"));
});

test("toRupeeString builds exact two-decimal rupees from paise", () => {
  assert.equal(toRupeeString(109_900), "1099.00");
  assert.equal(toRupeeString(5), "0.05");
  assert.throws(() => toRupeeString(-1));
  assert.throws(() => toRupeeString(1.5));
});

test("delivery is ₹79 under ₹999 and free from ₹999, after discounts", () => {
  assert.equal(shippingPaise(0), 0);
  assert.equal(shippingPaise(99_800), 7_900); // ₹998.00
  assert.equal(shippingPaise(99_899), 7_900); // ₹998.99
  assert.equal(shippingPaise(99_900), 0); // ₹999.00
  assert.equal(shippingPaise(189_900), 0);
});
