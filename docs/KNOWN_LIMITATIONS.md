# Known Limitations

- Stripe webhooks are not fully implemented. Booking creation can verify a PaymentIntent through Stripe retrieval when `REQUIRE_PAYMENT_FOR_BOOKINGS` is enabled, but webhook-driven fulfillment is still the safer long-term design.
- Stripe tests use a mocked Stripe client and do not call the real Stripe API.
- Google Places routes require a real Google API key and are not covered by integration tests.
- Email and Expo push notification delivery are best-effort and depend on external credentials/services.
- Mobile validation is currently a static/config check. It does not replace device testing or React Native Testing Library coverage.
- The committed `android/` folder makes the app Expo prebuild/native-hybrid. Native upgrades should be handled carefully.
- `expo-doctor` still warns that native configuration fields in `app.json` may not sync automatically while native folders are committed. Run `npx expo prebuild` intentionally when native config changes are meant to be regenerated.
- `react-native-keyboard-aware-scroll-view` is reported by Expo Doctor as unmaintained and untested with the New Architecture. Replacing it should be a future mobile polish task.
- NPM reported dependency vulnerabilities after backend install. They need a separate audit pass because some fixes may require breaking upgrades.
- NPM also reports vulnerabilities in the mobile dependency tree after install.
- Screenshots and a demo video are not yet included.
