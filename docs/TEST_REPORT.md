# Test Report

Date: 2026-06-21

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
| `npm install` | `backend/` | Pass | Installed test/security dependencies and updated lockfile. NPM reported 29 vulnerabilities. |
| `npm test` | `backend/` | Pass | 3 suites, 12 tests passed. |
| `npm test` | `mobile/` | Pass | Static/config check passed. |
| `npm ci --dry-run --ignore-scripts` | `backend/` | Pass | Lockfile is now in sync after rerunning `npm install`. |
| `node -e "...require('./app')..."` | `backend/` | Pass | Express app imports without starting MongoDB/listening on a port. |
| `npm install` | `mobile/` | Pass | Installed Expo/mobile dependencies. NPM reported 35 vulnerabilities after SDK alignment. |
| `npx expo-doctor` | `mobile/` | Partial fail | 16/18 checks passed. Remaining warnings: native config may not sync while `android/` is committed; `react-native-keyboard-aware-scroll-view` is unmaintained/untested on New Architecture. |

## Skipped

- `npm run dev` / `npm start`: requires real MongoDB env values and would start a long-running server.
- `expo start`: long-running interactive Metro process.
- `npx expo start --no-dev --minify`: skipped because it starts Metro and can block the session; `expo-doctor` and `npm test` were used for non-invasive validation instead.
- Real Stripe/Google/email/push integration tests: require external credentials and should not run in CI by default.
