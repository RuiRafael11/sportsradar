# SportsRadar Audit

Date: 2026-07-09

## App Purpose

SportsRadar is a React Native/Expo mobile app backed by an Express/MongoDB API. It is intended to let users register, log in, discover sports venues, view venue details, schedule bookings, pay through Stripe PaymentSheet, manage profile/preferences, and optionally receive booking notifications.

## Current Architecture

- `mobile/`: Expo/React Native app with AsyncStorage auth, React Navigation tabs, a nested Find stack, Stripe provider, Google Places-backed search/map screens, booking history, and local preferences.
- `backend/`: Express 5 API split into `app.js` and `server.js`, with MongoDB/Mongoose models and route modules for auth, geo/places, venues, venue extras, bookings, and payments.
- `docs/`: architecture, API, limitations, rescue plan, and test report notes.
- Tests: backend Jest/Supertest tests use `mongodb-memory-server`; Stripe is mocked in payment tests.

## Main Functional Flows

- Auth: mobile posts `/api/auth/register` or `/api/auth/login`, stores the JWT, and restores user state with `/api/auth/me`.
- Discovery: Home/Map call `/api/places/search`; Google IDs use the `g:<place_id>` format and can be enriched through `/api/venue-extras`.
- Venue detail: internal venues load through `/api/venues/:id`; Google venues use the passed venue object plus optional extras.
- Booking/payment: ScheduleEvent sends venue/date/time to PaymentCheckout; PaymentCheckout prepares Stripe, presents PaymentSheet, retrieves receipt metadata, then creates `/api/bookings`.
- History: `/api/bookings/my` lists bookings and `DELETE /api/bookings/:id` cancels owned bookings when allowed.
- Profile/preferences: account updates and backend preferences go through `/api/auth/me`; local discovery preferences also persist in AsyncStorage.

## Findings

### Critical

- Fixed: `SportDetailScreen` navigated to the parent `Find` route while already inside the Find stack. It now navigates directly to `ScheduleEvent`.

### High

- Fixed: Home and Map now show useful empty/error states when Places/API calls fail or return no venues.
- Fixed: ScheduleEvent now loads internal venues when opened without a venue parameter.
- Fixed: PaymentCheckout now blocks early with a clear message when the Stripe publishable key is missing.
- Backend booking creation verifies Stripe PaymentIntent status/amount/currency unless `REQUIRE_PAYMENT_FOR_BOOKINGS=false`.

### Medium

- Fixed: API calls now have a timeout and shared user-facing error messages.
- Fixed: push token registration no longer logs the raw Expo push token.
- Fixed: repeated Google Places `REQUEST_DENIED` warnings are reduced.
- Fixed: malformed booking cancellation IDs now return a controlled `400` and are covered by a regression test.
- Fixed: booking history no longer shows Stripe Dashboard test-payment links as user receipts.
- Fixed: duplicate initial Home Places fetch was removed.
- Remaining: profile city autocomplete still silently clears suggestions on Google errors.
- Remaining: Expo Doctor reports the native/prebuild sync warning because `mobile/android/` is committed.

### Low

- Some older source comments/text contain mojibake from prior encoding issues.
- The committed `android/` folder means the project is Expo prebuild/native-hybrid; native config changes should be made intentionally.
- Personal Codex rescue skills were removed from tracked source so the public repository stays project-focused.
- Unused mobile Stripe helper and misspelled button alias were removed after confirming no imports.
- Unused backend `twilio` dependency was removed after confirming no code imports it.

## Frontend/Backend Contract Notes

- Auth response shapes are aligned: `{ token, user }`.
- Booking payloads are aligned for internal venue IDs and `g:<place_id>` Google IDs.
- `/venue-extras/bulk`, `/bookings/my`, `/payments/payment-sheet`, and `/payments/capture` match frontend calls.
- Stripe and Google Places depend on external configuration; the app now fails more clearly when those are unavailable.

## Environment and Setup Notes

- Backend requires `MONGODB_URI` and `JWT_SECRET`.
- Stripe requires backend `STRIPE_SECRET_KEY` and mobile `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Google discovery requires `GOOGLE_PLACES_KEY` authorized for the required Places APIs.
- Physical-device Expo testing should set `EXPO_PUBLIC_API_BASE_URL` to the computer LAN URL, for example `http://<YOUR_LAN_IP>:5000/api`.
- Current tracked files use placeholders for LAN URLs and Stripe keys; do not commit real local IPs or key-looking values.

## Prioritized Follow-Ups

1. Add mobile component tests for auth restore, venue detail, booking, and payment failure paths.
2. Add backend tests for Places/Geo missing-key behavior and profile preference patching.
3. Add a no-payment local development booking mode in the mobile UI if `REQUIRE_PAYMENT_FOR_BOOKINGS=false` is used often.
4. Replace `react-native-keyboard-aware-scroll-view` if Expo/New Architecture compatibility becomes a blocker.
5. Add screenshots/demo media for portfolio presentation.
