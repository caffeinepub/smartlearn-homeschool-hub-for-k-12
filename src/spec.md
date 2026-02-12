# Specification

## Summary
**Goal:** Publish the currently deployed Version 30 by setting the backend publication status to “published” via the existing admin-only publish mechanism.

**Planned changes:**
- Use the existing backend `publishApp` admin action to set publication status to `published` (PublicationStatus.#published).
- Ensure non-admin users cannot trigger publishing and do not see admin publication controls.

**User-visible outcome:** Regular users visiting “/” see the Landing Page when unauthenticated, and authenticated users can proceed to Profile Setup or the Dashboard (depending on whether a profile exists) without being blocked by an unpublished/takedown screen.
