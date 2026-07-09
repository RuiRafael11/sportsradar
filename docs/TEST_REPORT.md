# Test Report

Date: 2026-07-09

## Phase 1 Baseline

Validated by `test-runner` subagent.

| Command | Working directory | Result | Notes |
| --- | --- | --- | --- |
| `node --version; npm --version` | repo root | Pass | Node `v22.20.0`, npm `11.6.2`. |
| `git status --short --branch` | repo root | Pass | Branch `codex/rescue-portfolio`; changes in progress. |
| `quick_validate.py <skill_dir>` | repo root | Pass | All local rescue skills valid. |
| `npm test` | `backend/` | Fail baseline | Jest was not installed before dependency update. |
| `npm ci --dry-run --ignore-scripts` | `backend/` | Fail baseline | Lockfile out of sync before `npm install`. |
| `node --check` on backend JS files | `backend/` | Pass | Syntax parsed. |
| `npm ci --dry-run --ignore-scripts` | `mobile/` | Pass | Mobile lockfile was installable. |

## Current Local Verification

| Command | Working directory | Result | Notes |
| --- | --- | --- | --- |
| `npm ci` | `backend/` | Pass | Installed dependencies from lockfile. NPM reported 13 vulnerabilities after removing the unused Twilio dependency. |
| `npm test` | `backend/` | Pass | 3 suites, 13 tests passed. |
| `npm test` | `mobile/` | Pass | Static/config check passed. |
| `node -e "...require('./app')..."` | `backend/` | Pass | Express app imports without starting MongoDB/listening on a port. |
| `npm ci` | `mobile/` | Pass | Installed Expo/mobile dependencies. NPM reported 21 vulnerabilities after SDK alignment. |
| `npx expo-doctor --verbose` | `mobile/` | Expected partial fail | 17/18 checks passed. Only remaining warning: native config may not sync while `android/` is committed. |
| `npx expo export --platform android --output-dir .expo-project-check --clear` | `mobile/` | Pass | Android bundle exported successfully; `.expo-project-check` removed afterwards. |
| `rg "192\.168\." README.md docs backend mobile` | repo root | Pass | No current local LAN IP remains in tracked project files. |

## Skipped

- `npm run dev` / `npm start`: requires real MongoDB env values and would start a long-running server.
- `expo start`: long-running interactive Metro process.
- `npx expo start --no-dev --minify`: skipped because it starts Metro and can block the session; `expo-doctor` and `npm test` were used for non-invasive validation instead.
- Real Stripe/Google/email/push integration tests: require external credentials and should not run in CI by default.
