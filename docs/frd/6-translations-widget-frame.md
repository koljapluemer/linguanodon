# Feature Requirements Document: TranslationsWidget.vue Graphical Frame

## Purpose
Create a presentational widget for displaying and managing translations of a UnitOfMeaning, using mock data. This component will serve as the translation management UI, but will not implement real data logic yet.

## Scope
- Receives a mock list of translation `UnitOfMeaning` objects as a prop.
- Renders a zebra table with one row per translation.
- Each row has mock "Remove" and "Edit" buttons (no actions yet).
- Renders two buttons below the table: "Add Existing Word or Sentence as Translation" and "Add new Word or Sentence as Translation" (no modals yet).
- No data persistence or business logic at this stage.

## Requirements
- Use DaisyUI table and button components.
- Use Tailwind for layout and spacing.
- Table should be visually clear and accessible.
- Buttons should be present and styled, but not functional.
- KISS: Keep the component simple and idiomatic.

## Unit/Component Testing
- Table renders correct number of rows from mock data.
- All buttons are present and enabled.
- Snapshot/component test for visual structure. 