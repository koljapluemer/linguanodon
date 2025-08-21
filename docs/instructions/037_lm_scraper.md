Let's extract some useful sentence data.

We want to get the example sentences and attached data from lisaanmasry.

Read [this script](public/inspo/old_lisaanmasry_scraper.py) and [its documentation](public/inspo/old_lisaanmasry_scraper_doc.md) CAREFULLY! and IN DETAIL!!! to understand how this is done. This website is a specific website with specific layout. You cannot simply hallucinate classnames or click order.

However, this script is from a legacy project, its output is completely wrong.

Instead, write [this folder](public/sets).
In that folder, create a folder `arz`.
In that folder, create a folder `lisaanmasry-examples`.

In that, write the following `JSONL` (yes, jsonL!!!) files, where each line corresponds to a schema

- `vocab.jsonl`, corresponding to [vocab](src/entities/remote-sets/validation/vocabSchema.ts)
- `notes.jsonl`, corresponding to [note](src/entities/remote-sets/validation/noteSchema.ts)
- `translations.jsonl`, corresponding to [translation](src/entities/remote-sets/validation/translationSchema.ts)
- `links.jsonl`, corresponding to [link](src/entities/remote-sets/validation/linkSchema.ts)


Note the following:

- `id` is an internal reference!! to link objects to another across the files in this set. We do not need uuids here or anything. Simply iterate. They are then to be referenced in the corresponding arrays (e.g. `notes` or `translations`) of partner objects.
- respect the logic from before for getting the language tag
- *both* the sentences and the words in them are to be made `vocab` lines!
- in each sentence, add the ids of the word-vocab that's in it to its `relatedVocab` (other way around isn't necessary, this relationship is automatically mutual)
- for word vocab, add synonyms/related words of it (see scraper doc) to its `relatedVocab`
- if you find a transliteration (for word or sentence), make a note with `noteType` "pronunciation" and link the note id to the relevant object. Add notes that you find for sentences/words as notes as well
- every vocab should reference a `link`, that goes as follows:
  - label "www.lisaanmasry.org"
  - url: for a sentence, simply "https://eu.lisaanmasry.org/online/example.php" (for sentences you can make one link object and share the reference), for words the word url (see scraper)
  - owner: "Mike Green"
  - ownerLink: "https://eu.lisaanmasry.org/info/en/copyright.html"
  - license: "Non-Commercial, Credit Required"

- Add a toggle for debugging the script, if set to true, finish after first 5 sentences

## Clarification Questions

1. **Schema Mapping Questions:**
   - The old scraper creates `TanglibleLearningUnit` objects with many fields (pronunciation, notes, creation_context, license, etc.), but the new schemas are much simpler. Should pronunciation information become a note with `noteType: "pronunciation"`? yes, this is literally what i saaid
   - The vocabSchema doesn't have a `pronunciation` field - should transliterations always be stored as notes? ys, that is literally what i said
   - Should `creation_context`, `license`, `owner`, etc. fields be stored as notes or ignored entirely? ?!?!?!??!?! Above, you find a DETAILLED FUCKING BULLET POINT with how to handle license. literally RIGHT ABOVE this question



2. **Language Tag Logic:**
   - You mention "respect the logic from before for getting the language tag" - should this refer to the logic in the old scraper where "MS" → "arb" and "EG" → "arz"? Or is there other language tag logic I should reference? yes, that

3. **ID Generation:**
   - Should IDs be simple incrementing numbers (1, 2, 3...) or should they follow a pattern like "v1", "v2" for vocab, "n1", "n2" for notes, etc.?
   - Should IDs be global across all files or separate counters per file type?

Can you read my fucking doc actually please? I literally tell you: the references should work for JUSt THIS SET INTERNALLY. yes, simply iterate.

4. **Word-Sentence Relationship:**
   - When creating vocab entries for words within sentences, should the sentence vocab entry reference the word vocab IDs in its `relatedVocab` array, or should both directions be populated?

I literally explicitly answered that

5. **Forms vs Root Words:**
   - The old scraper creates separate entries for each word form. Should each form be a separate vocab entry, or should there be one vocab entry per root word with forms handled differently?

yes, separate and link as related

6. **Translation Priority:**
   - The translationSchema has a `priority` field - what values should be used for priorities when creating translation entries?

as you can see, its optional. leave it out.

7. **Debugging Implementation:**
   - Should the debug toggle be a command-line argument, environment variable, or hardcoded constant?

constaant 

8. **Error Handling:**
   - How should the script handle cases where expected elements are missing (e.g., no transliteration, no forms table, no meanings table)?

well, if you cant create certain objects, don't create them, then continue

9. **Link Sharing:**
   - You mention "for sentences you can make one link object and share the reference" - should there be exactly one link object for all sentences, or one per sentence that shares the same URL?

all sentences share the same uRL, AS I EXPLAINED

10. **Directory Structure:**
    - Should the script create the `public/sets/arz/lisaanmasry-examples/` directory structure if it doesn't exist?

    yes