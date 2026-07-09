# SportsRadar

SportsRadar is a full-stack mobile application for discovering nearby sports facilities and booking time slots. It was built as my final university project and later rescued/polished with stronger configuration, tests, documentation, and safer backend practices.

## Problem Solved

Finding local sports facilities often means switching between maps, websites, phone calls, and payment flows. SportsRadar brings discovery, venue details, booking history, and payment preparation into one mobile experience.

## Main Features

- Account registration, login, profile update, and JWT-based authenticated sessions.
- Interactive sports facility discovery using internal venues and Google Places results.
- Booking creation for internal venues and Google Places venues.
- Duplicate confirmed booking protection for the same venue/date/time.
- Booking history and cancellation with a 24-hour cancellation rule.
- Stripe PaymentSheet preparation in sandbox/test mode.
- Optional email and Expo push notifications after booking confirmation.

## Tech Stack

- Mobile: React Native, Expo, React Navigation, Axios, AsyncStorage.
- Backend: Node.js, Express, MongoDB, Mongoose.
- Auth: JWT and bcryptjs.
- Payments: Stripe PaymentSheet.
- Maps/Places: Google Places APIs.
- Notifications: Expo push notifications and email via Nodemailer.
- Tests: Jest, Supertest, mongodb-memory-server.

## Architecture

```text
React Native / Expo app
  -> Axios API clients
  -> Express API
      -> Auth, venues, places, bookings, payments routes
      -> Mongoose models
      -> MongoDB
      -> Stripe / Google Places / email / Expo push integrations
```

More detail is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Screenshots

Screenshots are not committed yet. Suggested portfolio captures:

- Login/register flow.
- Map/search view.
- Venue details.
- Booking form.
- Booking history/profile.

## Setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Fill `backend/.env` with local/test values before running the server.
For physical-phone testing, replace `<YOUR_LAN_IP>` with your computer's LAN IP. The backend should be reachable from desktop and phone at:

```text
http://<YOUR_LAN_IP>:5000/api/health
```

Expected health response:

```json
{ "ok": true, "env": "development" }
```

Important variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `STRIPE_SECRET_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `GOOGLE_PLACES_KEY`
- `ADMIN_API_KEY`
- optional `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`

### Mobile

```bash
cd mobile
npm install
copy .env.example .env
npm start
```

Important variables:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Use the API URL that matches where Expo is running:

- Physical phone on the same Wi-Fi: `EXPO_PUBLIC_API_BASE_URL=http://<YOUR_LAN_IP>:5000/api`
- Android emulator: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api`
- iOS simulator or web: `EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api`

The committed `android/` folder means the app is Expo prebuild/native-hybrid. Use `npm run android` only when Android tooling is configured locally.

### Local Smoke Checks

After starting the backend, verify:

```bash
curl http://<YOUR_LAN_IP>:5000/api/health
curl http://<YOUR_LAN_IP>:5000/api/places/ping
```

`/api/places/ping` should return `hasKey: true` only when `GOOGLE_PLACES_KEY` is configured and authorized for the required Google Places APIs. If it is false, search/map screens should show an empty or configuration message instead of crashing.

Stripe requires `STRIPE_SECRET_KEY` on the backend and `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` on the mobile app. Without those values, payment preparation will fail gracefully and bookings that require payment cannot be completed.

Expo Go does not support every native notification/payment behavior. Push token registration is skipped in Expo Go or when no EAS project id is configured; the rest of the app should still run.

## API Summary

See [docs/API.md](docs/API.md) for endpoint details.

Core routes:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `GET /api/bookings/my`
- `POST /api/bookings`
- `DELETE /api/bookings/:id`
- `POST /api/payments/payment-sheet`
- `POST /api/payments/capture`
- `GET /api/places/search`

## Testing

Backend:

```bash
cd backend
npm test
```

Mobile static/config check:

```bash
cd mobile
npm test
```

The backend test suite covers auth, bookings, and mocked Stripe PaymentSheet preparation.
Current backend validation covers 13 Jest/Supertest tests. The mobile test script is a static/config safety check.

Continuous integration runs backend install/tests, a backend app import smoke check, and the mobile config check.

## Known Limitations

See [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md).

Highlights:

- Stripe webhooks are not fully implemented yet.
- Google Places and notification flows require real external credentials.
- Mobile validation is currently a lightweight static/config check rather than a full React Native test suite.
- The repository uses placeholder LAN URLs such as `<YOUR_LAN_IP>`; do not commit real local IP addresses.

## Future Improvements

- Add full Stripe webhook signature verification with raw body parsing.
- Add React Native Testing Library coverage for auth, navigation, booking, and payment failure flows.
- Add screenshots and demo video.
- Add venue admin/backoffice UI.
- Expand validation and rate limiting for all public routes.

## What I Learned

This project helped me practise full-stack mobile development, API design, authentication, external API integration, payment preparation, MongoDB data modelling, and the difference between a working prototype and a maintainable portfolio project.

## Project Context

SportsRadar was my final university project. The current version keeps the original product idea and architecture, then improves reliability, security posture, testability, and documentation so it is easier to run and discuss in junior developer or internship interviews.
