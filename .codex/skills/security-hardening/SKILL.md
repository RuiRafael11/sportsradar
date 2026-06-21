---
name: security-hardening
description: Harden a student full-stack project for portfolio use. Use when removing fallback secrets, documenting env variables, configuring CORS, rate limits, headers, auth ownership checks, validation, and secret scanning.
---

# Security Hardening

## Purpose

Reduce obvious security risks while keeping the app easy for reviewers to run locally.

## When to Use

Use for JWT handling, env validation, CORS, rate limiting, headers, input validation, ownership checks, and secret scans.

## Commands and Checklist

- Search for hardcoded secrets, API keys, IP addresses, and fallback credentials.
- Require `JWT_SECRET` for signing and verifying tokens.
- Configure CORS from `CORS_ORIGIN`/env instead of reflecting all origins by default.
- Add security headers with `helmet` where compatible.
- Keep rate limiting on auth and sensitive routes.
- Ensure user responses never include password fields.
- Add `.env.example` files with placeholders only.

## Common Pitfalls

- Publishable client keys are public, but real project-specific values still look unprofessional in repo config.
- Overly strict CORS can break mobile development; document comma-separated origins and allow unset dev defaults carefully.
- Error messages should help developers without leaking stack traces in production.

## Completion Criteria

- No insecure JWT fallback remains.
- No real secret values are committed.
- CORS and env behavior are documented.
- Authenticated routes enforce ownership where appropriate.
