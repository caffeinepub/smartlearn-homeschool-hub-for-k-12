# Specification

## Summary
**Goal:** Let Educator/Parent (admin role) users create lesson plans via custom entry, AI draft generation, library selection, and a new text-file upload path, while preventing Students from accessing any lesson-plan creation controls.

**Planned changes:**
- Update Lesson Plans UI so role=admin (Educator/Parent) sees the full “Create Lesson Plan” experience (Custom, AI Create Plan, Library) and role=user (Student) sees no creation/upload controls.
- Add an “Upload Lesson” option in the “Create New Lesson Plan” dialog for admin users that accepts supported text-based files (minimum .txt and .md), reads the content in-browser, and saves it through the existing lesson creation flow.
- Ensure AI draft generation + save works for admin users and adjust any user-facing authorization/error text so it references Educator/Parent (admin) permissions rather than “teachers only,” with clear English errors when Students attempt restricted actions.

**User-visible outcome:** Educator/Parents can create lesson plans (including uploading .txt/.md files and generating AI drafts) and save them to the lesson plan list; Students cannot access or trigger lesson plan creation features and will see a clear “not allowed” message if they try.
