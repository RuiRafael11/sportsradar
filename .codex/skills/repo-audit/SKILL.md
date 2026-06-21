---
name: repo-audit
description: Audit an unfamiliar full-stack repository before rescue work. Use when mapping project structure, scripts, dependencies, environment variables, secrets, API routes, models, services, navigation, payment flows, test gaps, and portfolio-readiness risks.
---

# Repo Audit

## Purpose

Produce a grounded audit before making broad changes. Favor evidence from files, package scripts, route definitions, config files, and command output.

## When to Use

Use at the start of a rescue, modernization, handoff, portfolio-polish, or "make this runnable" task.

## Commands and Checklist

- List files with `rg --files`.
- Inspect root files, package manifests, lockfiles, `.gitignore`, app config, environment examples, and CI files.
- Identify backend entrypoints, route mounts, models, middleware, services, and external integrations.
- Identify frontend app mode, navigation, API clients, auth storage, and native/prebuild artifacts.
- Search for secrets and local assumptions with `rg -n "localhost|192\\.168|JWT_SECRET|segredo|sk_|pk_|MONGODB|GOOGLE|STRIPE|process\\.env"`.
- Group findings by Critical, High, Medium, and Low severity.
- Record how to run, test, and smoke-check each package.

## Common Pitfalls

- Do not treat lockfile-only dependencies as usable unless `package.json` includes them.
- Do not assume Expo managed workflow if `android/` or `ios/` native folders exist.
- Do not remove features during audit; document risk first.
- Avoid committing real secrets or copying values from local `.env` files.

## Completion Criteria

- `docs/AUDIT.md` exists with severity-grouped findings.
- The audit names concrete files and current commands.
- Missing env examples, scripts, dependencies, hardcoded URLs, test gaps, and security risks are captured.
