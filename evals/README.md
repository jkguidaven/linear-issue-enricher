# Scoring evals

Checks how well the plugin's readiness scores (Phase 4) match a person's.

## How it works

- `tickets/` has 12 sample issues, three per readiness class (Not Ready, Needs Work, Nearly Ready, Agent-Ready). They are made up, so no real tickets are shared.
- Each ticket's frontmatter holds the human scores for the four rubric criteria.
- `run.mjs` scores each ticket with the same rubric through `claude -p`, then compares the result with the human scores.

It checks scoring only. Codebase exploration and spec writing are not covered yet.

## Run it

```bash
node evals/run.mjs              # all tickets, one run each
node evals/run.mjs --runs 3     # repeat to see how stable the scores are
node evals/run.mjs --only 05,08 # a few tickets
```

Results are written to `results.md`.

## What it measures

- **Class match:** same readiness class as the human label. This decides what the plugin does next, so it matters most.
- **Exact and ±1 agreement** per criterion.
- **Mean total-score error** on the 0–12 scale.
