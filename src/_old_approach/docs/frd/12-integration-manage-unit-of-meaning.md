# Feature Requirements Document: Integration - Manage Unit of Meaning Workflow

## Purpose
Pull together all logic and UI for the full manage unit of meaning workflow, from list to form to translation management, using the previously defined composables and helpers.

## Scope
- Container/component logic for:
  - Fetching and updating a unit by UID
  - Passing data to UnitOfMeaningForm and TranslationsWidget
  - Handling add/remove/edit translation flows
  - Auto-save and status
  - Language dropdown and auto-select logic
- Integration of all composables and helpers

## Requirements
- All data flows must be reactive and robust to errors
- All UI state (loading, error, empty, ready) must be handled
- Must use only the composables/helpers defined in previous FRDs
- No business logic in presentational components

## Integration Testing
- End-to-end tests for the full workflow: edit, auto-save, add/remove translation, language selection, and error handling 