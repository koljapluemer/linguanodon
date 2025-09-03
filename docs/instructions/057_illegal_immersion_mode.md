Let's add a new mode, "Illegal Immersion".

First, READ!!!!!!!!! and repeat the content of [this file](docs/instructions/056_ultrarandom_mode.md). Then, list ALL!!!! files mentioned in that file and summarize them so you understand how modes work.

This mode should like the other be mentioned on the overview page, have its standardized nested route, follow the norms with its widget and so on.

Its flow:

- Choose a [resource](src/entities/resources/ResourceData.ts) which `isImmersionContent` and has `finishedExtracting` false and `lastShownAt` is either more than 5 minutes ago or doesn't exist. You want to USE OR ADD [entity function](src/entities/resources/ResourceRepoContract.ts). I want no post-hoc filtering in memory.
- Keep track of all its vocab and factCards. Shuffle the arrays. Use [array utils](src/shared/utils/arrayUtils.ts)
- Go through at least one task per vocab and factcards. Use [this](src/pages/practice/modes/utils/getRandomGeneratedTaskForVocab.ts) and [this](src/pages/practice/modes/utils/getRandomGeneratedTaskForFactCard.ts) to get the actual tasks
- of course, while doing this, randomly select whether to prefer a fact card or vocab
- after doing this round, do the same again, but this time only for fact cards/and or vocab that is `due` (check entity functions)
- a special thing here: when *scoring* fact cards or vocab, use a special function where the lowest rating leads to overwriting the `due` value of the [factCard](src/entities/fact-cards/FactCardData.ts) or of the [vocab](src/entities/vocab/VocabData.ts) to be right now (as in, stuff that the user gets wrong is immediately do again). You will want to adapt or extend the [entity functions](src/entities/vocab/VocabRepoContract.ts) for this. I want no hacking around with the vocab /factcard data in the task component itself!
- Do this until no more fact cards and no more vocab is due
- Then, show a task that we still have to define: "consume-immersion-content-and-extract-knowledge". It should work rathr like [this resource task](src/pages/practice/tasks/task-resource-extract-knowledge); only the main prompt is "Watch/read this content and see how much you understand", below that is a text area to comment on the experience, which will be persisted as a [note](src/pages/practice/tasks/task-resource-extract-knowledge) attached to the resource, and only below that is a collapsed `<details><summary>` showing the widgets for the user to manage the immersion resource's vocab/fact cards in case the user wants to add some.