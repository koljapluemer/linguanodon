# Adding a Learning Goal from Remote

This feature enables users to download a learning goal and its associated units of meaning (and their direct translations) from a remote server into their local Dexie database, with full undo/redo support.

## High Level Overview

- We need a page tabulating learning goals from our remote database
- We should make a view where we get the `Language` code from the url

## Backend

- The backend provides simple JSON files
- To get learning goals, we can simply GET an url like `https://scintillating-empanada-730581.netlify.app/learning_goals/$language_tag/index.json` 
- The returned data conforms to an array of [this type](../src/modules/learning-goals/types/LearningGoalSummary.ts)

## Workflow

1. **User Action**: User clicks the download button for a learning goal not yet in their local DB.
2. **Fetch Phase**: The app fetches the full learning goal, all referenced units of meaning, and all direct translations of those units from the remote API. If any fetch fails, the process aborts and nothing is written to the DB.
3. **Validation**: Before writing, the app checks which items (learning goal, units, translations) are not already present in Dexie. Existing items are skipped, and the user is notified by name/content (not UID).
4. **Atomic Write**: All new items are written to Dexie in a single transaction. If any part fails, nothing is written.
5. **Undo/Redo**: The entire operation is wrapped as a single undoable `Operation`. Undo removes only the items that were just added, not those that existed before.
6. **User Feedback**: Toasts inform the user of success, skips, errors, and provide an undo button. Technical details are logged to the console.


## Integration with Undo/Redo

- The download is a single atomic `Operation` in the global undo/redo stack.
- Undo removes only the items that were newly added by this operation.
- Redo re-adds them (if needed in the future).


## Design Notes

- **All-or-Nothing**: No partial writes. If any fetch or DB write fails, the process aborts.
- **No Concurrency**: Only one download can be in progress at a time to keep undo/redo simple.
- **User Feedback**: All user-facing messages use names/content, not UIDs. Dev details go to the console.
- **Extensibility**: The composable is structured for easy unit testing and future concurrency support.
