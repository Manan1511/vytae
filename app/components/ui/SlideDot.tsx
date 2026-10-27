// The visible dot is 6px, or 28px when active, centred in a 24px-tall button that is 24px wide (46px when active).
// Neighbouring buttons touch but do not overlap, so each touch target is at least 24px and the visible gap is 18px.
export function SlideDot({
  active,
  label,
  onClick,
  activeColor,
  idleColor,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  activeColor: string;
  idleColor: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-6 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-[width] duration-500"
      style={{ width: active ? 46 : 24 }}
    >
      <span
        className="h-1.5 rounded-full transition-[width,background-color] duration-500"
        style={{ width: active ? 28 : 6, background: active ? activeColor : idleColor }}
      />
    </button>
  );
}
