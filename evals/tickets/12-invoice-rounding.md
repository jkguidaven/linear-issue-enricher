---
title: "Fix off-by-one cent in invoice totals"
expected:
  scope: 3
  mapping: 3
  acceptance: 3
  context: 2
---

## Problem
Invoice totals are sometimes one cent off. `calculateTotal` in `src/billing/totals.ts` rounds each line item before summing.

## Steps to reproduce
1. Create an invoice with three items at $0.335 each.
2. The total shows $1.02. It should be $1.01 (1.005 rounded half-even).

## Fix
Sum unrounded amounts, then round once using the existing `roundHalfEven` helper.

## Acceptance criteria
- The example above totals $1.01.
- Existing tests in `totals.test.ts` still pass.
- Add a test for the three-item case and for an empty invoice (total $0.00).

Related: BILL-118 (same issue on credit notes).
