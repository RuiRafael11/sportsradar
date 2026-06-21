# Architecture

## Overview

SportsRadar is a two-package repository:

- `backend/`: Express API with MongoDB persistence and third-party integrations.
- `mobile/`: Expo React Native app with auth-aware navigation and API clients.

## Runtime Flow

```text
Mobile screens
  -> AuthContext stores token in AsyncStorage
  -> Axios API clients attach Bearer token
  -> Express routes validate/authenticate requests
  -> Mongoose models persist users, venues, bookings, and venue extras
  -> External services are called where needed
```

## Backend

The backend is split so tests can import the Express app without starting a server:

- `backend/app.js`: creates middleware, routes, healthcheck, 404, and error handler.
- `backend/server.js`: validates required env, connects to MongoDB, and listens on `PORT`.
- `backend/index.js`: compatibility entrypoint that delegates to `server.js`.

Main route groups:

- Auth: register, login, current user, profile updates.
- Bookings: current user's bookings, booking creation, cancellation.
- Payments: Stripe PaymentSheet setup and PaymentIntent retrieval.
- Places/geo: Google Places proxy endpoints.
- Venues and venue extras: internal venue data and extra details.

## Data Model

- `User`: profile, email, hashed password, legal acceptance timestamps, preferences, optional Expo push token.
- `Venue`: internal sports facility metadata and optional amenities.
- `VenueExtra`: additional details keyed by Google Places IDs.
- `Booking`: user, internal or Google venue ID, copied venue display metadata, date/time, payment fields, and status.

Confirmed bookings have a unique partial index on `venueId`, `date`, and `time` to reduce overbooking risk.

## Mobile

The mobile app uses:

- `App.js` for root navigation, authenticated tabs, and Stripe provider setup.
- `src/context/AuthContext.js` for token persistence and auth state.
- `src/services/api.js` for authenticated backend requests.
- `src/stripe/api.js` for payment endpoints.
- `src/config/env.js` for public Expo config values.

Because `mobile/android/` is committed, treat this as an Expo prebuild/native-hybrid project. Avoid regenerating native files unless intentionally updating native configuration.

## Configuration

Backend secrets live in `backend/.env` and are documented by `backend/.env.example`.

Mobile public config lives in `mobile/.env` and is documented by `mobile/.env.example`. Expo public variables are bundled into the app and must not contain server-only secrets.
