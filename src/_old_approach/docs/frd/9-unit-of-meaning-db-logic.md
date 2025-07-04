# Feature Requirements Document: UnitOfMeaning DB Logic

## Purpose
Provide all data access and mutation logic for units of meaning, including CRUD operations and translation linking, using Dexie as the source of truth.

## Scope
- Functions to create, read, update, and delete UnitOfMeaning records in Dexie.
- Functions to add and remove translation UIDs from a UnitOfMeaning.
- Function to fetch a UnitOfMeaning by UID.
- All logic is self-contained and does not depend on UI components.

## Requirements
- All functions must be asynchronous and return Promises.
- Must use types from `UnitOfMeaning.ts`.
- Must be fully unit-testable (mock Dexie in tests).
- No side effects outside Dexie.

## Unit/Component Testing
- Each function is tested for correct DB interaction and error handling.
- Translation linking functions are tested for correct UID array updates. 