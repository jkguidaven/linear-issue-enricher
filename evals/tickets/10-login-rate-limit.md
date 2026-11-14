---
title: "Rate-limit the login endpoint"
expected:
  scope: 3
  mapping: 3
  acceptance: 3
  context: 3
---

## Problem
We saw a credential-stuffing spike last week (see incident INC-42). `POST /auth/login` has no rate limit.

## Scope
Add rate limiting to `POST /auth/login` in `src/server/routes/auth.ts` using the existing `rateLimiter` middleware in `src/server/middleware/rate-limit.ts`. Limit: 5 failed attempts per IP and email pair per 15 minutes.

Out of scope: CAPTCHA and account lockout.

## API contract
When limited, return `429` with a `Retry-After` header (seconds) and body `{ "error": "too_many_attempts" }`.

## Acceptance criteria
- The 6th failed attempt within 15 minutes returns 429 with `Retry-After`.
- A successful login resets the counter.
- Different emails from the same IP are counted separately.
- If the rate-limit store is unavailable, login still works and the error is logged.

## References
- Incident write-up: INC-42
- Middleware docs: `docs/rate-limit.md`
