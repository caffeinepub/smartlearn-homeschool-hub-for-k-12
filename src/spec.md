# Specification

## Summary
**Goal:** Refine role-based access control UX and authorization messaging so Student users never see admin-only controls and all permission failures display clear, consistent English messages.

**Planned changes:**
- Audit and tighten frontend role-gating for Lesson Plans so Educator/Parent-only controls (e.g., “Create Lesson Plan”, “AI Create”) never render for Students, including during initial loading and after role/profile changes.
- Ensure gated UI updates correctly when switching accounts/roles via logout/login without requiring a hard refresh.
- Standardize frontend authorization error handling across access-controlled actions to show consistent, role-accurate English toast messages and avoid exposing raw backend trap strings.
- Update backend authorization trap messages to be consistent, role-accurate (Educators/Parents vs Students), and easy for the frontend to detect as authorization failures.

**User-visible outcome:** Students won’t see Educator/Parent-only Lesson Plan creation options at any time, role-based UI updates reliably when switching accounts, and permission-denied actions show clear, consistent messages (with other errors still showing useful details).
