# Feature: Contextual Language Dropdowns

## Overview
Provide a composable/helper to generate dropdown options for language selection, context-dependent (e.g., only show languages not already selected in any user list).

## Requirements
- Composable/helper to generate dropdown options for adding a language to a specific group (primary/secondary native/target).
- Exclude languages already present in any of the user's four lists.
- Use canonical language list for options (tag, englishName, nativeName).
- Support filtering/searching in the dropdown.

## Tests (to be written before implementation)
- Dropdown options exclude already-selected languages.
- Options are grouped/contextual (e.g., only show addable languages for the target group).
- Options display correct names from canonical list.
- Filtering/searching works as expected. 