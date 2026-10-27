import { createHmac, timingSafeEqual } from "node:crypto";

function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

// Compares two hex strings in constant time. Lengths are checked first, because timingSafeEqual needs equal lengths.
function matches(expected: string, actual: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Razorpay signs "order_id|payment_id" with the key secret.
export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  return matches(hmacHex(input.keySecret, `${input.orderId}|${input.paymentId}`), input.signature);
}

// Razorpay signs the raw webhook body with the webhook secret. The header arrives as X-Razorpay-Signature.
export function verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string): boolean {
  return matches(hmacHex(webhookSecret, rawBody), signature);
}

export { hmacHex };
