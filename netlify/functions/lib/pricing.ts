import { HttpError } from "./http.ts";
import { toPaise } from "./money.ts";
import { storefrontPrivateQuery } from "./shopify.ts";

export type PricedLine = { variantId: string; title: string; quantity: number; unitPaise: number };

export type PricedCart = {
  lines: PricedLine[];
  subtotalPaise: number;
  discountPaise: number;
  discountedPaise: number; // after discounts, before delivery
  discountCode: string | null;
};

// quantityAvailable needs an inventory scope this token does not have. Shopify caps a line at the stock it holds,
// so the quantity that comes back is the stock check.
const CART_CREATE = `mutation PriceCart($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      cost { subtotalAmount { amount } totalAmount { amount } }
      discountCodes { code applicable }
      lines(first: 20) {
        nodes {
          quantity
          merchandise {
            ... on ProductVariant {
              id
              price { amount }
              availableForSale
              product { title }
            }
          }
        }
      }
    }
    userErrors { message }
  }
}`;

type CartResponse = {
  cartCreate: {
    cart: {
      cost: { subtotalAmount: { amount: string }; totalAmount: { amount: string } };
      discountCodes: { code: string; applicable: boolean }[];
      lines: {
        nodes: {
          quantity: number;
          merchandise: {
            id: string;
            price: { amount: string };
            availableForSale: boolean;
            product: { title: string };
          };
        }[];
      };
    } | null;
    userErrors: { message: string }[];
  };
};

const UNAVAILABLE = "Something in your bag is no longer available. Refresh and try again.";

// Prices the bag on Shopify's side, so no price is taken from the browser. A throwaway cart checks stock and the
// discount code. Every requested variant must come back at the requested quantity, or the bag is refused.
export async function priceCart(input: {
  lines: { variantId: string; quantity: number }[];
  discountCode: string | null;
}): Promise<PricedCart> {
  const requested = new Map<string, number>();
  for (const line of input.lines) requested.set(line.variantId, (requested.get(line.variantId) ?? 0) + line.quantity);

  const data = await storefrontPrivateQuery<CartResponse>(CART_CREATE, {
    input: {
      lines: [...requested].map(([merchandiseId, quantity]) => ({ merchandiseId, quantity })),
      discountCodes: input.discountCode ? [input.discountCode] : [],
    },
  });
  const { cart, userErrors } = data.cartCreate;
  if (!cart || userErrors.length > 0) throw new HttpError(409, UNAVAILABLE);

  const lines = cart.lines.nodes.map((node) => {
    const variant = node.merchandise;
    if (!variant.availableForSale) throw new HttpError(409, `${variant.product.title} is not available right now.`);
    return {
      variantId: variant.id,
      title: variant.product.title,
      quantity: node.quantity,
      unitPaise: toPaise(variant.price.amount),
    };
  });

  for (const [variantId, quantity] of requested) {
    const line = lines.find((item) => item.variantId === variantId);
    if (line && line.quantity === quantity) continue;
    const title = line?.title ?? "An item";
    if (line && line.quantity > 0) throw new HttpError(409, `Only ${line.quantity} left of ${title}.`);
    throw new HttpError(409, `${title} is sold out right now.`);
  }

  let discountCode: string | null = null;
  if (input.discountCode) {
    const wanted = input.discountCode.toUpperCase();
    const applied = cart.discountCodes.find((code) => code.applicable && code.code.toUpperCase() === wanted);
    if (!applied) throw new HttpError(400, "That code isn’t valid for this order.");
    discountCode = applied.code;
  }

  const subtotalPaise = toPaise(cart.cost.subtotalAmount.amount);
  const discountedPaise = toPaise(cart.cost.totalAmount.amount);
  return {
    lines,
    subtotalPaise,
    discountPaise: Math.max(0, subtotalPaise - discountedPaise),
    discountedPaise,
    discountCode,
  };
}
