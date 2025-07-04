# Feature: User Language Preferences Dexie Table

## Overview
Define a Dexie table to store per-user language preferences (primary/secondary native/target languages). Expose composables for reading and updating these preferences.

## Requirements
- Dexie table for user language preferences, matching the UserSettings interface.
- Migration from any existing localStorage data (if present).
- Composables for reading and updating user language preferences.
- All changes are persisted immediately to Dexie.

## Tests (to be written before implementation)
- Table is created with correct schema.
- Can read and write user language preferences.
- Migration from localStorage (if any) works and is idempotent.
- Composables reflect changes reactively.
- Data persists across reloads. 