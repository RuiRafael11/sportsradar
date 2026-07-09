# Known Limitations

- Stripe webhooks are not fully implemented. Booking creation can verify a PaymentIntent through Stripe retrieval when `REQUIRE_PAYMENT_FOR_BOOKINGS` is enabled, but webhook-driven fulfillment is still the safer long-term design.
- Stripe tests use a mocked Stripe client and do not call the real Stripe API.
- Google Places routes require a real Google API key and are not covered by integration tests.
- Email and Expo push notification delivery are best-effort and depend on external credentials/services.
- Mobile validation is currently a static/config check. It does not replace device testing or React Native Testing Library coverage.
- The committed `android/` folder makes the app Expo prebuild/native-hybrid. Expo Doctor currently reports only the native-folder/app-config sync warning; run `npx expo prebuild` intentionally when native config changes are meant to be regenerated.
- NPM reports 13 backend dependency vulnerabilities after install. They need a separate audit pass because some fixes may require breaking upgrades.
- NPM reports 21 mobile dependency vulnerabilities after install.
- Screenshots and a demo video are not yet included.
