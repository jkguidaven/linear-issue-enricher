---
title: "Show an error toast when saving settings fails"
expected:
  scope: 3
  mapping: 2
  acceptance: 2
  context: 1
---

When saving fails in the account settings panel, nothing happens and the spinner stops. Users think it saved.

`SettingsPanel` saves through the `useUpdateSettings` mutation. Show an error toast on failure and keep the form values.

Only the settings panel is in scope.

## Acceptance criteria
- A failed save shows an error toast.
- Form values are not reset after a failure.
