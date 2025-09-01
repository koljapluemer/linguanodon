let's improve [fact cards](/home/b/GITHUB/linguanodon/src/entities/fact-cards/FactCardData.ts).

As a first order of business, note that I added a `links` prop; that has to be honored in the various places we're about to edit.

First, let's move [the factcard mng page](src/pages/fact-cards-manage/PageManageFactCard.vue), into two pages, one for adding, one for edit, following the same pattern as vocab:

- [like here](src/pages/vocab-add), adding works via a standard form. In this case, for adding, show lang, front and back
- then, the full props can be edited with the inline edit paradigm like [here](src/pages/vocab-edit)

It's not necessary to split fact cards into basic/advanced props, since it's not so many props. use the proper existing patterns for notes and links.