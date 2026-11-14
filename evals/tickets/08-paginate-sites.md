---
title: "Paginate GET /api/sites"
expected:
  scope: 2
  mapping: 2
  acceptance: 2
  context: 2
---

`GET /api/sites` returns every site in one response, which times out for large accounts.

Add cursor-based pagination: `limit` (default 50, max 200) and `cursor` query params. Return `next_cursor` in the response.

## Acceptance criteria
- Requests without params return the first 50 sites and a `next_cursor`.
- `limit` above 200 is capped.

Related: the sites list page will need to adopt this later (separate issue).
