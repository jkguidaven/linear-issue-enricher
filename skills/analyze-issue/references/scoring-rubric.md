# Issue Readiness Scoring Rubric

Score each criterion from 0 to 3. Maximum total score: 12.

---

## 1. Actionable Scope

Can an agent determine exactly what needs to change?

| Score | Indicator |
|-------|-----------|
| **0** | Vague or aspirational ("improve performance", "make it better") with no specifics |
| **1** | General area identified but boundaries unclear ("fix the auth flow") |
| **2** | Specific feature or behavior described with mostly clear boundaries ("add email validation to signup form") |
| **3** | Precise scope with explicit in/out boundaries, clear start and end conditions |

## 2. Technical Mapping

Can the issue be mapped to specific files, components, or systems in a codebase?

| Score | Indicator |
|-------|-----------|
| **0** | No technical references; purely business language with no hints about implementation |
| **1** | Mentions a product area or feature name but no technical specifics |
| **2** | References specific components, endpoints, or modules; can be narrowed to a subsystem |
| **3** | Identifies exact files, functions, database tables, or API endpoints affected |

## 3. Acceptance Criteria

Are there testable conditions that define "done"?

| Score | Indicator |
|-------|-----------|
| **0** | No success criteria; no way to verify the issue is resolved |
| **1** | Implicit criteria that can be inferred but are not stated ("users should be able to log in" implies login works) |
| **2** | Partial criteria stated; some conditions are testable but gaps remain |
| **3** | Complete, testable acceptance criteria covering happy path, edge cases, and error states |

## 4. Supporting Context

Is there enough background to understand the problem and constraints?

| Score | Indicator |
|-------|-----------|
| **0** | No context beyond a title; no repro steps, no design, no references |
| **1** | Minimal context: a brief description or a single screenshot |
| **2** | Moderate context: repro steps OR design specs OR API contracts, but not all relevant ones |
| **3** | Rich context: repro steps, screenshots/recordings, design specs, API contracts, related issues linked |

---

## Overall Classification

| Total Score | Classification | Meaning |
|-------------|---------------|---------|
| **10–12** | Agent-Ready | Can be handed directly to a coding agent with high confidence |
| **7–9** | Nearly Ready | Minor gaps that codebase exploration can likely fill |
| **4–6** | Needs Work | Significant gaps; enrichment will help but may require human clarification |
| **0–3** | Not Ready | Too vague for automated enrichment; needs stakeholder input first |
