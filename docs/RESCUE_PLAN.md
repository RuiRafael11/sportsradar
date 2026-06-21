# SportsRadar Rescue Plan

## Objective

Make SportsRadar installable, runnable, testable, and presentable as a final university project improved with production practices. Preserve the existing backend/mobile architecture and fix incrementally.

## Working Rules

- Audit before implementation changes.
- Keep changes scoped and reversible.
- Do not commit real MongoDB, JWT, Stripe, Google, email, or admin secrets.
- Prefer compatibility shims when changing entrypoints.
- Validate each major phase with a dedicated `test-runner` subagent report.

## Phases

1. Repository audit and documentation
   - Map backend, mobile, dependencies, scripts, env files, routes, models, navigation, API clients, and payment flow.
   - Record findings in `docs/AUDIT.md`.

2. Backend reliability
   - Split Express app creation from server startup.
   - Add env validation, safer CORS, healthcheck, consistent errors, and reliable scripts.
   - Add test tooling and a database test strategy.

3. Authentication
   - Remove fallback JWT secrets.
   - Validate register/login/update payloads.
   - Ensure password fields are never returned.
   - Add auth route tests.

4. Bookings
   - Validate venue/date/time/payment fields.
   - Support internal and Google Places venue metadata.
   - Prevent duplicate confirmed bookings.
   - Enforce ownership and cancellation rules.
   - Add booking tests.

5. Payments
   - Keep Stripe in test/sandbox mode.
   - Do not trust client payment claims blindly.
   - Mock Stripe in tests.
   - Document webhook limitations or add verified webhook support if feasible.

6. Mobile configuration
   - Remove hardcoded LAN URLs.
   - Use `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
   - Add `mobile/.env.example`.
   - Smoke-check imports/config/navigation assumptions.

7. Quality tooling and CI
   - Add backend tests with Supertest and a memory/test database.
   - Add non-invasive mobile validation.
   - Add GitHub Actions for backend install and tests.

8. Portfolio documentation
   - Rewrite README for recruiters.
   - Add architecture, API, known limitations, and test report docs.

9. Final verification
   - Run backend install/tests/smoke check.
   - Run mobile install/config checks.
   - Verify env examples, docs, scripts, and secret scan.

## Initial Risk Notes

- Current mobile config contains a hardcoded LAN backend URL.
- Auth currently has a fallback JWT secret in backend code.
- Backend startup and app definition are coupled, making route tests difficult.
- Payment-to-booking verification needs careful treatment to avoid trusting client data.
