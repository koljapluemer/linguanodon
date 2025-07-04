# Feature Requirements Document: UnitOfMeaningForm.vue Graphical Frame

## Purpose
Create a presentational form for a UnitOfMeaning, using mock data. This component will serve as the core form for editing or viewing a unit of meaning, but will not implement real data logic yet.

## Scope
- Receives a mock `UnitOfMeaning` object as a prop (conforming to the type).
- Renders all fields as disabled inputs (text, textarea, etc.).
- Renders a language dropdown with four optgroups (primary/secondary, target/native), using mock `UserSettings` and `Language` data.
- Accepts a `showTranslations` boolean prop. If true, renders a placeholder for the translations widget.
- No data persistence or business logic at this stage.

## Requirements
- Use DaisyUI form and input components.
- Use Tailwind for layout and spacing.
- All fields should be disabled/read-only for now.
- Language dropdown should show four optgroups, each with at least one mock language.
- If `showTranslations` is true, render a visible placeholder for the translations widget.
- KISS: Keep the component simple and idiomatic.

## Unit/Component Testing
- Renders all fields from mock data.
- Language dropdown shows correct optgroups and options.
- `showTranslations` toggles the placeholder.
- Snapshot/component test for visual structure. 