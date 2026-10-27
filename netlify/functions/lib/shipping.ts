// Delivery is ₹79 under ₹999 and free from ₹999, judged after discounts. An empty order pays no delivery.
export const SHIPPING_FEE_PAISE = 7_900;
export const FREE_SHIPPING_FROM_PAISE = 99_900;

export function shippingPaise(discountedSubtotalPaise: number): number {
  if (discountedSubtotalPaise <= 0) return 0;
  return discountedSubtotalPaise < FREE_SHIPPING_FROM_PAISE ? SHIPPING_FEE_PAISE : 0;
}
