import { json } from "./lib/http.ts";
import { unpackNotes } from "./lib/notes.ts";
import { createPaidOrder } from "./lib/orders.ts";
import { fetchOrder, fetchPayment } from "./lib/razorpay.ts";
import { verifyWebhookSignature } from "./lib/signature.ts";

export const config = { path: "/api/razorpay-webhook" };

const MAX_BODY_BYTES = 64 * 1024;

type WebhookEvent = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
};

// Razorpay calls this even when the shopper closes the browser after paying. Signed bodies only.
// A malformed checkout is logged and acknowledged, because retrying it cannot succeed. A failed order creation returns
// 500, so Razorpay retries, and the retry is safe because order creation is idempotent.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set.");
    return json({ error: "Webhook is not configured." }, 500);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: "Payload too large." }, 413);
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature") ?? "", secret)) {
    return json({ error: "Invalid signature." }, 400);
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(raw) as WebhookEvent;
  } catch {
    return json({ error: "Payload is not JSON." }, 400);
  }
  if (event.event !== "payment.captured") return json({ received: true });

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) {
    console.error("payment.captured without a payment or order ID.");
    return json({ received: true });
  }

  try {
    const [order, details] = await Promise.all([fetchOrder(payment.order_id), fetchPayment(payment.id)]);
    if (details.status !== "captured" || details.order_id !== order.id || details.amount !== order.amount) {
      console.error(`Webhook payment ${payment.id} does not match its order ${order.id}.`);
      return json({ received: true });
    }

    let checkout;
    try {
      checkout = unpackNotes(order.notes);
    } catch (error) {
      console.error(`Order ${order.id} has unusable checkout notes.`, error);
      return json({ received: true });
    }

    const created = await createPaidOrder({
      razorpayOrderId: order.id,
      razorpayPaymentId: details.id,
      capturedPaise: details.amount,
      checkout,
    });
    return json({ received: true, orderName: created.name });
  } catch (error) {
    console.error(error);
    return json({ error: "Order creation failed. Razorpay will retry." }, 500);
  }
}
