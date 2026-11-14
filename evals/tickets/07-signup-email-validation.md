---
title: "Add email validation to the signup form"
expected:
  scope: 3
  mapping: 3
  acceptance: 2
  context: 1
---

Add client-side email validation to `SignupForm` in `src/components/auth/SignupForm.tsx`. Use the existing `validateEmail` helper in `src/utils/validation.ts`.

Only the signup form is in scope. Server-side validation already exists.

## Acceptance criteria
- An invalid email shows an inline error under the field.
- A valid email submits as before.
