let's improve [fact cards](/home/b/GITHUB/linguanodon/src/entities/fact-cards/FactCardData.ts).

As a first order of business, note that I added a `links` prop; that has to be honored in the various places we're about to edit.

First, let's move [the factcard mng page](src/pages/fact-cards-manage/PageManageFactCard.vue), into two pages, one for adding, one for edit, following the same pattern as vocab:

- [like here](src/pages/vocab-add), adding works via a standard form. In this case, for adding, show lang, front and back
- then, the full props can be edited with the inline edit paradigm like [here](src/pages/vocab-edit)

It's not necessary to split fact cards into basic/advanced props, since it's not so many props. use the proper existing patterns for notes and links.

Now let's give fact cards some tasks.

- add to [task registry](src/widgets/do-task/taskRegistry.ts): `fact-card-try-to-remember` and `fact-card-reveal`
- they should work just like vocab-try-to-remember and vocab-reveal-* (give them their own task renderer components which should just like their vocab sister components, only for fact cards)

- build out [this](src/pages/queue/generate-task/by-entity/fact-card/getRandomGeneratedTaskForFactCard.ts), again mirroring [this](src/pages/queue/generate-task/by-entity/vocab/getRandomGeneratedTaskForVocab.ts), but much simpler: unseen fact cards (feel free to add [repo functions](src/entities/fact-cards/FactCardRepoContract.ts) mirroring the [vocab repo](src/entities/vocab/VocabRepo.ts)) get try-to-remember, all others get reveal tasks. 
- Integrate both as possible small tasks [here](src/pages/queue/generate-task/flavors/by-task-size-balance/helpers/getRandomSmallTask.ts)

Use [md rendering for front and back](/src/shared/ui/MarkdownRenderer.vue) to render front and back