# Specification

## Summary
**Goal:** Update premium billing cadence messaging and access duration to “$5 every 9 weeks” across the app while keeping the price at 500 cents.

**Planned changes:**
- Update all frontend user-facing premium pricing copy to replace any “3 months” references with “$5 every 9 weeks” / “$5 / 9 weeks” where applicable (e.g., upsell banner, Report Cards upgrade screen).
- Update frontend checkout line-item metadata so the product description reflects “9 weeks access to report card features” (instead of “3 months”), while keeping the amount at $5 (500 cents).
- Update backend premium access duration so new premium grants/purchases expire 9 weeks after being granted; do not alter existing premium access records.
- Update any backend-provided premium price strings (e.g., preview/onboarding data) to say “$5 every 9 weeks” and remove “3 months” wording.

**User-visible outcome:** Users see Premium Report Cards priced at $5 billed every 9 weeks throughout the app and checkout, and newly purchased/granted premium access lasts 9 weeks.
