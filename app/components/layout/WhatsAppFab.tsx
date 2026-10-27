import { useLocation } from "react-router";
import { whatsappUrl } from "../../lib/whatsapp";
import { BRAND_PATHS } from "../ui/brand";
import { Fill } from "../ui/icons";

const FAB_CLASS =
  "fixed right-5 bottom-5 z-50 flex items-center rounded-full bg-[linear-gradient(180deg,#24497a_0%,#26497a_100%)] py-3 pr-[18px] pl-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_32px_-14px_rgba(30,62,106,0.6)] transition-colors duration-300 hover:bg-footer";

// Floating click-to-chat. Falls back to the contact page until VITE_WHATSAPP_NUMBER is set.
// On phones the checkout and product pages hide it, so it never covers form fields, pay buttons or buy rows.
export function WhatsAppFab() {
  const { pathname } = useLocation();
  const href = whatsappUrl("Hi VYTAE, I have a question.");
  const icon = <Fill size={20} d={BRAND_PATHS.whatsapp} />;
  const hideOnPhones = pathname === "/bag" || pathname.startsWith("/products/");
  const className = hideOnPhones ? `${FAB_CLASS} max-[759px]:hidden` : FAB_CLASS;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className={className}>
        {icon}
      </a>
    );
  }
  return (
    <a href="/contact#whatsapp" aria-label="Chat on WhatsApp" className={className}>
      {icon}
    </a>
  );
}
