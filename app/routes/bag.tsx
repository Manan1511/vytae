import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { INDIAN_STATES } from "../content/states";
import { inr } from "../content/products";
import { trackAddPaymentInfo, trackBeginCheckout } from "../lib/analytics";
import { parseBuyLine, useBuyNowStore, useCartStore, useSavedCartStore } from "../lib/cart";
import { LAST_ORDER_KEY, confirmPayment, openCheckout, startPayment, type ConfirmedPayment } from "../lib/payment";

export function meta() {
  return [{ title: "Bag | VYTAE" }, { name: "robots", content: "noindex" }];
}

const PACK: Record<string, string> = {
  "night-reset": "30 sachets",
  "rest-well": "60 capsules · 30 servings",
  "sleep-ritual": "Night Onset + Rest Well",
};

const SHIPPING_FEE = 79;
const FREE_SHIPPING_FROM = 999;
const STEPS = ["Bag", "Details", "Payment"] as const;

type Step = "bag" | "details" | "pay";
const STEP_INDEX: Record<Step, number> = { bag: 0, details: 1, pay: 2 };

type Details = { name: string; phone: string; email: string; addr: string; city: string; state: string; pin: string };
const EMPTY_DETAILS: Details = { name: "", phone: "", email: "", addr: "", city: "", state: "", pin: "" };

const INPUT = "rounded-[14px] border border-line bg-mist px-3.5 py-3 text-[15px] text-ink outline-none focus:border-ink";
const PRIMARY =
  "cursor-pointer rounded-full border-0 bg-[linear-gradient(180deg,#24497a_0%,#26497a_100%)] px-[26px] py-3.5 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_24px_-14px_rgba(30,62,106,0.7)] hover:bg-ink-hover";

// The bag shows the saved cart. A buy now link (?buy=handle:qty) opens checkout with its own cart and leaves the saved one alone.
export default function BagPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const buy = parseBuyLine(searchParams.get("buy"));
  const savedStore = useSavedCartStore();
  const buyNowStore = useBuyNowStore(buy);
  const store = buyNowStore ?? savedStore;
  const { cart, error } = useCartStore(store);

  const [step, setStep] = useState<Step>(() => (buy || searchParams.get("step") === "details" ? "details" : "bag"));
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Checkout starts when the shopper reaches the details step.
  useEffect(() => {
    if (step === "details" && cart) {
      trackBeginCheckout(
        cart.lines.map((line) => ({ item_id: line.handle, item_name: line.name, price: line.unitPrice, quantity: line.quantity })),
      );
    }
  }, [step]);

  if (cart === null) {
    return (
      <SiteShell variant="solid">
        <section className="mx-auto max-w-[1200px] px-[clamp(20px,3vw,40px)] pt-[clamp(36px,4vw,56px)] pb-[clamp(80px,10vw,120px)]">
          {error ? (
            <p role="alert" className="m-0 text-base text-ink-body">
              {error}
            </p>
          ) : (
            <p className="m-0 text-base text-ink-soft">Loading your bag…</p>
          )}
        </section>
      </SiteShell>
    );
  }

  const lines = cart.lines;
  const byHandle = (handle: string) => lines.find((line) => line.handle === handle);
  const night = byHandle("night-reset");
  const rest = byHandle("rest-well");
  const showUpsell = !byHandle("sleep-ritual") && night !== undefined && rest !== undefined;

  const discount = cart.discount;
  const subtotal = cart.subtotal;
  const discounted = cart.total;
  const shipping = discounted === 0 || discounted >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = discounted + shipping;
  const title = step === "bag" ? "Your bag" : "Checkout";
  // Payment needs Shopify variants. The offline bag has none, so Pay stays off there.
  const canPay = lines.length > 0 && lines.every((line) => line.variantId !== null);

  // Swaps matching Night Onset and Rest Well units for The Sleep Ritual. Any units left over stay in the bag.
  const swapToRitual = async () => {
    if (!night || !rest) return;
    const pairs = Math.min(night.quantity, rest.quantity);
    await store.setQuantity(night.id, night.quantity - pairs);
    await store.setQuantity(rest.id, rest.quantity - pairs);
    await store.add("sleep-ritual", pairs);
  };

  const applyCode = async (event: FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (!value) return;
    const message = await store.applyDiscount(value);
    setCodeError(message);
    if (!message) setCode("");
  };

  // Leaving a buy now checkout returns to the saved cart.
  const backToBag = () => {
    setStep("bag");
    if (buy) navigate("/bag");
  };

  const field = (key: keyof Details) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDetails((d) => ({ ...d, [key]: e.target.value }));

  const onDetails = (e: FormEvent) => {
    e.preventDefault();
    setStep("pay");
    window.scrollTo(0, 0);
  };

  // Creates the Razorpay order, takes the payment in Razorpay's modal, confirms it, then shows the confirmation page.
  const pay = async () => {
    if (!cart || paying || !canPay) return;
    setPaying(true);
    trackAddPaymentInfo(lines.map((line) => ({ item_id: line.handle, item_name: line.name, price: line.unitPrice, quantity: line.quantity })));
    setPayError(null);
    const contact = { name: details.name.trim(), phone: details.phone.trim(), email: details.email.trim() };
    try {
      const started = await startPayment({
        lines: lines.flatMap((line) => (line.variantId ? [{ variantId: line.variantId, quantity: line.quantity }] : [])),
        contact,
        address: { line: details.addr.trim(), city: details.city.trim(), state: details.state, pin: details.pin.trim() },
        discountCode: cart.discountCode,
      });
      const result = await openCheckout({
        keyId: started.keyId,
        orderId: started.razorpayOrderId,
        amountPaise: started.amountPaise,
        contact,
      });
      if (result.kind !== "paid") {
        setPayError(result.kind === "failed" ? result.message : "Payment was cancelled. Your bag is unchanged.");
        return;
      }

      // The money has moved, so the saved cart is spent. A buy now cart was never saved.
      if (!buy) await savedStore.clear();
      let outcome: ConfirmedPayment;
      try {
        outcome = await confirmPayment(result.response);
      } catch {
        outcome = { status: "pending", message: "Payment received. We’re confirming your order." };
      }
      try {
        sessionStorage.setItem(
          LAST_ORDER_KEY,
          JSON.stringify({
            status: outcome.status,
            orderName: outcome.status === "confirmed" ? outcome.orderName : null,
            message: outcome.status === "pending" ? outcome.message : null,
            paymentId: result.response.razorpay_payment_id,
            email: contact.email,
            amountPaise: started.amountPaise,
            discountPaise: started.breakdown.discountPaise,
            shippingPaise: started.breakdown.shippingPaise,
            lines: lines.map((line) => ({ handle: line.handle, name: line.name, quantity: line.quantity, unitPrice: line.unitPrice })),
          }),
        );
      } catch {
        // Storage blocked: the confirmation page still shows, without the order summary.
      }
      navigate("/bag/confirmed");
    } catch (error) {
      setPayError(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <SiteShell variant="solid">
      <section
        data-screen-label="Bag"
        className="mx-auto max-w-[1200px] px-[clamp(20px,3vw,40px)] pt-[clamp(36px,4vw,56px)] pb-[clamp(80px,10vw,120px)]"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <h1 className="m-0 text-[clamp(36px,3.6vw,52px)] leading-[1.04] font-normal tracking-[-0.025em]">{title}</h1>
          {lines.length > 0 && (
            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
              {STEPS.map((label, i) => {
                const current = STEP_INDEX[step] === i;
                const done = STEP_INDEX[step] > i;
                return (
                  <span
                    key={label}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-[7px] ${
                      current ? "bg-ink text-white" : done ? "bg-frost text-ink" : "text-ink"
                    }`}
                  >
                    <span className="opacity-70">0{i + 1}</span>
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-[14px] bg-frost px-4 py-3 text-sm text-ink">
            {error}
          </p>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-[18px] rounded-[28px] border border-line bg-white px-6 py-[clamp(56px,8vw,96px)] text-center">
            <span className="text-[28px] tracking-[-0.02em]">Your bag is empty.</span>
            <span className="text-base text-ink-body">Start with a single step, or take the whole ritual home.</span>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link to="/shop" className={`${PRIMARY} inline-flex items-center`}>
                Shop VYTAE
              </Link>
              <button
                type="button"
                onClick={() => void store.add("sleep-ritual", 1)}
                className="cursor-pointer rounded-full border border-ink bg-transparent px-[26px] py-3.5 text-[15px] font-semibold text-ink hover:bg-frost"
              >
                Add The Sleep Ritual
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-[clamp(24px,4vw,48px)]">
            <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-4">
              {step === "bag" && (
                <>
                  {lines.map((l) => (
                    <div
                      key={l.id}
                      className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-[18px] rounded-[22px] border border-line bg-white p-3.5 shadow-[0_24px_48px_-36px_rgba(27,54,93,0.3)]"
                    >
                      <Link to={`/products/${l.handle}`} className="relative block aspect-square overflow-hidden rounded-2xl bg-frost">
                        <img src={l.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      </Link>
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <Link to={`/products/${l.handle}`} className="text-xl tracking-[-0.01em] text-ink">
                          {l.name}
                        </Link>
                        <span className="text-[13px] text-ink-muted">{PACK[l.handle]}</span>
                        <div className="mt-1.5 flex items-center gap-3.5">
                          <div className="flex items-center rounded-full border border-line bg-white">
                            <button
                              type="button"
                              onClick={() => void store.setQuantity(l.id, Math.max(1, l.quantity - 1))}
                              aria-label="Decrease"
                              className="h-9 w-9 cursor-pointer border-0 bg-transparent text-base text-ink"
                            >
                              −
                            </button>
                            <span className="min-w-4 text-center text-sm font-semibold">{l.quantity}</span>
                            <button
                              type="button"
                              onClick={() => void store.setQuantity(l.id, l.quantity + 1)}
                              aria-label="Increase"
                              className="h-9 w-9 cursor-pointer border-0 bg-transparent text-base text-ink"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => void store.remove(l.id)}
                            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-ink-muted underline underline-offset-[3px]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <span className="self-start pt-1 text-base font-semibold tabular-nums">{inr(l.unitPrice * l.quantity)}</span>
                    </div>
                  ))}
                  {showUpsell && (
                    <button
                      type="button"
                      onClick={() => void swapToRitual()}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-[18px] border border-dashed border-line bg-transparent px-5 py-4 text-left text-sm text-ink"
                    >
                      <span>
                        <strong className="font-semibold">Complete the ritual:</strong> swap for The Sleep Ritual and save
                        [00]%
                      </span>
                      <span className="font-semibold">Swap →</span>
                    </button>
                  )}
                </>
              )}

              {step === "details" && (
                <form
                  onSubmit={onDetails}
                  className="flex flex-col gap-3.5 rounded-3xl border border-line bg-white p-[clamp(22px,3vw,32px)] shadow-[0_24px_48px_-36px_rgba(27,54,93,0.3)]"
                >
                  <span className="text-[22px] tracking-[-0.015em]">Delivery details</span>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
                    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                      Full name
                      <input required value={details.name} onChange={field("name")} placeholder="Your name" className={INPUT} />
                    </label>
                    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                      Phone
                      <input
                        required
                        type="tel"
                        inputMode="tel"
                        value={details.phone}
                        onChange={field("phone")}
                        placeholder="+91"
                        pattern="(\+91)?[6-9][0-9]{9}"
                        className={INPUT}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                    Email
                    <input required type="email" value={details.email} onChange={field("email")} placeholder="you@example.com" className={INPUT} />
                  </label>
                  <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                    Address
                    <input required value={details.addr} onChange={field("addr")} placeholder="House, street, area" className={INPUT} />
                  </label>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-3">
                    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                      City
                      <input required value={details.city} onChange={field("city")} className={INPUT} />
                    </label>
                    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                      State
                      <select required value={details.state} onChange={field("state")} className={INPUT}>
                        <option value="" disabled>
                          Choose state
                        </option>
                        {Object.entries(INDIAN_STATES).map(([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                      PIN code
                      <input required inputMode="numeric" pattern="[0-9]{6}" value={details.pin} onChange={field("pin")} className={INPUT} />
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1.5">
                    <button type="button" onClick={backToBag} className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-ink">
                      ← Back to bag
                    </button>
                    <button type="submit" className={PRIMARY}>
                      Continue to payment
                    </button>
                  </div>
                </form>
              )}

              {step === "pay" && (
                <div className="flex flex-col gap-3.5 rounded-3xl border border-line bg-white p-[clamp(22px,3vw,32px)] shadow-[0_24px_48px_-36px_rgba(27,54,93,0.3)]">
                  <span className="text-[22px] tracking-[-0.015em]">Payment</span>
                  <span className="text-sm text-ink-soft">
                    Delivering to {details.name}, {details.addr}, {details.city} {details.pin}
                  </span>
                  <div className="flex items-center justify-between gap-4 rounded-[18px] border-[1.5px] border-ink bg-[#f5f8fc] px-5 py-[18px]">
                    <span className="flex flex-col gap-1">
                      <span className="text-base font-semibold">Pay online</span>
                      <span className="text-sm text-ink-soft">UPI, cards, netbanking and wallets — secured by Razorpay.</span>
                    </span>
                    <span className="h-5 w-5 flex-none rounded-full border-[1.5px] border-ink bg-ink shadow-[inset_0_0_0_4px_#ffffff]" />
                  </div>
                  {!canPay && <p className="m-0 text-sm text-ink-soft">Online payment opens once the store is connected.</p>}
                  {payError && (
                    <p role="alert" className="m-0 rounded-[14px] bg-frost px-4 py-3 text-sm text-ink">
                      {payError}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-3 pt-1.5">
                    <button type="button" onClick={() => setStep("details")} className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-ink">
                      ← Edit details
                    </button>
                    <button
                      type="button"
                      disabled={!canPay || paying}
                      onClick={() => void pay()}
                      className={`${PRIMARY} ${!canPay || paying ? "opacity-50" : ""}`}
                    >
                      {paying ? "Opening payment…" : `Pay ${inr(total)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="sticky top-[84px] flex flex-1 basis-[300px] flex-col gap-3.5 rounded-3xl border border-line bg-cloud p-[clamp(22px,3vw,28px)]">
              <span className="text-lg font-semibold">Order summary</span>
              {step !== "bag" && (
                <div className="flex flex-col gap-2 border-b border-[rgba(27,54,93,0.12)] pb-3">
                  {lines.map((l) => (
                    <div key={l.id} className="flex justify-between gap-3 text-sm">
                      <span>
                        {l.name} × {l.quantity}
                      </span>
                      <span className="tabular-nums">{inr(l.unitPrice * l.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-ink-body">Subtotal</span>
                <span className="tabular-nums">{inr(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-body">Discount</span>
                  <span className="tabular-nums">−{inr(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-ink-body">Delivery</span>
                <span>{shipping ? inr(shipping) : "Free"}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-[rgba(27,54,93,0.12)] pt-3">
                <span className="text-base font-semibold">Total</span>
                <span className="text-2xl font-semibold tracking-[-0.01em] tabular-nums">{inr(total)}</span>
              </div>
              <span className="text-xs text-ink-muted">
                {shipping ? "Free delivery on orders over ₹999." : "You’ve unlocked free delivery."}
              </span>

              {cart.discountCode ? (
                <div className="flex items-center justify-between gap-3 rounded-[14px] bg-frost px-3.5 py-2.5 text-sm">
                  <span>
                    Code <span className="font-semibold">{cart.discountCode}</span> applied
                  </span>
                  <button
                    type="button"
                    onClick={() => void store.removeDiscount()}
                    className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-ink underline underline-offset-[3px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={applyCode} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setCodeError(null);
                      }}
                      placeholder="Discount code"
                      aria-label="Discount code"
                      className={`${INPUT} min-w-0 flex-1`}
                    />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-full border border-ink bg-white px-4 text-sm font-semibold whitespace-nowrap text-ink hover:bg-frost"
                    >
                      Apply
                    </button>
                  </div>
                  {codeError && <span className="text-[13px] font-semibold text-ink">{codeError}</span>}
                </form>
              )}

              {step === "bag" && (
                <button type="button" onClick={() => setStep("details")} className={PRIMARY}>
                  Checkout
                </button>
              )}
              <div className="flex flex-wrap gap-x-3.5 gap-y-2 text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Secure online payment
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Tracked delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Batch traceable
                </span>
              </div>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
