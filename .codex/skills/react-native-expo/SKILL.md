---
name: react-native-expo
description: Rescue a React Native Expo mobile app. Use when auditing Expo config, native/prebuild state, API base URLs, navigation, auth persistence, Stripe provider config, imports, and non-invasive mobile validation checks.
---

# React Native Expo

## Purpose

Make the mobile app configurable and less crash-prone while preserving the existing screens and navigation.

## When to Use

Use for Expo config, app startup, navigation, API clients, auth flows, Stripe client setup, and mobile smoke/static checks.

## Commands and Checklist

- Inspect `app.json`, `package.json`, `App.js`, API clients, auth context, and screen route params.
- Remove LAN IPs from source; prefer `EXPO_PUBLIC_API_BASE_URL`.
- Put sample public values in `mobile/.env.example`; never commit private keys.
- Treat committed `android/` as Expo prebuild/native-hybrid evidence.
- Keep app startup tolerant when optional public env values are absent.
- Run `npm install`, `npx expo-doctor` if available, and a static import/config check when feasible.

## Common Pitfalls

- Expo public env vars are bundled into the client; they are not secrets.
- Stripe publishable keys are public but should still be examples/placeholders in repo templates.
- `Constants.expoConfig.extra` can be missing in some runtimes.
- Starting Metro can block forever; use non-blocking smoke checks unless the user asks to run it interactively.

## Completion Criteria

- Mobile API and Stripe clients read env consistently.
- `mobile/.env.example` documents required values.
- No hardcoded local IP remains in mobile source/config.
- README commands match the actual Expo workflow.
