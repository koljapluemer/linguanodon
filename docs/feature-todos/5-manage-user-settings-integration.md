# Feature: ManageUserSettings.vue Integration

## Overview
Integrate all language management logic (fetch, cache, user prefs, add/remove/promote/demote, dropdowns) into the ManageUserSettings.vue page.

## Requirements
- Display current user language preferences (primary/secondary native/target).
- Allow adding/removing/promoting/demoting languages via UI.
- Use contextual dropdowns for adding languages.
- Show canonical language names in UI.
- All changes are reactive and persisted.
- Manual refresh for canonical language list.
- Handle loading and error states gracefully.

## Tests (to be written before implementation)
- UI displays current user language preferences correctly.
- Can add/remove/promote/demote languages via UI.
- Dropdowns show correct, filtered options.
- Manual refresh updates canonical list and UI.
- All changes are reactive and persisted.
- Loading and error states are handled gracefully. 