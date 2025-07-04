# Feature Requirements Document: Auto-Save UnitOfMeaning Composable

## Purpose
Provide a composable for auto-saving a UnitOfMeaning form, with debounced save, status tracking (unsaved, saving, saved, error), and error handling.

## Scope
- Accepts a reactive UnitOfMeaning object and a save function.
- Watches for changes, debounces save, and updates status.
- Exposes status (unsaved, saving, saved, error) and last error.
- No UI logic; can be used in any form.

## Requirements
- Debounce interval is configurable.
- Must use types from `UnitOfMeaning.ts`.
- Must be fully unit-testable (simulate changes and save errors).

## Unit/Component Testing
- Status transitions are tested for all change/save/error scenarios.
- Debounce logic is tested. 