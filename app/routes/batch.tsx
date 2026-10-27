import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { SiteShell } from "../components/layout/SiteShell";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Stroke } from "../components/ui/icons";
import type { Batch, Check, Stat } from "../content/batches";
import { loadBatch } from "../lib/catalog";
import { seoMeta } from "../lib/seo";

const CHECK_FAILED = "We couldn’t check that batch just now. Try again in a moment.";

export function meta({ params }: { params?: { code?: string } }) {
  return seoMeta({
    title: "Batch Passport | VYTAE",
    description: "Check the Batch Passport for your VYTAE pack.",
    path: params?.code ? `/batch/${encodeURIComponent(params.code)}` : "/batch",
  });
}

const PRODUCT_NAMES: Record<string, string> = { "rest-well": "Rest Well", "night-reset": "Night Onset" };

const STAGES = [
  {
    n: "01",
    title: "Ingredient sourcing",
    desc: "We source the raw material ourselves, against purity specs that meet global standards — before any manufacturing begins.",
    result: "4 of 4 tests passed",
    icon: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l7-7",
  },
  {
    n: "02",
    title: "Manufacturing",
    desc: "Made at a certified facility under continuous in-process quality control.",
    result: "4 certifications held",
    icon: "M3 20V10l5 3v-3l5 3V6h4l1 14zM2 20h20",
  },
  {
    n: "03",
    title: "Finished product testing",
    desc: "An independent, NABL-accredited lab tests the finished batch before it’s released for sale.",
    result: "5 of 5 tests passed",
    icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9",
  },
];

const PASS_PILL =
  "inline-flex items-center gap-1.5 rounded-full bg-[#22c55e] py-1.5 pr-3.5 pl-[7px] text-[13px] font-bold text-white";
const CHECK_DOT =
  "flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#16a34a]";
const INPUT =
  "h-[54px] w-full min-w-0 rounded-xl border border-[#9fb3cc] bg-white px-4 font-medium text-[#1b3a66] outline-none focus:border-ink focus:shadow-[0_0_0_3px_rgba(27,54,93,0.15)]";

type View = "enter" | "checking" | "passport";

export default function BatchPage() {
  const { code: routeCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("enter");
  const [product, setProduct] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [progress, setProgress] = useState(0);
  const [batch, setBatch] = useState<Batch | null>(null);

  const open = async (rawCode: string, rawProduct: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!rawProduct) return setError("Please choose your product first.");
    if (!code) return setError("Please enter the batch number printed on your pack.");
    let record: Batch | null;
    try {
      record = await loadBatch(code);
    } catch {
      return setError(CHECK_FAILED);
    }
    if (!record) return setError(`We couldn’t find that ${PRODUCT_NAMES[rawProduct]} batch. Check the number on your pack.`);
    if (record.key !== rawProduct)
      return setError(`That batch number belongs to ${record.product}, not ${PRODUCT_NAMES[rawProduct]}. Check the product you selected.`);
    setError("");
    setBatch(record);
    setBatchCode(code);
    setProgress(0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setView(reduce ? "passport" : "checking");
  };

  // A batch in the URL opens straight away. The product is inferred from the batch when it isn't given.
  useEffect(() => {
    const code = (routeCode ?? searchParams.get("batch") ?? "").trim().toUpperCase();
    setInput(code);
    if (!code) return;
    loadBatch(code)
      .then((record) => {
        const prod = searchParams.get("product") ?? record?.key ?? "";
        setProduct(prod);
        open(code, prod);
      })
      .catch(() => setError(CHECK_FAILED));
  }, []);

  // Checking animation: three checkpoints tick over, then the passport opens.
  useEffect(() => {
    if (view !== "checking") return;
    const timers = [1, 2, 3].map((i) => window.setTimeout(() => setProgress(i), i * 650));
    timers.push(
      window.setTimeout(() => {
        setView("passport");
        window.scrollTo(0, 0);
      }, 2500),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [view]);

  const restart = () => {
    setView("enter");
    setBatchCode("");
    setInput("");
    setError("");
    window.scrollTo(0, 0);
  };

  return (
    <SiteShell variant="solid">
      {view === "enter" && (
        <>
          <section data-screen-label="Enter batch" className="px-3 pt-3">
            <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#21406f_0%,#2a4c7c_45%,#3a6aa3_100%)] px-[clamp(22px,5vw,64px)] py-[clamp(40px,5.5vw,76px)] text-white">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-[clamp(24px,4vw,56px)]">
                <div className="flex flex-col gap-5">
                  <span className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] text-[rgba(255,255,255,0.92)] uppercase">
                    <span className="h-[7px] w-[7px] rounded-full bg-[#8fd4b0]" />
                    Check your VYTAE batch
                  </span>
                  <h1 className="m-0 text-[clamp(40px,5vw,68px)] leading-none font-normal tracking-[-0.03em] text-balance">
                    No batch flies to you without one.
                  </h1>
                  <p className="m-0 max-w-[520px] text-[17px] leading-[1.6] text-[rgba(255,255,255,0.9)]">
                    Every bottle carries a Batch Passport — what it went through, across three independent checkpoints.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    open(input, product);
                  }}
                  className="flex flex-col gap-3.5 rounded-[22px] bg-white p-[clamp(22px,2.8vw,32px)] text-ink shadow-[0_30px_60px_-30px_rgba(28,56,96,0.5)]"
                >
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
                    <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#1b3a66]">
                      Product
                      <select
                        value={product}
                        onChange={(e) => {
                          setProduct(e.target.value);
                          setError("");
                        }}
                        className="h-[54px] w-full cursor-pointer appearance-none rounded-xl border border-[#9fb3cc] bg-white px-4 font-medium text-[#1b3a66] outline-none focus:border-ink"
                      >
                        <option value="">Select product</option>
                        <option value="night-reset">Night Onset</option>
                        <option value="rest-well">Rest Well</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#1b3a66]">
                      Batch number
                      <input
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setError("");
                        }}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="e.g. MBGNL102606A"
                        className={`${INPUT} uppercase tracking-[0.04em]`}
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="mt-1.5 h-[54px] cursor-pointer rounded-[14px] border-0 bg-[linear-gradient(180deg,#24497a_0%,#26497a_100%)] text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_24px_-14px_rgba(30,62,106,0.7)] hover:bg-ink-hover"
                  >
                    Open passport →
                  </button>
                  {error && (
                    <span className="rounded-xl bg-frost px-3.5 py-2.5 text-sm leading-normal text-ink">
                      {error}{" "}
                      <Link to="/contact#whatsapp" className="font-semibold underline">
                        Need help?
                      </Link>
                    </span>
                  )}
                  <div className="flex flex-wrap justify-between gap-2 text-[13px] text-[#4a6488]">
                    <span>Printed on your pack — or scan the QR to fill both in.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProduct("rest-well");
                        setInput("MBGNL102606A");
                        setError("");
                      }}
                      className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-ink underline underline-offset-[3px]"
                    >
                      Try MBGNL102606A
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>

          <section data-screen-label="What is it" className="mx-auto max-w-[1120px] px-5 pt-[clamp(48px,6vw,80px)] pb-[clamp(64px,8vw,104px)]">
            <h2 className="m-0 mb-7 max-w-[620px] text-[clamp(28px,3vw,40px)] leading-[1.1] font-normal tracking-[-0.025em] text-balance">
              Three checkpoints stand between a raw ingredient and your bottle.
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3.5">
              {STAGES.map((s) => (
                <div key={s.n} className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-6 shadow-[0_24px_48px_-36px_rgba(27,54,93,0.35)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-frost">
                    <Stroke size={22} strokeWidth={1.7}>
                      <path d={s.icon} />
                    </Stroke>
                  </span>
                  <span className="text-xl tracking-[-0.01em]">{s.title}</span>
                  <span className="text-[15px] leading-[1.55] text-[#4a6488]">{s.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === "checking" && (
        <section data-screen-label="Checking" className="flex min-h-[70vh] items-center justify-center px-5 py-10">
          <div className="flex w-full max-w-[440px] flex-col gap-7">
            <div className="flex flex-col gap-2 text-center">
              <span className="text-xs font-semibold tracking-[0.14em] text-[#4f6b8f] uppercase">Opening passport</span>
              <span className="text-[28px] font-semibold tracking-[0.08em]">{batchCode}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-frost">
              <div
                className="h-full rounded-full bg-[#16a34a] transition-[width] duration-700 ease-soft"
                style={{ width: `${Math.round((progress / 3) * 100)}%` }}
              />
            </div>
            <div className="flex flex-col gap-2.5">
              {STAGES.map((s, i) => {
                const done = progress > i;
                return (
                  <div
                    key={s.n}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4.5 py-4 shadow-[0_18px_36px_-30px_rgba(27,54,93,0.4)] transition-opacity duration-500"
                    style={{ opacity: progress >= i ? 1 : 0.4 }}
                  >
                    <span className="flex items-center gap-3 text-[15px] font-medium">
                      <span className="text-[#4f6b8f] tabular-nums">{s.n}</span>
                      {s.title}
                    </span>
                    <span
                      className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] font-bold text-white transition-colors duration-400 ${
                        done ? "bg-[#16a34a]" : "bg-line"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {view === "passport" && batch && (
        <PassportView
          batch={batch}
          onBack={() => (window.history.length > 1 ? navigate(-1) : restart())}
          onRestart={restart}
        />
      )}
    </SiteShell>
  );
}

function PassportView({ batch, onBack, onRestart }: { batch: Batch; onBack: () => void; onRestart: () => void }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setAnimated(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <section data-screen-label="Passport hero" className="px-3">
        <div className="relative mx-auto mt-3 grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(40px,5vw,72px)] overflow-hidden rounded-[32px] border border-[#d3deec] bg-[#e9eff7] px-[clamp(22px,5vw,72px)] pt-[clamp(28px,4vw,48px)] pb-[clamp(48px,6vw,80px)] text-ink">
          <div className="flex flex-col gap-[22px]">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-line bg-white py-[7px] pr-3.5 pl-2.5 text-[13px] font-semibold text-ink hover:bg-frost"
            >
              <Stroke size={14} strokeWidth={2}>
                <path d="M15 18l-6-6 6-6" />
              </Stroke>
              Back
            </button>
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#22c55e] py-[7px] pr-3.5 pl-[7px] text-[13px] font-bold whitespace-nowrap text-white shadow-[0_0_0_4px_rgba(34,197,94,0.28)]">
              <span className={CHECK_DOT}>✓</span>
              Passport verified for this batch
            </span>
            <h1 className="m-0 text-[clamp(48px,6vw,92px)] leading-[0.96] font-normal tracking-[-0.035em] text-balance">
              No batch flies to you without one.
            </h1>
            <p className="m-0 max-w-[460px] text-[clamp(17px,1.3vw,19px)] leading-[1.55] text-pretty text-[#3d5a80]">
              Every bottle of Vytae carries a Batch Passport — the full record of what your supplement went through before it
              reached you, across three independent checkpoints.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href="#record" className="rounded-full bg-ink px-7 py-4 text-[15px] font-semibold whitespace-nowrap text-white hover:bg-[#24456d]">
                See this batch’s record ↓
              </a>
              <a href="#record" className="rounded-full border border-ink px-6 py-[15px] text-[15px] font-semibold whitespace-nowrap text-ink hover:bg-frost">
                What is a Batch Passport?
              </a>
            </div>
          </div>

          <div
            className="relative rounded-[26px] border border-ink bg-white text-ink shadow-[0_40px_80px_-50px_rgba(24,48,84,0.35)] transition-[transform,opacity] duration-1000 ease-soft"
            style={{ transform: animated ? "none" : "translateY(24px) rotate(-1.5deg)", opacity: animated ? 1 : 0 }}
          >
            <div className="flex flex-col gap-[22px] px-[26px] pt-6 pb-[26px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.34em] text-[#4f6b8f]">BATCH PASSPORT</span>
                <span className="text-xs font-bold tracking-[0.32em]">VYTAE</span>
              </div>
              <div className="flex flex-col gap-1.5 pr-[120px]">
                <span className="text-[clamp(38px,4.4vw,52px)] leading-none tracking-[-0.03em]">{batch.product}</span>
                <span className="text-sm text-[#4a6488]">{batch.sub}</span>
              </div>
              <div
                aria-hidden="true"
                className="absolute top-[52px] right-[22px] flex h-28 w-28 flex-col items-center justify-center gap-0.5 rounded-full border-[2.5px] border-[#16a34a] bg-[rgba(220,252,231,0.8)] text-[#15913f] shadow-[inset_0_0_0_4px_#ffffff,inset_0_0_0_5.5px_#16a34a] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.3,1.6,.5,1)] delay-[600ms]"
                style={{
                  transform: animated ? "rotate(-12deg) scale(1)" : "rotate(-12deg) scale(1.6)",
                  opacity: animated ? 1 : 0,
                }}
              >
                <span className="text-[9px] font-bold tracking-[0.2em]">3 OF 3</span>
                <span className="text-base font-bold">CLEARED</span>
              </div>
              <div aria-hidden="true" className="border-t-[1.5px] border-dashed border-line" />
              <div className="grid grid-cols-2 gap-x-[18px] gap-y-5">
                {batch.fields.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-[0.18em] text-[#4f6b8f]">{k}</span>
                    <span className="text-lg font-semibold tracking-[0.02em] tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#bbf7d0] bg-[#dcfce7] px-[26px] py-3.5 text-[13px] leading-[1.45] font-medium text-[#166534]">
              Matched to the batch number on your pack — this record is specific to this batch.
            </div>
          </div>
        </div>
      </section>

      <section id="record" data-screen-label="At a glance" className="mx-auto max-w-[1320px] scroll-mt-6 px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,80px)] pb-[clamp(40px,5vw,64px)]">
        <div className="mb-[clamp(16px,3vw,40px)] flex flex-col items-center gap-[18px] text-center">
          <Eyebrow centered>The Batch Passport</Eyebrow>
          <h2 className="m-0 max-w-[900px] text-[clamp(40px,5.4vw,80px)] leading-none font-normal tracking-[-0.03em] text-balance">
            Three checkpoints stand between a raw ingredient and your bottle.
          </h2>
          <p className="m-0 max-w-[560px] text-lg leading-[1.6] text-pretty text-[#3d5a80]">
            We designed the Batch Passport so nothing about your supplement has to be taken on faith. Below is exactly what
            this batch cleared — not marketing language, the actual record.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6">
          {STAGES.map((s, i) => (
            <a
              key={s.n}
              href={`#stage-${i + 1}`}
              className="flex flex-col items-center gap-4 rounded-[22px] border border-ink bg-white px-8 py-10 text-center text-ink transition-colors hover:bg-[#f4f7fb]"
            >
              <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-frost">
                <Stroke size={30} strokeWidth={1.4}>
                  <path d={s.icon} />
                </Stroke>
                <span className="absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#16a34a] text-xs font-bold text-white shadow-[0_0_0_3px_#f6f9fd]">
                  ✓
                </span>
              </span>
              <span className="text-[13px] font-semibold tracking-[0.1em] text-[#4f6b8f] tabular-nums">CHECKPOINT {s.n}</span>
              <span className="text-[clamp(24px,2.2vw,30px)] leading-[1.1] font-medium tracking-[-0.02em]">{s.title}</span>
              <span className="max-w-[320px] text-base leading-[1.6] text-pretty text-[#4a6488]">{s.desc}</span>
              <span className={`${PASS_PILL} mt-1`}>
                <span className={CHECK_DOT}>✓</span>
                {s.result}
              </span>
            </a>
          ))}
        </div>
      </section>

      <Stage index={0}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,5vw,96px)]">
          <div className="flex flex-col gap-[18px]">
            <h2 className="m-0 text-[clamp(38px,4.6vw,64px)] leading-none font-normal tracking-[-0.03em] text-balance">
              We source it ourselves.
            </h2>
            <p className="m-0 max-w-[520px] text-[17px] leading-[1.6] text-pretty text-[#3d5a80]">
              Most supplement brands in India leave ingredient sourcing to their contract manufacturer. Vytae doesn’t. We
              source every raw ingredient ourselves, and hold it to purity specifications that meet the best global standards —
              before a single capsule is made.
            </p>
          </div>
          <div className="flex flex-col gap-[22px] rounded-[22px] border border-line bg-white p-[clamp(24px,2.8vw,36px)]">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-frost text-[13px] font-bold tracking-[0.04em]">
                Mg
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[19px] font-medium tracking-[-0.01em]">Magnesium Bisglycinate</span>
                <span className="text-[13px] text-[#4f6b8f]">Fully reacted chelate · RM ID {batch.rmid}</span>
              </span>
            </div>
            <p className="m-0 text-[15px] leading-[1.6] text-pretty text-[#3d5a80]">
              Sourced independently, not left to the manufacturer — qualified and tested by Vytae against the specification below.
            </p>
            <Stats stats={batch.stage1.stats} />
          </div>
        </div>
        <TestRecord
          title="Test record"
          passed={`${batch.stage1.rows.length} of ${batch.stage1.rows.length} passed`}
          columns={["Parameter", "Vytae standard", "This batch"]}
          rows={batch.stage1.rows}
          evidence="Batch-specific ingredient CoA (PDF)"
        />
      </Stage>

      <Handover from="Sourcing" to="Manufacturing" />

      <Stage index={1}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,5vw,96px)]">
          <div className="flex flex-col gap-[18px]">
            <h2 className="m-0 text-[clamp(38px,4.6vw,64px)] leading-none font-normal tracking-[-0.03em] text-balance">
              Made under continuous quality control.
            </h2>
            <p className="m-0 max-w-[520px] text-[17px] leading-[1.6] text-pretty text-[#3d5a80]">
              Once sourced, the ingredient moves to manufacturing — the process is audited, documented and certified at every stage.
            </p>
          </div>
          <div className="flex flex-col gap-[22px] rounded-[22px] border border-line bg-white p-[clamp(24px,2.8vw,36px)]">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-frost text-[13px] font-bold tracking-[0.04em]">
                WB
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[19px] font-medium tracking-[-0.01em]">WBCIL</span>
                <span className="text-[13px] text-[#4f6b8f]">Contract manufacturing partner · magnesium bisglycinate</span>
              </span>
            </div>
            <p className="m-0 text-[15px] leading-[1.6] text-pretty text-[#3d5a80]">
              This batch was manufactured in a world-class facility built for pharmaceutical-grade precision, with tight
              in-process quality control from blending through to encapsulation.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,110px),1fr))] gap-x-4 gap-y-6 border-t border-[#d3deec] pt-6">
              {batch.certs.map((c) => (
                <div key={c.k} className="flex flex-col items-start gap-3">
                  <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border-[1.5px] border-ink bg-white text-sm font-bold shadow-[inset_0_0_0_4px_#ffffff,inset_0_0_0_5px_#cddbeb]">
                    {c.k}
                    <span className="absolute -right-[3px] -bottom-[3px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#16a34a] text-[11px] font-bold text-white shadow-[0_0_0_3px_#ffffff]">
                      ✓
                    </span>
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{c.t}</span>
                    <span className="text-[13px] leading-[1.4] text-[#4a6488]">{c.d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Stage>

      <Handover from="Manufacturing" to="Independent testing" />

      <Stage index={2}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,5vw,96px)]">
          <div className="flex flex-col gap-[18px]">
            <h2 className="m-0 text-[clamp(38px,4.6vw,64px)] leading-none font-normal tracking-[-0.03em] text-balance">
              Tested independently, before release.
            </h2>
            <p className="m-0 max-w-[520px] text-[17px] leading-[1.6] text-pretty text-[#3d5a80]">
              Before release, the finished batch — capsule, not just raw material — goes to an independent, NABL-accredited
              third-party lab. Nothing ships without clearing this stage.
            </p>
          </div>
          <div className="flex flex-col gap-[22px] rounded-[22px] border border-line bg-white p-[clamp(24px,2.8vw,36px)]">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-frost text-[13px] font-bold tracking-[0.04em]">
                AR
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[19px] font-medium tracking-[-0.01em]">Auriga Research</span>
                <span className="text-[13px] text-[#4f6b8f]">NABL-accredited independent laboratory</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#15803d]">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#16a34a] text-[10px] text-white">✓</span>
              Third-party · not manufacturer-affiliated
            </span>
            <Stats stats={batch.stage3.stats} />
          </div>
        </div>
        <TestRecord
          title="Test record"
          passed={`${batch.stage3.rows.length} of ${batch.stage3.rows.length} passed`}
          columns={["Parameter", "Vytae standard", "Third-party result"]}
          rows={batch.stage3.rows}
          evidence="Third-party lab report (PDF)"
        />
      </Stage>

      <section data-screen-label="Close" className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pt-[clamp(48px,6vw,80px)] pb-[clamp(64px,8vw,112px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(40px,6vw,96px)] border-t border-[#dfe7f1] pt-[clamp(48px,6vw,80px)]">
          <div className="flex flex-col gap-[22px] text-ink">
            <span className="text-xs font-semibold tracking-[0.14em] text-[#4f6b8f] uppercase">The Vytae promise</span>
            <h2 className="m-0 text-[clamp(40px,5vw,72px)] leading-none font-normal tracking-[-0.03em] text-balance">
              This batch earned its passport. <span className="text-[#16a34a]">Every batch has to.</span>
            </h2>
            <p className="m-0 max-w-[480px] text-lg leading-[1.6] text-pretty text-[#3d5a80]">
              If a batch doesn’t clear all three stages, it doesn’t get a passport — and it doesn’t reach a shelf. That’s the
              only promise we’re interested in making.
            </p>
            <div className="flex flex-wrap gap-3 pt-1.5">
              <Link to="/products/rest-well" className="rounded-full bg-ink px-7 py-4 text-[15px] font-semibold text-white hover:bg-[#24456d]">
                Shop {batch.product} →
              </Link>
              <button
                type="button"
                onClick={onRestart}
                className="cursor-pointer rounded-full border border-ink bg-transparent px-6 py-[15px] text-[15px] font-semibold text-ink hover:bg-frost"
              >
                Check another batch
              </button>
            </div>
          </div>
          <div className="flex flex-col rounded-[28px] border border-ink bg-white p-[clamp(28px,3.4vw,44px)] text-ink shadow-[0_40px_80px_-60px_rgba(24,48,84,0.35)]">
            <div className="flex items-center justify-between pb-6">
              <span className="text-[11px] font-bold tracking-[0.3em] text-[#4f6b8f]">BATCH {batch.fields[0][1]}</span>
              <span className="text-xs font-bold tracking-[0.32em]">VYTAE</span>
            </div>
            {STAGES.map((s) => (
              <div key={s.n} className="grid grid-cols-[44px_minmax(0,1fr)] gap-[18px]">
                <div className="flex flex-col items-center">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#22c55e] text-lg font-bold text-white shadow-[0_0_0_5px_#dcfce7]">
                    ✓
                  </span>
                  <span className="w-0.5 flex-1 min-h-7 bg-[#22c55e]" />
                </div>
                <div className="flex flex-col gap-1 pt-2 pb-7">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#4f6b8f]">STAGE {s.n}</span>
                  <span className="text-[clamp(20px,1.8vw,24px)] font-medium tracking-[-0.01em]">{s.title}</span>
                  <span className="text-sm font-semibold text-[#15803d]">{s.result}</span>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-[18px]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
                <Stroke size={20} strokeWidth={1.8}>
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </Stroke>
              </span>
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-[clamp(20px,1.8vw,24px)] font-semibold tracking-[-0.01em]">Passport issued</span>
                <span className="text-[13px] font-bold tracking-[0.14em] text-[#4f6b8f]">JUN 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stage({ index, children }: { index: number; children: ReactNode }) {
  const s = STAGES[index];
  return (
    <section id={`stage-${index + 1}`} data-screen-label={`Stage ${s.n}`} className="scroll-mt-6">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)]">
        <div className="overflow-hidden rounded-[28px] border border-line bg-[#f5f8fc]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-[clamp(20px,3vw,32px)] py-4">
            <span className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white">
                {s.n}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-bold tracking-[0.14em] text-[#4a6488] uppercase">Stage {s.n} of 03</span>
                <span className="text-lg font-semibold text-[#1b3a66]">{s.title}</span>
              </span>
            </span>
            <span aria-label={`Stage ${index + 1} of 3`} className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`h-[5px] w-7 rounded-full ${i <= index ? "bg-ink" : "bg-line"}`} />
              ))}
            </span>
          </div>
          <div className="p-[clamp(24px,4vw,56px)]">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Stats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,130px),1fr))] gap-5 border-t border-[#dfe7f1] pt-6">
      {stats.map((k) => (
        <div key={k.l} className="flex flex-col gap-1.5">
          <span className={`text-[clamp(32px,3.2vw,44px)] leading-none tracking-[-0.03em] tabular-nums ${k.green ? "text-[#16a34a]" : "text-ink"}`}>
            {k.v}
          </span>
          <span className="text-sm leading-[1.4] text-[#4a6488]">{k.l}</span>
        </div>
      ))}
    </div>
  );
}

function TestRecord({
  title,
  passed,
  columns,
  rows,
  evidence,
}: {
  title: string;
  passed: string;
  columns: [string, string, string];
  rows: Check[];
  evidence: string;
}) {
  return (
    <div className="mt-10 overflow-hidden rounded-[22px] border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[linear-gradient(90deg,#f2f6fb_0%,#ffffff_100%)] px-[clamp(18px,2.4vw,32px)] py-[18px]">
        <span className="text-[13px] font-bold tracking-[0.12em] uppercase">{title}</span>
        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[#15803d]">
          <span className={CHECK_DOT.replace("bg-white text-[#16a34a]", "bg-[#16a34a] text-white")}>✓</span>
          {passed}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-y border-[#e7edf5] px-[clamp(18px,2.4vw,32px)] py-3 text-xs font-bold tracking-[0.12em] text-[#4f6b8f] uppercase">
        <span className="flex flex-wrap gap-x-6 gap-y-1">
          <span className="flex-[1_1_140px]">{columns[0]}</span>
          <span className="flex-[2_1_220px]">{columns[1]}</span>
          <span className="flex-[1_1_150px]">{columns[2]}</span>
        </span>
        <span className="w-[76px] text-right">Result</span>
      </div>
      {rows.map((r) => (
        <div key={r.p} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[#eef2f7] px-[clamp(18px,2.4vw,32px)] py-5">
          <span className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5">
            <span className="flex-[1_1_140px] text-base font-semibold">{r.p}</span>
            <span className="flex-[2_1_220px] text-[15px] leading-normal text-[#4a6488]">{r.s}</span>
            <span className="flex-[1_1_150px] text-[15px] leading-[1.45] font-semibold">{r.v}</span>
          </span>
          <span className="flex w-[76px] justify-end">
            <span className={`${PASS_PILL} py-[5px] pr-[11px] pl-1.5 text-xs`}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#16a34a]">✓</span>
              Pass
            </span>
          </span>
        </div>
      ))}
      <a href="#" className="flex flex-wrap items-center justify-between gap-2 bg-[#fbfcfe] px-[clamp(18px,2.4vw,32px)] py-[18px] text-ink hover:bg-[#f2f6fb]">
        <span className="text-xs font-bold tracking-[0.12em] text-[#4f6b8f] uppercase">Evidence on file</span>
        <span className="inline-flex items-center gap-2.5 text-[15px] font-semibold">
          <Stroke size={18} strokeWidth={1.7}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 11v6M9 14l3 3 3-3" />
          </Stroke>
          {evidence} ↓
        </span>
      </a>
    </div>
  );
}

function Handover({ from, to }: { from: string; to: string }) {
  return (
    <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)] items-center gap-3 px-3">
      <span />
      <span className="h-9 w-px justify-self-center bg-[#cddbeb]" />
      <span />
      <span className="justify-self-end text-[11px] font-bold tracking-[0.16em] whitespace-nowrap text-[#6d87a8] uppercase">Handover</span>
      <span className="z-[1] flex h-3.5 w-3.5 items-center justify-center justify-self-center rounded-full border border-[#16a34a] bg-white">
        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 text-[13px] leading-[1.35] text-ink">
        <span>
          {from} <span className="text-[#9fb3cc]">→</span> {to}
        </span>
        <span className="text-xs text-[#6d87a8]">Cleared [DD MMM YYYY]</span>
      </span>
    </div>
  );
}
