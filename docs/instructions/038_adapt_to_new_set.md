Let's rework sets.

Currently, we have a lot of different flavors of remote content which can be downloaded, represented with different tabs on [the download page](src/pages/downloads/PageDownloads.vue) and [with their own types](src/entities/local-sets/flavors).

Let's simplify it.

We will just have one "type" of remote set, but each set will be a folder with multiple files.

Such a folder may have the following JSON*L* files in it:

- links
- notes
- translations
- factCards
- vocab
- resources
- immersionCounts
- goals

Each line of these files corresponds to the relevant zod type defined in files from [this folder](src/entities/remote-sets/validation).

Downloading a set means checking all its files, and taking in that data.
To see which languages exist on remote, just check public/sets/index.json.
To then get the sets for that lang, check a given language folder's index.json

Some notes on conversion.

- `id` on ANY of the remote types does NOT!!!!!!!!!!!, not even a little a bit, correspond to the local `uid`. It may not!! be used to see if a given object already exists.
- instead, decide whether to create a new local object in the following way
  - `VocabData`: match content + language
  - `TranslationData`: match content 
  - `FactCard`: by front + back + language
  - `Goal`: language + title
  - `Resource`: language + title
  - `Immersioncontent`: language + title
  - `Note`: just always make a new one. One note may only have one relation, do not share notes between several objects. However, if a given object already has a note attached with the same content, do not attach another with the same content
  -  

- Note that locally, links are *not* their own entity, but just a shortcut type and are instead integrated directly into their parent objects

## Implementation Questions

### Set Data Structure & Relationship Handling

1. **Cross-references between JSONL files**: The current structure shows that vocab entries reference translations, notes, and links by string IDs (e.g., `"translations": ["1", "2", "2"]`). Should we:
   - Resolve these references during import (creating proper relationships)?
   - Handle missing references gracefully (if a vocab references translation ID "5" but it doesn't exist)?
   - Support duplicate references (e.g., translation ID "2" appears multiple times in the vocab's translation array)?

Yes, use these ids to resolve relationships and correctly store them. All arrays with references should be free of duplicates. If a given id refers to something that doesn't exist, console.warn and skip this object, do not add it to the relationship array (which you can't anyways, becaus you can't know the uid for a non-existing local object)

2. **Link integration strategy**: Since links are not their own local entity but are integrated into parent objects, should we:
   - Resolve link IDs from links.jsonl during import and embed the full Link objects into vocab/resources/etc?
   - Create a helper function to resolve link references when processing each entity type?
   - Handle cases where multiple entities reference the same link ID?

- just put them correctly in the local type defined as entities/*/*Data.ts

3. **Note relationship model**: Given that notes can be referenced by multiple entity types (vocab, translations, resources, etc.), should we:
   - Create separate note instances for each reference (to maintain the "one note may only have one relation" rule)?
   - Share note instances but track which entity "owns" each note?
   - How do we handle the `showBeforeExercice` flag when the same note is referenced by different entities?

do not share ANY references. If one note with showBeforeExercise and is referenced by multiple objects, obviously, simply create multiple notes with showBeforeExercise true?!

### Import Processing & Duplicate Detection

4. **Import order dependencies**: Since entities reference each other by ID, what should be the processing order?
   - Should we process all notes and translations first, then vocab/resources that reference them?
   - How do we handle circular references or complex dependency chains?

Just make sure all possible relations are understood

5. **Duplicate detection edge cases**: For the specified matching criteria:
   - **VocabData** (match content + language): What happens if content matches but other fields (like priority, notes) differ significantly?
   - **TranslationData** (match content): Should we merge all fields or just create relationships?
   - **Notes** (same content check): How do we handle slight variations in content (whitespace, capitalization)?

- content+language *detects* whether 2 vocab objects should be the same
- of so, *integrate them*
- add priority
- merge arrays of all kind so they include all elements from both (non-duplicated)
- for fields that cannot be resolved, local wins

6. **Origins tracking**: When updating existing entities, should we:
   - Always add the new set to origins even if no other data changes?
   - Only increment priority if the set isn't already in origins?
   - Handle cases where the same set is imported multiple times?

- yes, always add the origin.
- yees, only increment prio if set is new
- if a set is downloaded multiple times, nothing should happen (except if local entities from the set were deleted in the mean time, then they will be replaced, or if the remote set was changed). If the implementation works, they need NOT be any special handling for this

### Technical Implementation

7. **Error handling strategy**: How should we handle partial import failures?
   - If processing vocab.jsonl succeeds but translations.jsonl fails, should we rollback the vocab imports?
   - Should we continue processing other files if one fails?
   - How do we report which specific entities failed to import?

- Validate all files before writing anythiing to local. if fail, console.error. 

8. **Performance considerations**: For large sets with thousands of entities:
   - Should we process JSONL files in batches or all at once?
   - Do we need progress indicators for long-running imports?
   - Should we implement any caching for frequently accessed entities during import?

For now, just KISS

9. **Migration strategy**: How do we handle the transition period?
   - Should we keep the old download widgets functional until all sets are migrated to the new format?
   - Do we need a migration tool to convert existing downloaded sets to the new system?
   - How do we handle users who have already downloaded sets using the old system?

No transition period. No migration. Just throw away the old version. assume that i just reset the db.