---
name: mongodb-mongoose
description: Work with MongoDB and Mongoose in a rescue project. Use when auditing schemas, connection lifecycle, indexes, validation, ownership rules, duplicate booking prevention, test database setup, and mongodb-memory-server strategy.
---

# MongoDB Mongoose

## Purpose

Keep data models compatible while adding validation, indexes, and test isolation where they reduce real risk.

## When to Use

Use for schema reviews, booking constraints, user ownership checks, database connection helpers, and backend tests.

## Commands and Checklist

- Inspect schemas before changing route logic.
- Use `mongoose.models.ModelName || mongoose.model(...)` where hot reload or repeated imports matter.
- Add indexes for uniqueness/concurrency only when they match existing behavior.
- For tests, prefer `mongodb-memory-server` or a clearly isolated test URI.
- Clean test data between tests and close connections after the suite.
- Validate ObjectIds before `findById` when bad input could throw.

## Common Pitfalls

- App-level duplicate checks are race-prone without an index.
- `select: false` fields must be explicitly selected for password comparison.
- Date/time strings need strict validation before cancellation logic.
- Tests can hang if Mongoose or memory server handles stay open.

## Completion Criteria

- Database connection is owned by server/test setup, not by the Express app module.
- Core routes validate IDs and ownership.
- Duplicate confirmed bookings are prevented.
- Tests run in isolation without a real production database.
