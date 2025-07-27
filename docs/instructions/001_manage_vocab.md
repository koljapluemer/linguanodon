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

<!-- add here -->