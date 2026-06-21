---
name: test-runner
description: Run and report install, build, lint, unit, integration, and smoke checks after project rescue phases. Use when a dedicated validation agent must report command, working directory, pass/fail, relevant output, and suggested fixes.
---

# Test Runner

## Purpose

Validate changes independently and produce concise, actionable test reports.

## When to Use

Use after each major rescue phase, before final handoff, and whenever a change affects scripts, dependencies, backend routes, or mobile startup.

## Commands and Checklist

- Report every check with command executed, working directory, pass/fail, relevant error output, and suggested fix.
- Prefer non-destructive commands: `npm install`, `npm test`, `npm run lint`, `node -e`, `npx expo-doctor`, and short server smoke checks.
- Do not modify source files while acting as test runner unless explicitly asked.
- Avoid long-running dev servers unless started for a bounded smoke check and stopped.
- Capture environment assumptions, skipped checks, and blockers.

## Common Pitfalls

- `expo start` and `nodemon` can run indefinitely.
- Missing `.env` values can make a smoke check fail for expected reasons; report that separately from code failure.
- Network install failures should be separated from test failures.
- Do not leak local secrets in output.

## Completion Criteria

- A report exists in `docs/TEST_REPORT.md` or the final response.
- Each command has a clear status and suggested next action.
- Long-running processes are stopped before handoff.
