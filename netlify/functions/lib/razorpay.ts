// Razorpay REST calls. Keys are read from the environment and never returned to the browser, except the key ID,
// which Razorpay Checkout needs to open the payment modal.
const BASE = "https://api.razorpay.com/v1";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  notes: Record<string, string>;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
};

function credentials(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys are not set.");
  return { keyId, keySecret };
}

export function razorpayKeyId(): string {
  return credentials().keyId;
}

async function razorpay<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const { keyId, keySecret } = credentials();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Razorpay ${method} ${path} failed with status ${res.status}.`);
  return (await res.json()) as T;
}

// payment_capture: 1 captures the money as soon as the shopper pays.
export function createOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }): Promise<RazorpayOrder> {
  return razorpay<RazorpayOrder>("POST", "/orders", {
    amount: input.amountPaise,
    currency: "INR",
    receipt: input.receipt,
    payment_capture: 1,
    notes: input.notes,
  });
}

export function fetchOrder(orderId: string): Promise<RazorpayOrder> {
  return razorpay<RazorpayOrder>("GET", `/orders/${encodeURIComponent(orderId)}`);
}

export function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  return razorpay<RazorpayPayment>("GET", `/payments/${encodeURIComponent(paymentId)}`);
}
