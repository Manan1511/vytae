import { randomUUID } from "node:crypto";
import { failure, json, readJson } from "./lib/http.ts";
import { packNotes } from "./lib/notes.ts";
import { priceCart } from "./lib/pricing.ts";
import { createOrder, razorpayKeyId } from "./lib/razorpay.ts";
import { shippingPaise } from "./lib/shipping.ts";
import { parsePaymentRequest } from "./lib/validate.ts";

export const config = { path: "/api/create-payment" };

const MAX_BODY_BYTES = 8 * 1024;

// Prices the bag, works out delivery, and opens a Razorpay order. The amount is computed here from Shopify prices,
// never from the browser. The checkout details travel in the order notes, so the webhook can finish the order alone.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const input = parsePaymentRequest(await readJson(request, MAX_BODY_BYTES));
    const priced = await priceCart({ lines: input.lines, discountCode: input.discountCode });
    const delivery = shippingPaise(priced.discountedPaise);
    const totalPaise = priced.discountedPaise + delivery;

    const notes = packNotes({
      lines: priced.lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
      contact: input.contact,
      address: input.address,
      discountCode: priced.discountCode,
      discountPaise: priced.discountPaise,
      shippingPaise: delivery,
      totalPaise,
    });

    const order = await createOrder({
      amountPaise: totalPaise,
      receipt: `vy_${randomUUID().replace(/-/g, "").slice(0, 24)}`,
      notes,
    });

    return json({
      keyId: razorpayKeyId(),
      razorpayOrderId: order.id,
      amountPaise: totalPaise,
      breakdown: {
        subtotalPaise: priced.subtotalPaise,
        discountPaise: priced.discountPaise,
        shippingPaise: delivery,
        totalPaise,
      },
    });
  } catch (error) {
    return failure(error);
  }
}
