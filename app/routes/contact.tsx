import { useState } from "react";
import { SiteShell } from "../components/layout/SiteShell";
import { Eyebrow } from "../components/ui/Eyebrow";
import { BRAND_PATHS } from "../components/ui/brand";
import { Fill, Stroke } from "../components/ui/icons";
import { Reveal } from "../lib/motion";
import { whatsappUrl } from "../lib/whatsapp";

export function meta() {
  return [
    { title: "Contact | VYTAE" },
    { name: "description", content: "Questions about an order, a product or your Batch Passport." },
  ];
}

const TOPICS = ["Order", "Product", "Returns", "Partnerships", "Other"];
const INPUT =
  "rounded-[14px] border border-line bg-mist px-4 py-3.5 text-[15px] text-ink outline-none focus:border-ink";

// The enquiry form is frontend-only until the support inbox is connected. Nothing is sent yet.
export default function ContactPage() {
  const [topic, setTopic] = useState("Order");
  const [sent, setSent] = useState(false);
  const showOrder = topic === "Order" || topic === "Returns";
  const waHref = whatsappUrl("Hi VYTAE, I have a question.") ?? "#whatsapp";

  return (
    <SiteShell variant="solid" active="Contact">
      <section data-screen-label="Contact" className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pt-[clamp(56px,7vw,104px)] pb-[clamp(80px,10vw,128px)]">
        <div className="grid grid-cols-1 items-start gap-[clamp(40px,6vw,96px)] min-[960px]:grid-cols-2">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-[18px]">
              <Eyebrow>Contact</Eyebrow>
              <Reveal as="h1" className="m-0 text-[clamp(44px,5vw,76px)] leading-none font-normal tracking-[-0.03em]">
                We’re here to help.
              </Reveal>
              <p className="m-0 max-w-[440px] text-lg leading-[1.6] text-ink-body">
                Questions about an order, a product or your Batch Passport? Send us a note, or chat with us directly.
              </p>
            </div>

            <a
              id="whatsapp"
              href={waHref}
              target={waHref.startsWith("https") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-[22px] bg-[linear-gradient(160deg,#21406f_0%,#2a4c7c_45%,#3a6aa3_100%)] p-6 text-white hover:bg-ink"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full border border-white/30 bg-white/14">
                  <Fill size={24} d={BRAND_PATHS.whatsapp} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">Chat on WhatsApp</span>
                  <span className="text-sm text-white/80">Real people, quick answers.</span>
                </span>
              </span>
              <span className="text-2xl">→</span>
            </a>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-5 pt-2">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                  <Stroke size={15}>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </Stroke>
                  Email
                </span>
                <a href="mailto:hello@vytae.com" className="text-base">
                  [hello@vytae.com]
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                  <Stroke size={15}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </Stroke>
                  Response time
                </span>
                <span className="text-base">Within 1 business day</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                  <Stroke size={15}>
                    <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </Stroke>
                  Registered office
                </span>
                <span className="text-base leading-normal">[Company address]</span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-[clamp(24px,3vw,40px)] shadow-[0_1px_2px_rgba(27,54,93,0.05),0_32px_64px_-40px_rgba(27,54,93,0.35)]">
            {sent ? (
              <div className="flex flex-col items-start gap-4 py-10">
                <span className="text-[32px] tracking-[-0.02em]">Thank you — we’ve got it.</span>
                <span className="text-base leading-[1.6] text-ink-body">We’ll reply to your email within one business day.</span>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="cursor-pointer rounded-full border border-ink bg-white px-[22px] py-3 text-sm font-semibold text-ink hover:bg-frost"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="flex flex-col gap-[18px]"
              >
                <span className="text-2xl tracking-[-0.02em]">Send an enquiry</span>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3.5">
                  <label className="flex flex-col gap-2 text-[13px] font-semibold">
                    Name
                    <input required placeholder="Your name" className={INPUT} />
                  </label>
                  <label className="flex flex-col gap-2 text-[13px] font-semibold">
                    Phone
                    <input placeholder="+91" className={INPUT} />
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-[13px] font-semibold">
                  Email
                  <input type="email" required placeholder="you@example.com" className={INPUT} />
                </label>
                <div className="flex flex-col gap-2 text-[13px] font-semibold">
                  Topic
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((t) => {
                      const on = t === topic;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          className={`cursor-pointer rounded-full border px-4 py-2 text-[13px] font-semibold ${
                            on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {showOrder && (
                  <label className="flex flex-col gap-2 text-[13px] font-semibold">
                    Order number <span className="font-normal text-ink-muted">(optional)</span>
                    <input placeholder="#VY0000" className={INPUT} />
                  </label>
                )}
                <label className="flex flex-col gap-2 text-[13px] font-semibold">
                  Message
                  <textarea required rows={5} placeholder="How can we help?" className={`${INPUT} resize-y leading-normal`} />
                </label>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full border-0 bg-[linear-gradient(180deg,#24497a_0%,#26497a_100%)] py-4 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_24px_-14px_rgba(30,62,106,0.7)] hover:bg-ink-hover"
                >
                  Send enquiry
                </button>
                <span className="text-xs text-ink-muted">
                  By sending, you agree to our{" "}
                  <a href="/policies/privacy" className="underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
