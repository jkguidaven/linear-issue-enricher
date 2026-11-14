# Scoring eval results

12 tickets × 1 run(s). Run on 2026-11-14.

| Metric | Result |
|---|---|
| Same readiness class as the human label | 75% (9/12) |
| Criterion scores exactly equal | 79% |
| Criterion scores within ±1 | 100% |
| Mean total-score error (0–12 scale) | 0.67 |

| Ticket | Human total | Model total | Class match | Criteria (model/human: scope · mapping · acceptance · context) |
|---|---|---|---|---|
| 01-dashboard-faster | 1 Not Ready | 2 Not Ready | yes | 0/0 · 1/0 · 0/0 · 1/1 |
| 02-login-broken | 3 Not Ready | 4 Needs Work | **no** | 1/1 · 1/0 · 1/1 · 1/1 |
| 03-better-onboarding | 1 Not Ready | 2 Not Ready | yes | 0/0 · 1/1 · 0/0 · 1/0 |
| 04-invoice-csv | 5 Needs Work | 5 Needs Work | yes | 2/2 · 1/1 · 1/1 · 1/1 |
| 05-safari-datepicker | 6 Needs Work | 7 Nearly Ready | **no** | 2/2 · 2/1 · 1/1 · 2/2 |
| 06-reset-email-slow | 5 Needs Work | 5 Needs Work | yes | 2/1 · 1/1 · 1/1 · 1/2 |
| 07-signup-email-validation | 9 Nearly Ready | 9 Nearly Ready | yes | 3/3 · 3/3 · 2/2 · 1/1 |
| 08-paginate-sites | 8 Nearly Ready | 10 Agent-Ready | **no** | 3/2 · 3/2 · 2/2 · 2/2 |
| 09-settings-save-toast | 8 Nearly Ready | 9 Nearly Ready | yes | 3/3 · 3/2 · 2/2 · 1/1 |
| 10-login-rate-limit | 12 Agent-Ready | 12 Agent-Ready | yes | 3/3 · 3/3 · 3/3 · 3/3 |
| 11-rename-team-members | 11 Agent-Ready | 11 Agent-Ready | yes | 3/3 · 3/3 · 3/3 · 2/2 |
| 12-invoice-rounding | 11 Agent-Ready | 10 Agent-Ready | yes | 3/3 · 3/3 · 2/3 · 2/2 |
