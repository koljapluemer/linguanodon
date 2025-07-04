# Feature Requirements Document: ConnectUnitOfMeaningAsTranslation.vue Modal Frame

## Purpose
Create a presentational modal for connecting an existing UnitOfMeaning as a translation, using mock data. This component will serve as the UI for searching and selecting a translation, but will not implement real data logic yet.

## Scope
- Renders a modal using DaisyUI modal components.
- Contains a search input and a mock dropdown of results (mock `UnitOfMeaning` objects).
- Has "Confirm" and "Cancel" buttons (no real actions).
- Accepts a prop for the "opposite" language group, but uses mock data.
- No data persistence or business logic at this stage.

## Requirements
- Use DaisyUI modal, input, and button components.
- Use Tailwind for layout and spacing.
- Modal should be centered and responsive.
- All UI elements should be accessible.
- KISS: Keep the component simple and idiomatic.

## Unit/Component Testing
- Modal opens/closes correctly (via prop or state).
- Search input and dropdown are present.
- Buttons are present and enabled.
- Snapshot/component test for visual structure. 