# Feature: Add/Remove/Promote/Demote Languages in User Preferences

## Overview
Allow users to add or remove languages from their primary/secondary native/target lists, and to move languages between primary and secondary within each group.

## Requirements
- UI and logic for adding a language to any of the four lists (primary/secondary native/target).
- UI and logic for removing a language from any list.
- UI and logic for promoting/demoting a language between primary and secondary (not granular reordering).
- Prevent duplicate entries across all lists.
- All changes are persisted to Dexie and reflected in composables.

## Tests (to be written before implementation)
- Can add a language to any list (if not already present).
- Can remove a language from any list.
- Can promote/demote a language between primary and secondary.
- Cannot add a language already present in any list.
- Changes are persisted and reflected reactively. 