# Specification

## Summary
**Goal:** Set Premium Report Card Access pricing to exactly $5.00 USD across Stripe checkout, backend validation, and UI display.

**Planned changes:**
- Update the frontend Premium upgrade checkout-session creation to send a single line item with priceInCents = 500 (USD) and quantity = 1.
- Add backend validation to enforce Premium Report Card Access checkout sessions only allow priceInCents = 500, rejecting any other amount with a clear error.
- Update any user-facing Premium price text to display “$5.00” (two decimal places) wherever shown.

**User-visible outcome:** Users see Premium Report Cards priced as “$5.00”, and the checkout flow reliably charges $5.00 with attempts to charge a different amount being rejected.
