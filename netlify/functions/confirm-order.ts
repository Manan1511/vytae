import { HttpError, failure, json, readJson } from "./lib/http.ts";
import { createPaidOrder } from "./lib/orders.ts";
import { unpackNotes } from "./lib/notes.ts";
import { fetchOrder, fetchPayment } from "./lib/razorpay.ts";
import { verifyPaymentSignature } from "./lib/signature.ts";

export const config = { path: "/api/confirm-order" };

const MAX_BODY_BYTES = 4 * 1024;

function requiredText(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value.length === 0 || value.length > 200) {
    throw new HttpError(400, "We couldn’t verify that payment.");
  }
  return value;
}

// Runs after the shopper pays in the modal. The signature, the captured payment and the amount are all checked against
// Razorpay before any order is created. Order creation is idempotent, so the webhook can finish the same payment.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const body = (await readJson(request, MAX_BODY_BYTES)) as Record<string, unknown>;
    const orderId = requiredText(body, "razorpay_order_id");
    const paymentId = requiredText(body, "razorpay_payment_id");
    const signature = requiredText(body, "razorpay_signature");

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not set.");
    if (!verifyPaymentSignature({ orderId, paymentId, signature, keySecret })) {
      throw new HttpError(400, "We couldn’t verify that payment.");
    }

    const [order, payment] = await Promise.all([fetchOrder(orderId), fetchPayment(paymentId)]);
    if (payment.order_id !== orderId || payment.currency !== "INR") throw new HttpError(400, "We couldn’t verify that payment.");
    if (payment.status !== "captured") {
      return json({ status: "pending", message: "Your payment is still processing." }, 202);
    }
    if (payment.amount !== order.amount) throw new HttpError(400, "We couldn’t verify that payment.");

    const checkout = unpackNotes(order.notes);
    if (checkout.totalPaise !== payment.amount) throw new HttpError(400, "We couldn’t verify that payment.");

    try {
      const created = await createPaidOrder({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        capturedPaise: payment.amount,
        checkout,
      });
      return json({ status: "confirmed", orderName: created.name, orderId: created.id });
    } catch (error) {
      // The money is captured, so nothing is lost. The webhook retries the same order, and the admin monitor lists it.
      console.error(error);
      return json({ status: "pending", message: "Payment received. We’re confirming your order." }, 202);
    }
  } catch (error) {
    return failure(error);
  }
}
