---
name: stripe-payments
description: Safely audit and repair Stripe PaymentSheet flows. Use when handling Stripe env variables, PaymentIntent creation/retrieval, webhook limitations, mocked tests, and avoiding committed secret keys or trusted client payment claims.
---

# Stripe Payments

## Purpose

Keep payments in sandbox/test mode and improve safety without requiring real Stripe network calls during tests.

## When to Use

Use for backend payment routes, mobile Stripe client setup, payment-to-booking checks, env examples, and payment limitations docs.

## Commands and Checklist

- Ensure `STRIPE_SECRET_KEY` is server-only and absent from committed examples except placeholder names.
- Use `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` only for client publishable test values/placeholders.
- Validate amount, currency, and PaymentIntent IDs.
- Prefer verifying `paymentIntent.status === "succeeded"` before confirming paid bookings.
- Mock the Stripe client in tests.
- Add webhook support only if it can be verified; otherwise document the limitation and fallback.

## Common Pitfalls

- Client-provided `paymentIntentId`, `amount`, or `receiptUrl` can be forged.
- Creating the Stripe client at module load with an empty key complicates tests.
- Real Stripe calls make CI flaky and unsafe.
- Webhooks require raw body parsing for signature verification.

## Completion Criteria

- No Stripe secret is committed.
- Payment routes validate inputs and have mocked tests.
- Known webhook/payment verification limitations are documented.
