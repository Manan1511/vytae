// WhatsApp click-to-chat. Number comes from VITE_WHATSAPP_NUMBER (country code + number, no plus sign).
const NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

export function whatsappUrl(message: string): string | null {
  if (!NUMBER) return null;
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(message)}`;
}
