import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, mock, test } from "node:test";
import confirmOrder from "../confirm-order.ts";
import createPayment from "../create-payment.ts";
import razorpayWebhook from "../razorpay-webhook.ts";
import { packNotes, type CheckoutNotes } from "./notes.ts";

// The handlers read these at call time. Shopify and Razorpay are faked below, so no test touches the network.
process.env.VITE_SHOPIFY_DOMAIN = "test-shop.myshopify.com";
process.env.SHOPIFY_ADMIN_CLIENT_ID = "admin-client";
process.env.SHOPIFY_ADMIN_CLIENT_SECRET = "admin-secret";
process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN = "private-token";
process.env.RAZORPAY_KEY_ID = "rzp_test_key";
process.env.RAZORPAY_KEY_SECRET = "rzp_test_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "webhook-secret";

afterEach(() => mock.restoreAll());

type Json = Record<string, any>;

const variantId = "gid://shopify/ProductVariant/4001";
const checkout: CheckoutNotes = {
  lines: [{ variantId, quantity: 2 }],
  contact: { name: "Asha Rao", email: "asha@example.com", phone: "+919876543210" },
  address: { line: "12 MG Road, Indiranagar", city: "Bengaluru", state: "KA", pin: "560038" },
  discountCode: null,
  discountPaise: 0,
  shippingPaise: 7_900,
  totalPaise: 187_700,
};

const validBody = {
  lines: [{ variantId, quantity: 2 }],
  contact: { name: "Asha Rao", phone: "98765 43210", email: "asha@example.com" },
  address: { line: "12 MG Road, Indiranagar", city: "Bengaluru", state: "KA", pin: "560038" },
  discountCode: null,
};

const reply = (body: Json, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const request = (body: unknown, method = "POST") =>
  new Request("https://shop.test/api/x", {
    method,
    body: method === "GET" ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

// Replaces fetch for one test. The handler sees the URL, the method and the parsed JSON body, when there is one.
function fakeNetwork(handler: (url: string, method: string, body: Json | undefined) => Promise<Response>) {
  return mock.method(
    globalThis,
    "fetch",
    (async (input: string | URL | Request, init?: RequestInit) =>
      handler(
        String(input),
        init?.method ?? "GET",
        typeof init?.body === "string" ? (JSON.parse(init.body) as Json) : undefined,
      )) as typeof fetch,
  );
}

// Shopify caps a line at the stock it holds, so `quantity` stands for the stock when it is below what was asked for.
function storefrontCart(options: {
  subtotal: string;
  total?: string;
  quantity?: number;
  discount?: { code: string; applicable: boolean };
}) {
  return {
    cost: {
      subtotalAmount: { amount: options.subtotal },
      totalAmount: { amount: options.total ?? options.subtotal },
    },
    discountCodes: options.discount ? [options.discount] : [],
    lines: {
      nodes: [
        {
          quantity: options.quantity ?? 2,
          merchandise: {
            id: variantId,
            price: { amount: "899.0" },
            availableForSale: true,
            product: { title: "Night Onset" },
          },
        },
      ],
    },
  };
}

const isTokenRequest = (url: string) => url.endsWith("/admin/oauth/access_token");
const tokenReply = () => reply({ access_token: "admin-token", expires_in: 86_399 });

test("create-payment prices the bag on Shopify and opens a Razorpay order", async () => {
  const sent: Json[] = [];
  fakeNetwork(async (url, method, body) => {
    if (isTokenRequest(url)) return tokenReply();
    if (url.includes("/api/") && String(body?.query).includes("PriceCart")) {
      return reply({ data: { cartCreate: { cart: storefrontCart({ subtotal: "1798.0" }), userErrors: [] } } });
    }
    if (url === "https://api.razorpay.com/v1/orders" && method === "POST") {
      sent.push(body ?? {});
      return reply({ id: "order_TEST1", amount: 179_800, currency: "INR", status: "created", receipt: body?.receipt, notes: body?.notes });
    }
    return reply({ error: "unexpected request" }, 500);
  });

  const res = await createPayment(request(validBody));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.keyId, "rzp_test_key");
  assert.equal(data.razorpayOrderId, "order_TEST1");
  // Two units are ₹1,798, which is over ₹999, so delivery is free.
  assert.equal(data.amountPaise, 179_800);
  assert.equal(data.breakdown.shippingPaise, 0);
  assert.equal(sent[0].notes.l, "4001:2");
  assert.equal(sent[0].notes.t, "179800");
  assert.equal(sent[0].payment_capture, 1);
});

test("create-payment charges ₹79 delivery on a bag under ₹999", async () => {
  fakeNetwork(async (url, _method, body) => {
    if (isTokenRequest(url)) return tokenReply();
    if (String(body?.query).includes("PriceCart")) {
      return reply({ data: { cartCreate: { cart: storefrontCart({ subtotal: "899.0", quantity: 1 }), userErrors: [] } } });
    }
    return reply({ id: "order_TEST3", amount: 97_800, currency: "INR", status: "created", notes: body?.notes });
  });

  const res = await createPayment(request({ ...validBody, lines: [{ variantId, quantity: 1 }] }));
  const data = await res.json();
  // ₹899 for the bottle, plus ₹79 delivery.
  assert.equal(data.breakdown.shippingPaise, 7_900);
  assert.equal(data.amountPaise, 97_800);
});

test("create-payment gives free delivery once the discounted bag reaches ₹999", async () => {
  fakeNetwork(async (url, _method, body) => {
    if (isTokenRequest(url)) return tokenReply();
    if (String(body?.query).includes("PriceCart")) {
      return reply({
        data: {
          cartCreate: {
            cart: storefrontCart({ subtotal: "1798.0", total: "1618.2", discount: { code: "WELCOME10", applicable: true } }),
            userErrors: [],
          },
        },
      });
    }
    return reply({ id: "order_TEST2", amount: 161_820, currency: "INR", status: "created", notes: body?.notes });
  });

  const res = await createPayment(request({ ...validBody, discountCode: "WELCOME10" }));
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.breakdown.discountPaise, 17_980);
  assert.equal(data.breakdown.shippingPaise, 0);
  assert.equal(data.amountPaise, 161_820);
});

test("create-payment refuses a discount code Shopify does not apply", async () => {
  fakeNetwork(async (url, _method, body) => {
    if (isTokenRequest(url)) return tokenReply();
    return reply({
      data: {
        cartCreate: {
          cart: storefrontCart({ subtotal: "1798.0", discount: { code: "BADCODE", applicable: false } }),
          userErrors: [],
        },
      },
    });
  });
  const res = await createPayment(request({ ...validBody, discountCode: "BADCODE" }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "That code isn’t valid for this order.");
});

test("create-payment reports stock that is no longer there", async () => {
  fakeNetwork(async (url) => {
    if (isTokenRequest(url)) return tokenReply();
    // Two were asked for and Shopify holds one, so it returns a cart with one.
    return reply({ data: { cartCreate: { cart: storefrontCart({ subtotal: "899.0", quantity: 1 }), userErrors: [] } } });
  });
  const res = await createPayment(request(validBody));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, "Only 1 left of Night Onset.");
});

test("create-payment accepts POST only", async () => {
  const res = await createPayment(request(undefined, "GET"));
  assert.equal(res.status, 405);
});

// Razorpay and Shopify, as a paid order sees them. Each test chooses the payment status and existing orders.
function paidFake(options: { paymentStatus?: string; existingOrders?: { id: string; name: string }[]; orderErrors?: string[] }) {
  const created: Json[] = [];
  fakeNetwork(async (url, _method, body) => {
    const query = String(body?.query ?? "");
    if (isTokenRequest(url)) return tokenReply();
    if (url === "https://api.razorpay.com/v1/orders/order_TEST1") {
      return reply({
        id: "order_TEST1",
        amount: 187_700,
        currency: "INR",
        status: "paid",
        receipt: "vy_test",
        notes: packNotes(checkout),
      });
    }
    if (url === "https://api.razorpay.com/v1/payments/pay_TEST1") {
      return reply({
        id: "pay_TEST1",
        order_id: "order_TEST1",
        amount: 187_700,
        currency: "INR",
        status: options.paymentStatus ?? "captured",
      });
    }
    if (query.includes("FindOrders")) return reply({ data: { orders: { nodes: options.existingOrders ?? [] } } });
    if (query.includes("CreatePaidOrder")) {
      created.push(body?.variables ?? {});
      if (options.orderErrors) {
        return reply({ data: { orderCreate: { order: null, userErrors: options.orderErrors.map((message) => ({ message })) } } });
      }
      return reply({ data: { orderCreate: { order: { id: "gid://shopify/Order/1", name: "#1001" }, userErrors: [] } } });
    }
    return reply({ error: "unexpected request" }, 500);
  });
  return created;
}

const signedPayment = (orderId: string, paymentId: string) =>
  createHmac("sha256", "rzp_test_secret").update(`${orderId}|${paymentId}`).digest("hex");

test("confirm-order verifies the payment, then creates one Shopify order", async () => {
  const created = paidFake({});
  const res = await confirmOrder(
    request({
      razorpay_order_id: "order_TEST1",
      razorpay_payment_id: "pay_TEST1",
      razorpay_signature: signedPayment("order_TEST1", "pay_TEST1"),
    }),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "confirmed", orderName: "#1001", orderId: "gid://shopify/Order/1" });
  assert.equal(created.length, 1);
  const order = created[0].order;
  assert.equal(order.financialStatus, "PAID");
  assert.deepEqual(order.tags, ["headless", "razorpay", "rzp_order_TEST1"]);
  assert.equal(order.transactions[0].authorizationCode, "pay_TEST1");
  assert.equal(order.shippingLines[0].priceSet.shopMoney.amount, "79.00");
  assert.equal(order.discountCode, undefined);
});

test("confirm-order returns the existing order instead of creating a second one", async () => {
  const created = paidFake({ existingOrders: [{ id: "gid://shopify/Order/1", name: "#1001" }] });
  const res = await confirmOrder(
    request({
      razorpay_order_id: "order_TEST1",
      razorpay_payment_id: "pay_TEST1",
      razorpay_signature: signedPayment("order_TEST1", "pay_TEST1"),
    }),
  );
  assert.equal((await res.json()).orderName, "#1001");
  assert.equal(created.length, 0);
});

test("confirm-order refuses a bad signature before calling Razorpay", async () => {
  const created = paidFake({});
  const res = await confirmOrder(
    request({ razorpay_order_id: "order_TEST1", razorpay_payment_id: "pay_TEST1", razorpay_signature: "f".repeat(64) }),
  );
  assert.equal(res.status, 400);
  assert.equal(created.length, 0);
});

test("confirm-order asks the browser to wait while the payment is not yet captured", async () => {
  paidFake({ paymentStatus: "authorized" });
  const res = await confirmOrder(
    request({
      razorpay_order_id: "order_TEST1",
      razorpay_payment_id: "pay_TEST1",
      razorpay_signature: signedPayment("order_TEST1", "pay_TEST1"),
    }),
  );
  assert.equal(res.status, 202);
  assert.equal((await res.json()).status, "pending");
});

test("confirm-order keeps the payment and says so when the order cannot be created", async () => {
  mock.method(console, "error", () => {});
  paidFake({ orderErrors: ["Access denied for orderCreate field."] });
  const res = await confirmOrder(
    request({
      razorpay_order_id: "order_TEST1",
      razorpay_payment_id: "pay_TEST1",
      razorpay_signature: signedPayment("order_TEST1", "pay_TEST1"),
    }),
  );
  assert.equal(res.status, 202);
  assert.equal((await res.json()).message, "Payment received. We’re confirming your order.");
});

const webhookBody = JSON.stringify({
  event: "payment.captured",
  payload: { payment: { entity: { id: "pay_TEST1", order_id: "order_TEST1" } } },
});

test("the webhook rejects a body whose signature does not match", async () => {
  paidFake({});
  const res = await razorpayWebhook(
    new Request("https://shop.test/api/razorpay-webhook", {
      method: "POST",
      body: webhookBody,
      headers: { "x-razorpay-signature": "0".repeat(64) },
    }),
  );
  assert.equal(res.status, 400);
});

test("the webhook creates the order for a captured payment when the browser never returned", async () => {
  const created = paidFake({});
  const signature = createHmac("sha256", "webhook-secret").update(webhookBody).digest("hex");
  const res = await razorpayWebhook(
    new Request("https://shop.test/api/razorpay-webhook", {
      method: "POST",
      body: webhookBody,
      headers: { "x-razorpay-signature": signature },
    }),
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).orderName, "#1001");
  assert.equal(created.length, 1);
});

test("the webhook returns 500 when order creation fails, so Razorpay retries", async () => {
  mock.method(console, "error", () => {});
  paidFake({ orderErrors: ["Access denied for orderCreate field."] });
  const signature = createHmac("sha256", "webhook-secret").update(webhookBody).digest("hex");
  const res = await razorpayWebhook(
    new Request("https://shop.test/api/razorpay-webhook", {
      method: "POST",
      body: webhookBody,
      headers: { "x-razorpay-signature": signature },
    }),
  );
  assert.equal(res.status, 500);
});
