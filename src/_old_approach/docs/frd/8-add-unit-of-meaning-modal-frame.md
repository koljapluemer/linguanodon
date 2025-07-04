# Feature Requirements Document: AddUnitOfMeaningAsTranslation.vue Modal Frame

## Purpose
Create a presentational modal for adding a new UnitOfMeaning as a translation, using mock data. This component will serve as the UI for creating a new translation, but will not implement real data logic yet.

## Scope
- Renders a modal using DaisyUI modal components.
- Contains a nested `UnitOfMeaningForm` (with mock data, `showTranslations=false`).
- Has "Save" and "Cancel" buttons (no real actions).
- Language dropdown in the nested form auto-selects a mock language from the "opposite" group.
- No data persistence or business logic at this stage.

## Requirements
- Use DaisyUI modal, form, and button components.
- Use Tailwind for layout and spacing.
- Modal should be centered and responsive.
- All UI elements should be accessible.
- KISS: Keep the component simple and idiomatic.

## Unit/Component Testing
- Modal opens/closes correctly (via prop or state).
- Nested form is rendered with correct props.
- Buttons are present and enabled.
- Snapshot/component test for visual structure. 