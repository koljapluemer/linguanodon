Let's distinguish between [Vocab](src/entities/vocab/vocab/VocabData.ts) with length "word" and "sentence" a bit better.

As a first step, I have changed the allowed [lengths](src/shared/Length.ts) to a simple type and only included "sentence" and "word".

Run linter and build and see what breaks; add all affected files to the bottom of this file with a one-sentence explanation of how vocab length is used in that context

## Improvements

As a first step, let's make an alternative task for new (unseen) vocab of type `sentence`. such vocab must also have content and at least one translation and honor language list and vocab block list (probably make your own [entity fn](src/entities/vocab/VocabRepoContract.ts), orienting yourself on similar functions). Should have its own UI in src/tasks, own [random gen](src/pages/queue/lesson-generator/utils), own [task generator](src/pages/queue/lesson-generator/task-generator)). It should be called guess-what-sentence means. Show the vocab's content and a lg textarea where the user can input what they think the sentence means. As soon as they have written at least 1 char in the textarea they can "Reveal" and see the translation. They can then simply click done, at which point a new progress object is created and all that, just like new vocab is usually initialized.

*In turn*, *disable* [try-to-remember](docs/reference/tasks/vocab-try-to-remember.md) for vocab of type sentence (only allow for unspecified and word length)

Next improvement: In a [vocab-focussed task](src/pages/queue/lesson-generator/utils/makeTaskWithFocusOnVocab.ts) we are currently trying to get a task directly related to the focus vocab first thing. This is fine for `vocab` and `unspecified`, but let's turn that around for `sentence`: If it's a sentence, try to get *all related* vocab done and only use the `sentence` once the related stuff yields nothing


Now, let's do something bigger:

- disable the current choose-from-x tasks for sentences ( [this](src/tasks/task-vocab-single-choice/TaskVocabChooseFromOptions.vue), but on generator/selection level), only allow it for length `word` or `unspecified`. Make sure that's reflected in all files that try to make such a task, you may also adapt entity functions to smarltly select vocab for this

- Adapt how [cloze](src/tasks/task-cloze-choice/TaskClozeChooseFromOptions.vue) works. First, it should only ever be generated for `sentence` (should already be implemented). Use the `progress.level` of the vocab data to determine which word of the sentence should be clozed (0 = first word, 1 = second word) and so on — if the vocab has less words than the level asks for, start again at the beginning but cloze two words. For example, level 3 on a vocab of type sentence with 4 words should mean the fourth word is clozed (0 index!), while on level 5 it should cloze word with index 1 together with word of index 2. If the level is above 6, do NOT generate cloze exercises for this vocab, instead, randomly generate either [this reveal](docs/reference/tasks/vocab-reveal-native-to-target.md) or [this reveal](docs/reference/tasks/vocab-reveal-target-to-native.md). Make sure that's reflected everywhere where its relevant, which may be a lot of places throughout task gen utils where vocab is used. You may adapt entity functions.
