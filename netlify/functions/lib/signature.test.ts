import assert from "node:assert/strict";
import { test } from "node:test";
import { hmacHex, verifyPaymentSignature, verifyWebhookSignature } from "./signature.ts";

const keySecret = "rzp_test_secret";

test("payment signature accepts the HMAC of order and payment IDs", () => {
  const signature = hmacHex(keySecret, "order_1|pay_1");
  assert.equal(verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_1", signature, keySecret }), true);
});

test("payment signature rejects a swapped payment, a wrong secret or a short signature", () => {
  const signature = hmacHex(keySecret, "order_1|pay_1");
  assert.equal(verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_2", signature, keySecret }), false);
  assert.equal(verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_1", signature, keySecret: "other" }), false);
  assert.equal(verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_1", signature: "abc", keySecret }), false);
});

test("webhook signature covers the exact raw body", () => {
  const body = '{"event":"payment.captured"}';
  const signature = hmacHex("webhook-secret", body);
  assert.equal(verifyWebhookSignature(body, signature, "webhook-secret"), true);
  assert.equal(verifyWebhookSignature(`${body} `, signature, "webhook-secret"), false);
  assert.equal(verifyWebhookSignature(body, signature, "other-secret"), false);
});
