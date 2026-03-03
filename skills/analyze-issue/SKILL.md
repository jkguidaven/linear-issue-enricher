---
disable-model-invocation: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Agent
  - mcp__linear
---

# Analyze Linear Issue

Fetch a Linear issue, score its readiness for a coding agent, explore relevant codebases to fill gaps, and produce an enriched agent-ready specification.

## Phase 0: Parse Input

Extract the Linear issue identifier from `$ARGUMENTS`.

Supported formats:
- Full URL: `https://linear.app/<workspace>/issue/<TEAM-123>/...`
- Short identifier: `TEAM-123`
- UUID: a valid Linear issue UUID

Steps:
1. If `$ARGUMENTS` is empty or missing, ask the user: "Please provide a Linear issue URL or identifier (e.g. `TEAM-123`)."
2. If a URL is provided, extract the identifier from the path segment matching the pattern `<TEAM>-<NUMBER>`.
3. Store the extracted identifier for use in Phase 1.
4. If the input cannot be parsed as any supported format, ask the user for a valid input.

## Phase 1: Fetch Issue Data

Use the Linear MCP server to retrieve the issue.

Steps:
1. Search for the issue using the Linear MCP tools. Try searching by identifier first.
2. If the MCP call fails with an authentication error, tell the user: "Linear MCP is not authenticated. Please run `/mcp` to connect your Linear account, then try again."
3. If the issue is not found, tell the user: "Could not find issue `<identifier>`. Please verify the identifier and try again."
4. Collect the following data from the issue:
   - Title
   - Description (full markdown body)
   - Status (state name)
   - Priority (label)
   - Labels (list of label names)
   - Assignee (name, if any)
   - Project (name, if any)
   - Comments (list of comment bodies)
   - Sub-issues (list of child issue identifiers and titles, if any)
   - Related issues (list of related issue identifiers and titles, if any)

## Phase 2: Load Configuration

Read the user's repo mapping configuration.

Steps:
1. Read the file at `~/.claude/linear-enrichment.json`.
2. If the file does not exist or is not valid JSON:
   - Inform the user: "No configuration file found at `~/.claude/linear-enrichment.json`."
   - Show the expected format:
     ```json
     {
       "repos": {
         "backend": {
           "repo": "org/backend-repo",
           "labels": ["backend", "api"]
         },
         "frontend": {
           "repo": "org/frontend-repo",
           "labels": ["frontend", "ui"]
         }
       }
     }
     ```
     Where `repo` is the GitHub `owner/repo` identifier (e.g. `acme/backend-api`).
   - Ask the user if they want to provide a repo identifier manually to continue, or abort.
3. Parse the configuration and store the repo mappings.

## Phase 3: Determine Relevant Repos

Match the issue's labels to configured repositories.

Steps:
1. Get the list of label names from the issue (from Phase 1).
2. For each configured repo, check if any of the repo's `labels` match any of the issue's labels (case-insensitive comparison).
3. Collect all matching repos into a list.
4. If no repos match:
   - Show the user the issue's labels and the configured repos with their labels.
   - Ask: "None of the issue's labels match a configured repo. Which repos should I explore?" and let the user pick.
5. For each matched repo, ensure a local clone is available at `/tmp/linear-enrichment/<name>`:
   - If the directory already exists and is a valid git repo, update it:
     - Run: `git -C /tmp/linear-enrichment/<name> pull --ff-only` to fetch the latest changes.
     - If the pull fails, warn: "Failed to update repo `<name>`. Continuing with existing clone."
   - If the directory does not exist, clone it:
     - Run: `gh repo clone <repo> /tmp/linear-enrichment/<name> -- --depth 1`
     - If the clone fails, warn: "Failed to clone repo `<name>` (`<repo>`). Skipping." and remove it from the list.
   - Store the local path (`/tmp/linear-enrichment/<name>`) for use in Phase 5.
6. If no repos are available (no existing clones and all new clones failed), ask the user to provide a repo identifier manually.

## Phase 4: Score Issue Readiness

Evaluate the issue against the scoring rubric.

Steps:
1. Read the scoring rubric from `./references/scoring-rubric.md` (relative to this skill).
2. Using the issue data from Phase 1, score each of the 4 criteria on a 0–3 scale:
   - **Actionable Scope**: How clearly does the issue define what needs to change?
   - **Technical Mapping**: Can the issue be mapped to specific files or components?
   - **Acceptance Criteria**: Are there testable conditions defining "done"?
   - **Supporting Context**: Is there enough background (repro steps, designs, API contracts)?
3. For each criterion, write a brief justification for the score.
4. Sum the scores for a total (max 12).
5. Classify the issue:
   - 10–12: Agent-Ready
   - 7–9: Nearly Ready
   - 4–6: Needs Work
   - 0–3: Not Ready
6. Store the scorecard for inclusion in the final output.

## Phase 5: Codebase Exploration

For each relevant repo, explore the codebase to fill gaps identified in scoring.

Steps:
1. For each repo from Phase 3 (using the local paths at `/tmp/linear-enrichment/<name>`):
   a. **Find affected files**: Based on the issue description, search for files related to the feature, component, or bug mentioned. Use Glob to find files by name patterns and Grep to search for relevant keywords, function names, or identifiers.
   b. **Trace dependencies**: For key files identified, look at imports and references to understand the dependency graph. Identify upstream callers and downstream dependencies.
   c. **Extract code context**: Read the most relevant files (limit to key sections) to extract:
      - Function signatures and type definitions
      - Database schema or model definitions relevant to the issue
      - API endpoint definitions
      - Configuration structures
      - Test patterns already in use
   d. **Fill gaps**: Based on low-scoring criteria from Phase 4:
      - If **Actionable Scope** scored low: identify the specific files and functions that would need to change.
      - If **Technical Mapping** scored low: map the business language to concrete code locations.
      - If **Acceptance Criteria** scored low: look at existing tests to infer expected behaviors and suggest testable criteria.
      - If **Supporting Context** scored low: gather architectural context, related code patterns, and configuration that would help an agent understand the system.

2. Use the Agent tool with subagent_type="Explore" for deeper exploration when simple Glob/Grep searches are insufficient.

3. Compile all findings into a structured technical context section.

## Phase 6: Produce Enriched Spec

Generate the final agent-ready specification.

Steps:
1. Read the enriched spec template from `./references/enriched-spec-template.md` (relative to this skill).
2. Fill in each section of the template using:
   - Issue data from Phase 1 (direct fields)
   - Codebase findings from Phase 5 (technical plan, affected files, code context)
   - Scoring results from Phase 4 (readiness scorecard)
3. Mark all information that was NOT in the original issue but was discovered through codebase exploration with `[ENRICHED]`.
4. For sections where information is unavailable and could not be enriched, write "Not determined — requires stakeholder input" rather than leaving them blank.
5. Output the complete enriched specification in a fenced markdown block.

## Phase 7: Present & Post

Show results to the user and optionally post to Linear.

Steps:
1. Present the enriched specification to the user.
2. Show a summary scorecard:
   ```
   ## Readiness Scorecard
   | Criterion           | Score | Notes                  |
   |---------------------|-------|------------------------|
   | Actionable Scope    | X/3   | ...                    |
   | Technical Mapping   | X/3   | ...                    |
   | Acceptance Criteria | X/3   | ...                    |
   | Supporting Context  | X/3   | ...                    |
   | **Total**           | **X/12** | **Classification**  |
   ```
3. If the total score is 4 or above, ask the user: "Would you like me to post this enriched specification as a comment on the Linear issue?"
4. If the user agrees:
   - Use the Linear MCP tools to post a comment on the issue containing the enriched specification.
   - Confirm: "Enriched specification posted as a comment on `<identifier>`."
5. If the user declines or the score is below 4:
   - Tell the user the spec has been presented locally only.
   - If the score is below 4, suggest: "This issue may benefit from discussion with the stakeholder before further enrichment."
6. **Note**: Cloned repos in `/tmp/linear-enrichment/` are kept for future runs. They will be updated via `git pull` on the next invocation.
