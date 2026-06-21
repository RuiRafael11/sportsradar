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

The committed `android/` folder means the app is Expo prebuild/native-hybrid. Use `npm run android` only when Android tooling is configured locally.

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

## Known Limitations

See [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md).

Highlights:

- Stripe webhooks are not fully implemented yet.
- Google Places and notification flows require real external credentials.
- Mobile validation is currently a lightweight static/config check rather than a full React Native test suite.

## Future Improvements

- Add full Stripe webhook signature verification with raw body parsing.
- Add React Native Testing Library coverage for auth/navigation flows.
- Add screenshots and demo video.
- Add venue admin/backoffice UI.
- Expand validation and rate limiting for all public routes.

## What I Learned

This project helped me practise full-stack mobile development, API design, authentication, external API integration, payment preparation, MongoDB data modelling, and the difference between a working prototype and a maintainable portfolio project.

## Project Context

SportsRadar was my final university project. The current version keeps the original product idea and architecture, then improves reliability, security posture, testability, and documentation so it is easier to run and discuss in junior developer or internship interviews.
