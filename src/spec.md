# Specification

## Summary
**Goal:** Improve production stability and startup reliability by handling runtime errors, failed initial loads, service worker cache issues, and actor/identity initialization failures with clear English recovery paths.

**Planned changes:**
- Add a global React error boundary that catches unexpected runtime/render errors, logs them to console with a consistent prefix, and shows a dedicated recovery screen with actions to reload and clear local app data then reload.
- Update the `/` startup flow and Landing Page to replace indefinite spinners on failed initial requests (publication status / app store preview) with clear English error states and a “Try again” action that refetches.
- Harden the PWA service worker caching strategy with versioned cache keys, reliable invalidation on new deployments, non-stale navigation/HTML shell behavior, and an update path when a new service worker is waiting, while preserving offline navigation fallback.
- Standardize and surface actor/identity availability failures with consistent, non-technical English messaging and retry options, implemented via composition/wrappers without editing the immutable hook files.

**User-visible outcome:** When the app hits unexpected errors or initialization/loading failures, users see clear English error screens/messages with retry/reload options (including a clear-data recovery), and deployments update reliably without getting stuck on stale cached versions while still working offline.
