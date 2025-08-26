Let's see that [queue](src/pages/queue/PageQueue.vue) can be "played" forever, by making sure [make task](src/pages/queue/lesson-generator/makeTask.ts) always yields something.

As a first step, make a variation of [generating a sentence from words](src/pages/queue/lesson-generator/task-generator/generateVocabFormSentence.ts) based on only a single word. You will have to adapt [the UI](src/tasks/task-vocab-form-sentence/TaskVocabFormSentence.vue) as well.

Then, make an [entity function](src/entities/vocab/VocabRepoContract.ts) returning the vocab(s) with the lowest due date, even if that's in the past not in the future. call it getVocabWithLowestDueDate.

Then, make a [util](src/pages/queue/lesson-generator/utils) `getBackupTask` that uses this function to randomly make a task of forming a sentence with either the one or two "most due" vocab.

Call this from `makeTask` if at the end of the file we still don't have a task.

By the way: finishing or skipping such a task should set the lastSeenAt of both vocab (or just one if we just have one) to now and the due date 5 minutes in the future, without going through classic sR rating. check what we have in regards to entity functions, you may or may not need to add one for this.