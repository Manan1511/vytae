import { Link } from "react-router";
import { Reveal } from "../../lib/motion";
import { Eyebrow } from "../ui/Eyebrow";
import { Stroke } from "../ui/icons";

export function Passport() {
  return (
    <section id="passport" data-screen-label="Passport" className="mx-auto max-w-[1320px] px-[clamp(20px,3vw,40px)] pb-[clamp(80px,10vw,128px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-[clamp(28px,5vw,80px)] rounded-[28px] bg-[linear-gradient(160deg,#21406f_0%,#2a4c7c_45%,#3a6aa3_100%)] px-[clamp(28px,5vw,80px)] py-[clamp(36px,6vw,88px)] text-white">
        <div className="flex flex-col gap-[22px]">
          <Eyebrow tone="light">Batch Passport</Eyebrow>
          <Reveal as="h2" className="m-0 text-[clamp(48px,6vw,88px)] leading-[0.98] font-normal tracking-[-0.035em] text-balance text-white">
            Check your Batch Passport.
          </Reveal>
        </div>
        <div className="flex max-w-[480px] flex-col gap-[26px]">
          <Reveal as="p" className="m-0 text-[17px] leading-[1.6] text-[rgba(255,255,255,0.88)] text-pretty">
            Every VYTAE pack has its own Batch Passport — the full record of where its ingredients came from, how it was
            made and what the lab tests found. Enter the batch number printed on your pack to see it.
          </Reveal>
          <Reveal className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              to="/batch"
              className="inline-flex items-center gap-2 rounded-full bg-white px-[30px] py-4 text-[15px] font-semibold text-ink hover:bg-frost"
            >
              Verify your batch →
            </Link>
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[rgba(255,255,255,0.8)]">
              <Stroke size={18}>
                <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 9v6M11 9v6M14 9v6M17 9v6" />
              </Stroke>
              Batch number on every pack
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
