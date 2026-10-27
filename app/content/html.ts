// Escapes text before it goes into the HTML bodies that the seed writes to Shopify and the fallback renders.
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
