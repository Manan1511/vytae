import { useState } from "react";
import { Link } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { Eyebrow } from "../components/ui/Eyebrow";
import { inr } from "../content/products";
import { LAST_ORDER_KEY } from "../lib/payment";

export function meta() {
  return [{ title: "Order confirmed | VYTAE" }, { name: "robots", content: "noindex" }];
}

type LastOrder = {
  status: "confirmed" | "pending";
  orderName: string | null;
  message: string | null;
  paymentId: string;
  email: string;
  amountPaise: number;
  discountPaise: number;
  shippingPaise: number;
  lines: { name: string; quantity: number; unitPrice: number }[];
};

function readLastOrder(): LastOrder | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as LastOrder) : null;
  } catch {
    return null;
  }
}

// The checkout writes the order to session storage just before it opens this page.
export default function BagConfirmedPage() {
  const [order] = useState<LastOrder | null>(readLastOrder);

  if (!order) {
    return (
      <SiteShell variant="solid">
        <section className="mx-auto max-w-[760px] px-[clamp(20px,3vw,40px)] pt-[clamp(56px,7vw,96px)] pb-[clamp(80px,10vw,120px)] text-center">
          <Eyebrow centered>Order</Eyebrow>
          <h1 className="m-0 mt-5 text-[clamp(36px,4vw,52px)] leading-[1.06] font-normal tracking-[-0.025em]">
            We couldn’t find your order here.
          </h1>
          <p className="m-0 mt-5 text-base leading-[1.6] text-ink-body">
            If you paid, your confirmation email has the details. For anything else, message us on WhatsApp and we’ll help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="inline-flex items-center rounded-full bg-ink px-[26px] py-3.5 text-[15px] font-semibold text-white hover:bg-ink-hover">
              Shop VYTAE
            </Link>
            <Link to="/contact" className="inline-flex items-center rounded-full border border-ink px-[26px] py-3.5 text-[15px] font-semibold text-ink hover:bg-frost">
              Contact us
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  const confirmed = order.status === "confirmed";

  return (
    <SiteShell variant="solid">
      <section className="mx-auto max-w-[760px] px-[clamp(20px,3vw,40px)] pt-[clamp(56px,7vw,96px)] pb-[clamp(80px,10vw,120px)]">
        <Eyebrow>{confirmed ? "Order confirmed" : "Payment received"}</Eyebrow>
        <h1 className="m-0 mt-5 text-[clamp(36px,4vw,52px)] leading-[1.06] font-normal tracking-[-0.025em]">
          {confirmed ? "Thank you. Your ritual is on its way." : "Thank you. We’re confirming your order."}
        </h1>
        <p className="m-0 mt-5 text-base leading-[1.6] text-ink-body">
          {confirmed
            ? `Order ${order.orderName}. A confirmation is on its way to ${order.email}.`
            : (order.message ?? "We’re confirming your order. You’ll get a confirmation email shortly.")}
        </p>

        {order.lines.length > 0 && (
          <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-line bg-cloud p-[clamp(22px,3vw,32px)]">
            {order.lines.map((line) => (
              <div key={line.name} className="flex justify-between gap-3 text-sm">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span className="tabular-nums">{inr(line.unitPrice * line.quantity)}</span>
              </div>
            ))}
            {order.discountPaise > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-ink-body">Discount</span>
                <span className="tabular-nums">−{inr(order.discountPaise / 100)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-ink-body">Delivery</span>
              <span>{order.shippingPaise ? inr(order.shippingPaise / 100) : "Free"}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-[rgba(27,54,93,0.12)] pt-3">
              <span className="text-base font-semibold">Paid online</span>
              <span className="text-2xl font-semibold tabular-nums">{inr(order.amountPaise / 100)}</span>
            </div>
            <span className="text-xs text-ink-muted">Payment {order.paymentId}</span>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/shop" className="inline-flex items-center rounded-full bg-ink px-[26px] py-3.5 text-[15px] font-semibold text-white hover:bg-ink-hover">
            Keep shopping
          </Link>
          <Link to="/batch" className="inline-flex items-center rounded-full border border-ink px-[26px] py-3.5 text-[15px] font-semibold text-ink hover:bg-frost">
            Check your Batch Passport
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
