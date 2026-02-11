import type { ShoppingItem } from '../backend';

// Single source of truth for Premium Report Card pricing
export const PREMIUM_PRICE_CENTS = 500n;
export const PREMIUM_PRICE_DISPLAY = '$5.00';
export const PREMIUM_CURRENCY = 'usd';
export const PREMIUM_PRODUCT_NAME = 'Premium Report Card Access';
export const PREMIUM_PRODUCT_DESCRIPTION = '9 weeks access to report card features';
export const PREMIUM_QUANTITY = 1n;
export const PREMIUM_DURATION_DISPLAY = '9 weeks';

/**
 * Creates the shopping items array for Premium Report Card checkout.
 * This ensures all checkout flows use the exact same pricing.
 */
export function createPremiumCheckoutItems(): ShoppingItem[] {
  return [
    {
      currency: PREMIUM_CURRENCY,
      productName: PREMIUM_PRODUCT_NAME,
      productDescription: PREMIUM_PRODUCT_DESCRIPTION,
      priceInCents: PREMIUM_PRICE_CENTS,
      quantity: PREMIUM_QUANTITY,
    },
  ];
}
