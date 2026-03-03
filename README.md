# linear-issue-enricher

Claude Code plugin that scores Linear issues for agent-readiness and enriches them with codebase context.

Linear issues are often written by non-dev stakeholders in plain English, lacking the technical context a coding agent needs to act on them. This plugin bridges that gap — it fetches an issue via the Linear MCP server, scores it against a readiness rubric, explores your codebases to fill in missing technical detail, and produces an enriched agent-ready specification.

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed
- A Linear account with access to the issues you want to analyze

## Installation

Clone the repository:

```bash
git clone https://github.com/jkguidaven/linear-issue-enricher.git
```

## Configuration

### 1. Authenticate the Linear MCP server

The plugin includes an `.mcp.json` that configures the official Linear MCP server. On first use, you'll need to authenticate:

1. Launch Claude Code with the plugin loaded (see [Usage](#usage)).
2. Run `/mcp` and follow the prompts to connect your Linear account via OAuth.

### 2. Create a repo mapping file

Create `~/.claude/linear-enrichment.json` to tell the plugin which GitHub repositories correspond to which Linear labels:

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

- **repo**: GitHub `owner/repo` identifier (e.g. `jkguidaven/linear-issue-enricher`).
- **labels**: Linear labels that indicate an issue is relevant to this repo (matched case-insensitively).

You can add as many repos as you need. Repos are shallow-cloned to `/tmp/linear-enrichment/` on first use and updated via `git pull` on subsequent runs. If an issue's labels don't match any configured repo, the plugin will ask you which repos to explore.

## Usage

Load the plugin when launching Claude Code:

```bash
claude --plugin-dir /path/to/linear-issue-enricher
```

Then run the skill with a Linear issue URL or identifier:

```
/linear:analyze-issue https://linear.app/myteam/issue/TEAM-123/some-issue-title
```

Or with a short identifier:

```
/linear:analyze-issue TEAM-123
```

## What It Does

The plugin runs through 8 phases:

| Phase | What happens |
|-------|-------------|
| **0. Parse Input** | Extracts the issue identifier from the URL or short ID you provide |
| **1. Fetch Issue** | Pulls the issue title, description, comments, labels, sub-issues, and project from Linear via MCP |
| **2. Load Config** | Reads your repo mappings from `~/.claude/linear-enrichment.json` |
| **3. Match Repos** | Matches issue labels to your configured repos; asks you if there's no match |
| **4. Score Readiness** | Rates the issue on 4 criteria (0–3 each, max 12): Actionable Scope, Technical Mapping, Acceptance Criteria, Supporting Context |
| **5. Explore Codebases** | Searches matched repos for affected files, traces dependencies, extracts code context, and fills gaps |
| **6. Produce Spec** | Generates an enriched agent-ready specification, marking discovered context with `[ENRICHED]` |
| **7. Present & Post** | Shows the spec and scorecard locally, then asks before posting it as a comment on the Linear issue |

## Readiness Scoring

Issues are classified based on their total score:

| Score | Classification | Meaning |
|-------|---------------|---------|
| 10–12 | Agent-Ready | Can be handed directly to a coding agent |
| 7–9 | Nearly Ready | Minor gaps that codebase exploration can likely fill |
| 4–6 | Needs Work | Significant gaps; enrichment helps but may need human input |
| 0–3 | Not Ready | Too vague; needs stakeholder discussion first |

The full rubric is in [`skills/analyze-issue/references/scoring-rubric.md`](skills/analyze-issue/references/scoring-rubric.md).

## Output

The plugin produces a structured specification using the template in [`skills/analyze-issue/references/enriched-spec-template.md`](skills/analyze-issue/references/enriched-spec-template.md), which includes:

- Issue metadata and objective
- Current vs. desired behavior
- Scope boundaries
- Technical plan (affected files, code context, schema changes)
- Acceptance criteria and test plan
- Edge cases and error handling
- Readiness scorecard

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Linear MCP is not authenticated" | Run `/mcp` inside Claude Code to connect your Linear account |
| "Could not find issue" | Double-check the identifier — make sure you have access to that issue in Linear |
| "No configuration file found" | Create `~/.claude/linear-enrichment.json` following the format above |
| Repo clone fails | Ensure `gh` CLI is authenticated (`gh auth login`) and the `owner/repo` identifier is correct |
| No label match | The plugin will show available repos and ask you which to explore |

## License

MIT
