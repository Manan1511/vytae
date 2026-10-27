export function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center gap-1.5 bg-frost px-4 py-[7px] text-center text-xs font-medium tracking-[0.02em] text-ink">
      <span>Get [10]% off your first order with code [WELCOME10].</span>
      <a href="/shop" className="font-semibold text-ink underline underline-offset-[3px]">
        Shop now →
      </a>
    </div>
  );
}
