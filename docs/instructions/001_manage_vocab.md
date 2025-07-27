# Managing Vocab

## Main Targets

- allow learner insights into their vocab
- allow learners to add more vocab
- allow learners to edit existing vocab

## Inspiration

- We have a lot of this code already built, in legacy (note: different underlying types)
- especially the UI we can yoink
- Check the following paths: `legacy/pages/list-words/PageListWords.vue`, `legacy/pages/manage-words/PageManageWords.vue`

## Target Files

- make the following pages: one for listing the vocab, one for editing/adding (use clean logic here)
- in the entity `Vocab`, make a function (should already exist as a mock) that returns vocab *paginated*. Research the internet if Dexie.db has recommendations here.
- make the actual list rendering a feature, we will have other places where we'll render vocab. Think about where it makes sense to place the pagination logic, but ensure that at least at some point we have a fairly dumb component that just renders a list of vocab with its core properties
- make the big form where you can edit vocab also its own feature, which also handles its own save-to-db (via the injected vocab repo, ofc)
- ensure all props of the types can be edited and are persisted
- add both of these to the router, link to the list in the page header


## Clarification Questions

### Pagination Strategy
- Should we implement cursor-based pagination (recommended for Dexie performance) or simple offset/limit pagination for the MVP?

Decide yourself: The usecase is that we want to have a page that can theoretically display all of the users vocab, but we can't load all at once

- What's the expected max vocab size? If <1000 items, offset pagination might be acceptable for simplicity

May, in the long run, be 100k. However, the user may still want to search in the whole db (from the list view) or go all the way back to the first added vocab fairly regularly

### Repo Interface
- Should I extend `VocabAndTranslationRepoContract` with pagination methods like `getVocabPaginated(cursor?: string, limit: number)`, or implement pagination in a feature layer?

I think it should work on entity level, because it's directly tied to dexie, right? And dexie should not be exposed outside the entity.

- Do we want search/filtering to work with pagination, or keep them separate?

Please integrate search + filtering.


### Translation Handling
- In legacy code, translations are separate entities with IDs. Should the vocab list component show full translation content by resolving IDs, or just show translation count/summary?

For now, a translation count is fine. We will attack that in a future feature

- Should editing vocab allow inline translation management, or navigate to separate translation editing?

Again, just show the count for now

### UI Structure
- Should we follow the legacy pattern of level badges (0-9) showing FSRS progress, or simplify for the MVP?

Please strictly follow the currently defined interface at `src/entities/vocab/vocab/VocabData.ts`. No level badges for now. You can display the mastery as a progress bar.

- Do we want bulk operations (select multiple vocab for batch editing/deletion)?

Not now.

### Feature Location
- Should the vocab list feature live in `features/vocab-management/` or split into `features/vocab-list/` and `features/vocab-form/`?

Every feature should be one action, so put each in their own folder

- Should pagination logic be in the feature or shared utility?

Please read the `README` in top level folder. `shared/` may not contain business logic. If you have a reason to put abstract pagination logic in there, fine. But I don't think you have any reason to? Manage pagination in the entity, in the list feature, or in the page, whatever makes sense.

### Router Integration
- Should we follow REST-like routes (`/vocab`, `/vocab/new`, `/vocab/:id/edit`) or different pattern?
- Do we need deep linking for pagination/search state?

- REST-like is fine. 
- If deep linking works SANELY without hacks with vue-router, use it. Otherwise you may discard pagination state on page change.