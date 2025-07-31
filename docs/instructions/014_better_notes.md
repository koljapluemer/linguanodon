# Better Notes

The user is currently able to add notes to vocab (see [form](src/features/vocab-form)).

So far, notes were directly within the [vocab type](src/entities/vocab/vocab/VocabData.ts), like so:

```
  notes: Array<{
    content: string;
    showBeforeExercise: boolean;
  }>;
```

I want to abstract notes into its own entity, with its own type (already defined [here](src/entities/notes/NoteData.ts)), its own repo, its own repo contract.
Also, in its entity folder, we want some fairly dumb components (only props and emits, no repo access): one for managing a single note, one for managing a single note and the user is able to set whether to show note before exercise (this prop will not be relevant for every context), and one for managing a list of notes (where we pass a prop whether the individual ones should show the `showBeforeExercise` option).

The `Vocab` type should then just store an array of note uids, and utilize the aforementioned components in its form.

## Clarification Questions

1. **Migration Strategy**: How should we handle existing vocab entries that have inline notes? Should we:
   - Create a migration script that runs automatically on app startup?
   - Migrate notes on-demand when vocab entries are accessed?
   - Provide a manual migration tool?

Assume no previous data. Database will be reset. Put some demo with the new note structure in `src/shared/demo-data/demo.json`

2. **Note Ownership**: Should notes be:
   - Owned exclusively by one vocab entry (deleted when vocab is deleted)?
   - Potentially shared between multiple vocab entries?
   - Have their own lifecycle independent of vocab entries?

Assume lifecycle on their own.

3. **Note Repository Scope**: Should the note repository:
   - Handle only basic CRUD operations?
   - Include search/filtering capabilities (e.g., find notes by content)?
   - Support bulk operations for performance?

Basic CRUD.

4. **Component API Design**: For the note components, should we:
   - Use v-model for two-way binding on note content?
   - Emit individual change events for each field?
   - Pass the entire note object or individual fields as props?

Pass entire note or notes for the group component

5. **Error Handling**: How should we handle cases where:
   - A vocab references a note UID that no longer exists?
   - Note save operations fail during vocab form submission?
   - The note repository is unavailable?

Simply do not show this note. Why would note operations fail? We are using a local db. In that case, throw an error in console and continue.
Assume that the app isn't fucking broken completely and the note repository was not forgotten in the code. [Inject](src/app/injectRepositories.ts) it.

6. **Performance Considerations**: For vocabs with many notes, should we:
   - Load all notes eagerly when loading a vocab?
   - Implement lazy loading for notes?
   - Cache notes in memory after first load?

Vocab have like 5 notes max usually. None of this is necessary.