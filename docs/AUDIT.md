# SportsRadar Audit

Date: 2026-06-21
Branch: `codex/rescue-portfolio`

## Repository Map

- `backend/`: Node.js, Express 5, MongoDB/Mongoose API.
- `backend/index.js`: current combined Express app, middleware, route mounting, MongoDB connection, and server startup.
- `backend/routes/`: auth, bookings, payments, Google Places/geo proxy, venues, venue extras.
- `backend/models/`: `User`, `Booking`, `Venue`, `VenueExtra`.
- `mobile/`: React Native Expo app with committed `android/` native project, so this is Expo prebuild/native-hybrid rather than pure managed Expo.
- `mobile/App.js`: auth-based root navigator, tabs, Stripe provider, push initializer.
- `mobile/src/services/`: API and auth clients.
- `mobile/src/stripe/api.js`: payment API client.
- `docs/`: rescue documentation added for this work.

## How It Currently Runs

### Backend

- Install: `cd backend && npm install`
- Start: `npm start` currently runs `node index.js`.
- Dev: `npm run dev` currently runs `nodemon index.js`.
- Test: `npm test` currently exits with `Error: no test specified`.

Required env currently includes at least `MONGODB_URI`; runtime also uses `JWT_SECRET`, `STRIPE_SECRET_KEY`, Stripe publishable key aliases, Google Places key aliases, email variables, and `ADMIN_API_KEY`.

### Mobile

- Install: `cd mobile && npm install`
- Start: `npm start` runs `expo start`.
- Android/iOS: `expo run:android` / `expo run:ios`, which matches the committed native Android folder.
- No test or lint scripts are currently defined.

## Critical Findings

- `backend/routes/auth.js` and `backend/middleware/auth.js` use insecure fallback JWT secret `segredo123` when `JWT_SECRET` is absent.
- `backend/index.js` connects to MongoDB and starts listening at import time, preventing clean Supertest integration tests.
- `mobile/src/services/api.js`, `mobile/src/stripe/api.js`, and `mobile/app.json` hardcode `http://192.168.1.5:5000/api`, so the app will fail on other networks/devices.
- `mobile/app.json` contains a real-looking Stripe test publishable key. It is not a secret, but a portfolio repo should use env placeholders instead of project-specific keys in config.
- Bookings trust client-provided `paymentIntentId`, `receiptUrl`, `amount`, and `currency`; a booking can be confirmed without server-side payment verification.

## High Findings

- No backend tests exist for auth, bookings, payments, or route ownership rules.
- Booking creation does not prevent duplicate confirmed reservations for the same venue/date/time.
- Booking validation is minimal: date, time, amount, currency, and Google venue metadata are not strictly validated.
- Payment routes create/retrieve Stripe objects directly and are not structured for easy mocked tests.
- CORS uses `origin: true`, reflecting any origin when credentials are enabled.
- `backend/package.json` does not list `axios`, but `backend/routes/geo.js` and `backend/routes/places.js` require it. The lockfile contains axios, so installs may be inconsistent depending on npm behavior.
- No CI workflow is present.

## Medium Findings

- `backend/.env.example` exists but only lists MongoDB/JWT/port; it omits Stripe, Google, CORS, email, admin, and frontend variables.
- `mobile/.env.example` is missing.
- Error responses are inconsistent across routes and many route handlers log raw errors.
- `expoPushToken` is `select: false`; profile responses may omit it unless intentionally selected.
- `mobile/App.js` can initialize Stripe with an empty publishable key, which may cause runtime failures.
- README setup instructions are incomplete and currently affected by mojibake text encoding.
- `mobile` lacks non-invasive validation scripts such as config/import checks.

## Low Findings

- Several comments and README text show mojibake encoding artifacts.
- Root `.gitignore` is minimal and does not ignore common Expo, coverage, log, or env files across both packages.
- `CostumButton.js` appears misspelled; rename only if imports are updated safely.
- Native Android project is committed; document this as prebuild/hybrid and avoid regenerating it casually.
- History suggests `node_modules` paths were once committed, though they are not present in the current working tree.

## Initial Git Recon

- Commits: 31.
- Main contributors: Rui Rafael (29), RuiRafael11 (1).
- Hotspots: `backend/index.js`, `backend/package.json`, `mobile/App.js`, package lockfiles, and core mobile screens.
- Bug-magnet files from commit messages include `mobile/src/screens/HomeScreen.js` and `mobile/src/screens/SportDetailScreen.js`.
- Firefighting/revert commits: none found.

## Recommended First Fixes

1. Split backend app/server startup and add test tooling.
2. Remove JWT fallback secret and centralize env validation.
3. Replace mobile hardcoded API URL with `EXPO_PUBLIC_API_BASE_URL`.
4. Add env examples for backend and mobile.
5. Add auth and booking tests with an isolated MongoDB strategy.
6. Document payment verification limitations before claiming the booking flow is production-safe.

## Rescue Updates Applied

- Backend startup is split into `app.js`, `server.js`, and a compatibility `index.js`.
- JWT fallback secret has been removed from auth signing and verification.
- Backend dependencies now include required `axios`, security middleware, and test tooling.
- Auth, booking, and mocked payment tests have been added.
- Confirmed bookings have duplicate slot protection.
- Mobile API and Stripe configuration no longer use a hardcoded LAN IP or committed real-looking publishable key.
- `backend/.env.example` and `mobile/.env.example` now document expected variables.
- GitHub Actions backend CI has been added.
