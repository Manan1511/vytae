import { useState } from "react";
import { SiteShell } from "../components/layout/SiteShell";
import { seoMeta } from "../lib/seo";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Reveal } from "../lib/motion";

export function meta() {
  return seoMeta({
    title: "Account | VYTAE",
    description: "Sign in to your VYTAE account.",
    path: "/account",
    noindex: true,
  });
}

const INPUT = "rounded-[14px] border border-line bg-mist px-3.5 py-3 text-[15px] text-ink outline-none";

// Sign-in is layout only until customer accounts are connected. The form does not submit anything yet.
export default function AccountPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const modes: { id: "in" | "up"; label: string }[] = [
    { id: "in", label: "Sign in" },
    { id: "up", label: "Create account" },
  ];

  return (
    <SiteShell variant="solid">
      <section
        data-screen-label="Sign in"
        className="mx-auto max-w-[1200px] px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,88px)] pb-[clamp(80px,10vw,120px)]"
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-center gap-[clamp(32px,5vw,72px)]">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow>Your account</Eyebrow>
            <Reveal as="h1" className="m-0 text-[clamp(40px,5vw,68px)] leading-none font-normal tracking-[-0.03em] text-balance">
              Welcome to your VYTAE ritual.
            </Reveal>
            <p className="m-0 max-w-[420px] text-[17px] leading-[1.6] text-pretty text-ink-body">
              Track orders, reorder in a tap, and keep every Batch Passport you’ve checked in one place.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-4 rounded-[28px] border border-line bg-white p-[clamp(24px,3vw,36px)] shadow-[0_1px_2px_rgba(27,54,93,0.05),0_32px_64px_-40px_rgba(27,54,93,0.35)]"
          >
            <div className="grid grid-cols-2 gap-1 rounded-full bg-frost p-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`cursor-pointer rounded-full border-0 px-2.5 py-2.5 text-sm font-semibold text-ink ${
                    mode === m.id ? "bg-white shadow-[0_2px_6px_rgba(27,54,93,0.15)]" : "bg-transparent"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {mode === "up" && (
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                Full name
                <input disabled placeholder="Your name" className={INPUT} />
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Email or phone
              <input disabled placeholder="you@example.com" className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Password
              <input disabled type="password" placeholder="••••••••" className={INPUT} />
            </label>
            <button
              type="submit"
              disabled
              className="cursor-not-allowed rounded-full border-0 bg-ink py-4 text-[15px] font-semibold text-white opacity-50"
            >
              {mode === "up" ? "Create account" : "Sign in"}
            </button>
            <span className="text-center text-xs text-ink-muted">
              Accounts are not available yet. By continuing you agree to our{" "}
              <a href="/policies/terms" className="underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/policies/privacy" className="underline">
                Privacy Policy
              </a>
              .
            </span>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
