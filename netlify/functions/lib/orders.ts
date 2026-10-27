import { toRupeeString } from "./money.ts";
import type { CheckoutNotes } from "./notes.ts";
import { adminQuery } from "./shopify.ts";

export type CreatedOrder = { id: string; name: string };

const FIND_ORDERS = `query FindOrders($query: String!) {
  orders(first: 5, query: $query) { nodes { id name } }
}`;

const CREATE_ORDER = `mutation CreatePaidOrder($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
  orderCreate(order: $order, options: $options) {
    order { id name }
    userErrors { message }
  }
}`;

export const orderTag = (razorpayOrderId: string) => `rzp_${razorpayOrderId}`;

const money = (paise: number) => ({ shopMoney: { amount: toRupeeString(paise), currencyCode: "INR" } });

export type PaidOrderInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  capturedPaise: number;
  checkout: CheckoutNotes;
};

// The Shopify order for a captured payment. Prices come from the variants, and the computed discount is applied as a
// fixed amount, so the order total matches what was charged.
export function buildOrderInput(input: PaidOrderInput) {
  const { checkout } = input;
  const [firstName, ...rest] = checkout.contact.name.split(" ");
  const lastName = rest.length > 0 ? rest.join(" ") : undefined;
  const address = {
    firstName,
    lastName,
    address1: checkout.address.line,
    city: checkout.address.city,
    provinceCode: checkout.address.state,
    zip: checkout.address.pin,
    countryCode: "IN",
    phone: checkout.contact.phone,
  };

  return {
    email: checkout.contact.email,
    phone: checkout.contact.phone,
    currency: "INR",
    presentmentCurrency: "INR",
    financialStatus: "PAID",
    tags: ["headless", "razorpay", orderTag(input.razorpayOrderId)],
    customAttributes: [
      { key: "razorpay_order_id", value: input.razorpayOrderId },
      { key: "razorpay_payment_id", value: input.razorpayPaymentId },
    ],
    lineItems: checkout.lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
    shippingLines: [{ title: "Standard delivery", priceSet: money(checkout.shippingPaise) }],
    shippingAddress: address,
    billingAddress: address,
    customer: {
      toUpsert: { email: checkout.contact.email, firstName, lastName, phone: checkout.contact.phone },
    },
    discountCode:
      checkout.discountCode && checkout.discountPaise > 0
        ? { itemFixedDiscountCode: { code: checkout.discountCode, amountSet: money(checkout.discountPaise) } }
        : undefined,
    transactions: [
      {
        amountSet: money(input.capturedPaise),
        gateway: "Razorpay",
        kind: "SALE",
        status: "SUCCESS",
        authorizationCode: input.razorpayPaymentId,
        processedAt: new Date().toISOString(),
      },
    ],
  };
}

async function findOrders(tag: string): Promise<CreatedOrder[]> {
  const data = await adminQuery<{ orders: { nodes: CreatedOrder[] } }>(FIND_ORDERS, { query: `tag:${tag}` });
  return data.orders.nodes;
}

// Idempotent per payment. The order is tagged with its Razorpay order ID, so a repeat call (confirm and webhook can both
// run) returns the order that already exists.
export async function createPaidOrder(input: PaidOrderInput): Promise<CreatedOrder> {
  const tag = orderTag(input.razorpayOrderId);
  const [existing] = await findOrders(tag);
  if (existing) return existing;

  const data = await adminQuery<{ orderCreate: { order: CreatedOrder | null; userErrors: { message: string }[] } }>(
    CREATE_ORDER,
    {
      order: buildOrderInput(input),
      options: { inventoryBehaviour: "DECREMENT_OBEYING_POLICY", sendReceipt: true },
    },
  );
  const { order, userErrors } = data.orderCreate;
  if (!order) throw new Error(`orderCreate failed: ${userErrors.map((e) => e.message).join("; ")}`);

  // If two calls raced, both orders exist. The first is kept and both are logged for review.
  const copies = await findOrders(tag);
  if (copies.length > 1) console.error(`Duplicate Shopify orders for ${tag}: ${copies.map((c) => c.name).join(", ")}`);
  return order;
}
