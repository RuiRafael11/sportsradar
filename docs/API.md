# API Reference

Base URL: `/api`

Responses generally use JSON. Errors generally include `{ "msg": "..." }`.

## Health

- `GET /health`
  - Returns `{ ok, env }`.

## Auth

- `POST /auth/register`
  - Body: `name`, `email`, `password`, `acceptedTerms`, `acceptedPrivacy`.
  - Returns: `{ token, user }`.

- `POST /auth/login`
  - Body: `email`, `password`.
  - Returns: `{ token, user }`.

- `GET /auth/me`
  - Requires: `Authorization: Bearer <token>`.
  - Returns the authenticated user without password.

- `PATCH /auth/me`
  - Requires auth.
  - Body may include `name`, `password`, `pushToken`/`expoPushToken`, `preferences`.
  - Returns updated user without password.

## Bookings

- `GET /bookings/my`
  - Requires auth.
  - Returns the authenticated user's bookings.

- `POST /bookings`
  - Requires auth.
  - Body:
    - `venueId` required. Can be an internal MongoDB ObjectId or a Google-style ID such as `g:<place_id>`.
    - `date` required, `YYYY-MM-DD`.
    - `time` required, `HH:mm`.
    - `amount` required/validated as a positive integer in cents.
    - `currency` defaults to `eur`.
    - Google Places bookings should include `venueName` and optional display metadata.
    - When `REQUIRE_PAYMENT_FOR_BOOKINGS` is not `false`, `paymentIntentId` is required and verified through Stripe.
  - Returns the created booking.
  - Duplicate confirmed bookings for the same venue/date/time return `409`.

- `DELETE /bookings/:id`
  - Requires auth.
  - Only the booking owner can cancel.
  - Bookings less than 24 hours away cannot be cancelled.

## Payments

- `GET /payments/ping`
  - Returns whether Stripe secret/publishable keys are configured.

- `POST /payments/payment-sheet`
  - Requires auth.
  - Body: `amount`, `currency`, optional `customerEmail`.
  - Creates a Stripe customer, ephemeral key, and PaymentIntent for PaymentSheet.

- `POST /payments/capture`
  - Requires auth.
  - Body: `paymentIntentId`.
  - Retrieves PaymentIntent status and receipt URL where available.

## Places and Geo

- `GET /places/ping`
  - Returns whether a Google Places key is configured.

- `GET /places/search?lat=<n>&lng=<n>&radius=<m>&keywords=a,b`
  - Proxies Google Places nearby search and maps results into mobile venue cards.

- `GET /geo/ping`
  - Returns whether a Google Places key is configured.

- `GET /geo/suggest?q=<query>`
  - Returns autocomplete suggestions for Portugal.

- `GET /geo/place?placeId=<id>`
  - Returns place name and coordinates.

## Venues

- `GET /venues`
  - Lists internal venues.

- `GET /venues/:id`
  - Returns one internal venue.

## Venue Extras

- `GET /venue-extras/:placeId`
  - Returns stored extra details for a Google Places ID.

- `POST /venue-extras`
  - Requires `x-admin-key`.
  - Upserts details for a `placeId`.

- `POST /venue-extras/bulk`
  - Body: `placeIds`.
  - Returns matching extra details.
