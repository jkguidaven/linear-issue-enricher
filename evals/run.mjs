#!/usr/bin/env node
// Scores each fixture ticket with the plugin's rubric (Phase 4) through `claude -p`,
// then compares the model's scores with the human labels in each ticket's frontmatter.
//
// Usage: node evals/run.mjs [--runs N] [--model MODEL] [--only 01,05]

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const rubric = readFileSync(
  join(here, "../skills/analyze-issue/references/scoring-rubric.md"),
  "utf8",
);

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const runs = Number(opt("runs", "1"));
const model = opt("model", null);
const only = opt("only", null)?.split(",");

const CRITERIA = ["scope", "mapping", "acceptance", "context"];
const classify = (t) =>
  t >= 10 ? "Agent-Ready" : t >= 7 ? "Nearly Ready" : t >= 4 ? "Needs Work" : "Not Ready";

function parseTicket(file) {
  const raw = readFileSync(join(here, "tickets", file), "utf8");
  const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const title = JSON.parse(fm.match(/title: (.*)/)[1]);
  const expected = Object.fromEntries(
    CRITERIA.map((c) => [c, Number(fm.match(new RegExp(`${c}: (\\d)`))[1])]),
  );
  return { id: file.replace(/\.md$/, ""), title, body: body.trim(), expected };
}

function score(ticket) {
  const prompt = `You are scoring a Linear issue for coding-agent readiness.

Use this rubric exactly:

${rubric}

Issue title: ${ticket.title}

Issue description:
${ticket.body}

Score only what is written in the issue. Do not explore any codebase.
Reply with JSON only, no other text:
{"scope": 0-3, "mapping": 0-3, "acceptance": 0-3, "context": 0-3}`;

  const cli = ["-p", prompt, "--output-format", "json"];
  if (model) cli.push("--model", model);
  const res = spawnSync("claude", cli, { encoding: "utf8", timeout: 180_000 });
  if (res.status !== 0) throw new Error(res.stderr || "claude -p failed");
  const text = JSON.parse(res.stdout).result;
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
  return Object.fromEntries(CRITERIA.map((c) => [c, Number(json[c])]));
}

const tickets = readdirSync(join(here, "tickets"))
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map(parseTicket)
  .filter((t) => !only || only.some((o) => t.id.startsWith(o)));

const rows = [];
for (const t of tickets) {
  for (let r = 0; r < runs; r++) {
    process.stderr.write(`Scoring ${t.id} (run ${r + 1}/${runs})...\n`);
    const got = score(t);
    rows.push({ t, got });
  }
}

const sum = (o) => CRITERIA.reduce((a, c) => a + o[c], 0);
let classMatch = 0, exact = 0, within1 = 0, totalErr = 0;
const lines = [];
for (const { t, got } of rows) {
  const e = sum(t.expected), g = sum(got);
  const match = classify(e) === classify(g);
  classMatch += match;
  totalErr += Math.abs(e - g);
  for (const c of CRITERIA) {
    exact += got[c] === t.expected[c];
    within1 += Math.abs(got[c] - t.expected[c]) <= 1;
  }
  lines.push(
    `| ${t.id} | ${e} ${classify(e)} | ${g} ${classify(g)} | ${match ? "yes" : "**no**"} | ${CRITERIA.map((c) => `${got[c]}/${t.expected[c]}`).join(" · ")} |`,
  );
}

const n = rows.length, nc = n * CRITERIA.length;
const pct = (x, d) => `${Math.round((100 * x) / d)}%`;
const report = `# Scoring eval results

${tickets.length} tickets × ${runs} run(s)${model ? `, model \`${model}\`` : ""}. Run on ${new Date().toISOString().slice(0, 10)}.

| Metric | Result |
|---|---|
| Same readiness class as the human label | ${pct(classMatch, n)} (${classMatch}/${n}) |
| Criterion scores exactly equal | ${pct(exact, nc)} |
| Criterion scores within ±1 | ${pct(within1, nc)} |
| Mean total-score error (0–12 scale) | ${(totalErr / n).toFixed(2)} |

| Ticket | Human total | Model total | Class match | Criteria (model/human: scope · mapping · acceptance · context) |
|---|---|---|---|---|
${lines.join("\n")}
`;

writeFileSync(join(here, "results.md"), report);
console.log(report);
