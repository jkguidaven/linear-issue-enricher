---
title: "Rename \"Team\" to \"Members\" in the sidebar"
expected:
  scope: 3
  mapping: 3
  acceptance: 3
  context: 2
---

## Scope
Rename the "Team" sidebar item to "Members". Only the label changes. The route `/team` stays the same.

Files:
- `src/components/nav/Sidebar.tsx` (label)
- `src/i18n/en.json` (`nav.team` string)

Out of scope: page titles and other languages.

## Acceptance criteria
- The sidebar shows "Members".
- Clicking it still opens `/team`.
- The sidebar snapshot test is updated.

## Context
Design decision from the navigation review (mockup attached).
