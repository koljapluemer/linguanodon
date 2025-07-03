# Feature Requirements Document: User Settings & Language Group Helpers

## Purpose
Provide helpers to:
- Get the "opposite" language group for a given language
- Get the first language in a group
- Used for language dropdowns and auto-select logic

## Scope
- Pure utility functions, no side effects
- Accept user settings and canonical languages as arguments
- No DB or UI dependencies

## Requirements
- Must use types from `UserSettings.ts` and `Language.ts`
- Must be fully unit-testable

## Unit/Component Testing
- Each helper is tested for all relevant input scenarios 