// Money is kept in whole paise. Shopify sends rupee strings such as "1099.00", and Razorpay takes paise.
const AMOUNT = /^(\d+)(?:\.(\d{1,2}))?$/;

export function toPaise(amount: string | number): number {
  const text = typeof amount === "number" ? amount.toFixed(2) : amount.trim();
  const match = AMOUNT.exec(text);
  if (!match) throw new Error(`Not a valid amount: ${amount}`);
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

// Rupee string for Shopify money fields. It is built from paise, so no float rounding creeps in.
export function toRupeeString(paise: number): string {
  if (!Number.isSafeInteger(paise) || paise < 0) throw new Error(`Not a valid paise amount: ${paise}`);
  return `${Math.floor(paise / 100)}.${String(paise % 100).padStart(2, "0")}`;
}
