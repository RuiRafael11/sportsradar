---
name: node-express-api
description: Rescue and harden a Node.js Express API. Use when splitting app/server startup, adding environment validation, consistent errors, health checks, CORS, route validation, and testable Express app exports.
---

# Node Express API

## Purpose

Make the API importable, testable, configurable, and predictable without replacing the existing architecture.

## When to Use

Use for backend startup refactors, route fixes, middleware changes, API tests, dependency cleanup, and command/script improvements.

## Commands and Checklist

- Keep route behavior compatible unless the audit documents a necessary breaking change.
- Split startup into `app.js` for the Express instance and `server.js` for database connect/listen.
- Keep `index.js` as a compatibility shim when older README/scripts point to it.
- Add `GET /api/health`.
- Validate required env before server start; avoid fallback secrets.
- Use consistent `{ msg }` error responses.
- Ensure async route failures return controlled HTTP responses.
- Run `npm install`, `npm test`, and a non-blocking startup smoke check after major changes.

## Common Pitfalls

- Starting `app.listen` during tests makes Supertest brittle.
- Reading env once at module load can break tests that set env later.
- Express 5 handles promises differently, but explicit `try/catch` is still clearer in legacy routes.
- CORS `origin: true` is too permissive for portfolio-ready defaults.

## Completion Criteria

- API can be imported without opening a port.
- `npm start` and `npm run dev` use documented entrypoints.
- Missing required env produces a clear startup error.
- Tests can call routes through Supertest.
