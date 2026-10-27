// Browser side of a payment. The server prices the bag and opens the Razorpay order. Razorpay Checkout then takes the
// card, UPI or netbanking details, and the server confirms the payment. No card details pass through this site.
const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

// The last order, kept for the confirmation page. Session storage only, so it is gone when the tab closes.
export const LAST_ORDER_KEY = "vytae-last-order";

export type PaymentDetails = {
  lines: { variantId: string; quantity: number }[];
  contact: { name: string; phone: string; email: string };
  address: { line: string; city: string; state: string; pin: string };
  discountCode: string | null;
};

export type StartedPayment = {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  breakdown: { subtotalPaise: number; discountPaise: number; shippingPaise: number; totalPaise: number };
};

export type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type ConfirmedPayment =
  | { status: "confirmed"; orderName: string; orderId: string }
  | { status: "pending"; message: string };

export type CheckoutResult =
  | { kind: "paid"; response: RazorpayResponse }
  | { kind: "dismissed" }
  | { kind: "failed"; message: string };

type RazorpayInstance = {
  on: (event: "payment.failed", handler: (payload: { error?: { description?: string } }) => void) => void;
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  // 202 means the payment is in and the order is still being made. That is not an error.
  if (!res.ok && res.status !== 202) throw new Error(data.error ?? "Something went wrong. Try again.");
  return data;
}

export function startPayment(details: PaymentDetails): Promise<StartedPayment> {
  return post<StartedPayment>("/api/create-payment", details);
}

export function confirmPayment(response: RazorpayResponse): Promise<ConfirmedPayment> {
  return post<ConfirmedPayment>("/api/confirm-order", {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  });
}

let checkoutScript: Promise<void> | null = null;

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  checkoutScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      checkoutScript = null;
      reject(new Error("Secure payment could not be loaded. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return checkoutScript;
}

// Opens the Razorpay modal and resolves once the shopper pays, cancels, or the payment fails.
export async function openCheckout(input: {
  keyId: string;
  orderId: string;
  amountPaise: number;
  contact: { name: string; phone: string; email: string };
}): Promise<CheckoutResult> {
  await loadCheckout();
  const Checkout = window.Razorpay;
  if (!Checkout) throw new Error("Secure payment could not be loaded. Try again.");

  return new Promise<CheckoutResult>((resolve) => {
    const checkout = new Checkout({
      key: input.keyId,
      amount: input.amountPaise,
      currency: "INR",
      name: "VYTAE",
      description: "VYTAE order",
      order_id: input.orderId,
      prefill: { name: input.contact.name, email: input.contact.email, contact: input.contact.phone },
      theme: { color: "#26497a" },
      handler: (response: RazorpayResponse) => resolve({ kind: "paid", response }),
      modal: { ondismiss: () => resolve({ kind: "dismissed" }) },
    });
    checkout.on("payment.failed", (event) =>
      resolve({ kind: "failed", message: event.error?.description ?? "The payment didn’t go through. Try again." }),
    );
    checkout.open();
  });
}
