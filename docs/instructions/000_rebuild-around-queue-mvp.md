# Rebuilding Around Queue MVP

- Let's build this app's structure anew around an exercise+task queue paradigm
- old code — for inspiration only — is still in `/legacy/`
- new code should live in `src/*`; relevant files and folders mostly exist but are empty


## src/app

According to FSD rules, this is global stuff that makes the app go round.
This is our `router.ts` (vue router) and the `App.vue` entry point.
`App.vue` should also use vue's provide/inject to provide data repositories to pages/components, but more on that later.

Also see the folder README (`/src/app/README.md`)

## src/pages

See folder README (`src/pages/README.md`) for general purpose.

### queue

`src/pages/queue/PageQueue.vue` is our actual "main entry point" in the MVP. It provides the queue functionality where everything revolves around.
It uses a composable `src/pages/queue/useCachedQueue.ts` which provides some fancy logic, namely maintaining the following state:

- currentVocabForExercises: `Vocab[]`
- nextVocabForExercises: `Vocab[]`
- currentTask?: `Task`
- nextTask?: `Task`

It uses these to provide a seamless experience for the user:

- show current exercises, one after the other, until we are through the array (at this point make `nextVocabForExercises` the `currentVocabForExercises` and start loading new `nextVocabForExercises`)
- show current task, if one exists, let user do it (when done, make `nextTask` `currentTask` and load new `nextTask`)
- ...show exercises again

As you can see, this is an infinite queue, never ending (as long as we have exercises or tasks).

To understand exercises and tasks in more detail, read the following chapters.

#### Picking Vocab and letting the user do exercises

`src/pages/queue/propose-which-vocab-to-practice/VocabPicker.ts` is responsible for picking vocab to practice.
It thinks in batches (see caching explanation above).
First, it randomly decides how many vocab units it wants, between 5 and 20. We call this `targetNumber`.

Then, it asks each of the proposers (at the moment `src/pages/queue/propose-which-vocab-to-practice/proposers/ProposerByImmersionContentAlmostReady.ts` and `PoposerByDueVocab`) for `targetNumber` suggestions. These have to adhere to the little `TaskProposerContract` interface so that's standardized.

- `ProposerByImmersionContentAlmostReady` picks a due `immersionContent` (see that entities repo function; repo is provided as function input by the page, which in turns gets it from `App.py` provide/inject), gets all `vocab` associated with that, shuffles the array and returns `targetNumber` length array `Vocab[]` (if it has less to offer, then of course if returns less)
- `PoposerByDueVocab` simply checks `Vocab` repo's (same repo flow) due objects, and then returns the correct amount

`VocabPicker` takes all these suggestions, shuffles them, makes sure it's a set (no duplicate vocab), reduces to target length and passes that back to the `useCachedQueue` composable.

The composable then gives vocab by vocab to the `practice-vocab` feature.

#### Picking Tasks

Picking tasks is similar yet a bit different, b/c tasks are similar yet a bit different to exercises.

First, we have a [Task Registry](src/pages/queue/propose-which-task-to-do/TaskRegistry.ts) which is the source of truth in our app for which tasks we have.
tasks themselves live in subfolders of `widgets/`.

[TaskPicker](src/pages/queue/propose-which-task-to-do/TaskPicker.ts) is responsible for picking a task (just one!, not a whole array like exercises), following an analogous approach. It audits each of the proposers for a suggestion, and then picks randomly. Again, proposers have to follow [a contract](src/pages/queue/propose-which-task-to-do/TaskProposerContract.ts). At the moment, we have the following two tasks, which have their own proposers

- [add pronunciation](src/pages/queue/propose-which-task-to-do/proposers/ProposeAddPronunciation.ts), which is pronunced if the entity function of vocab is returning any vocab without pronunciation
- [immersion content](src/pages/queue/propose-which-task-to-do/proposers/ProposeImmersionContent.ts), which *at the moment* is proposed if we have any due immersion content (see entity functions)

Then, the task is given back to our good old `useCachedQueue` composable and `PageQueue`, which uses `MetaTaskRenderer` to pick the correct task widget according to the task registry.



## widgets/

See [README](src/widgets/README.md) for the point of the layer.
Note: All tasks will live in the `widgets/` layer and access multiple features. Every task that lives here should be registered and used by `PageQueue` and its task render capabilities.

### Task for Adding Pronunciation

Rendered by `src/widgets/task-for-adding-pronunciation/RenderTaskForAddingPronunciation.vue`.
This does not do much more than rendering `DoTaskWidget` and `AddPronunciationWidget` below each other (see reference for these feature renderers below).

Once the task is finished (emit of `DoTaskWidget`), show `src/features/evaluate-task-widget/EvaluateTaskWidget.vue`, if that is done, emit finish event up to page.

### Task for Immersion Content

This task of for watching/consuming a piece of immersion content. You can find some references to this idea in legacy code, around [this file](legacy/pages/practice/ui/tasks/immersion-content/ImmersionContentTask.vue).

Make sure to come up with a sane, non-hacky way to handle that some tasks refer to a vocab (like above) while this one refers to immersion content, while other tasks may need yet other props. I want clean encapsulation! If you feel you need additional infrastructure for this, build it.

Anyways, like above, we show the generic `DoTaskWidget` and `src/features/add-vocab-to-immersion-content/AddVocabToImmersionContentWidget.vue` and logic is the same as before.

Once the task is finished (emit of `DoTaskWidget`), show `src/features/evaluate-task-widget/EvaluateTaskWidget.vue`, if that is done, emit finish event up to page.


## features/

See [README](src/features/README.md) to see what constitues a feature

### add-pronunciation-to-vocab

A simple widget showing core data of `VocabData` and allowing to add a pronunciation to it (simple text field), which is then persisted to the repo (use injected repos).


### practice-vocab

This is responsible for actually rendering our bread-and-butter "let's practice a unit" exercises.
You can take a lot of inspiration from legacy code here; make sure to read through the files in `legacy/pages/practice/ui` completely.

When this feature is called by the queue page, we simply import `src/features/practice-vocab/PracticeVocabWidget.vue`.

This receives a vocab unit as a prop, and calls a static function in the class `src/features/practice-vocab/gen/ExerciseGenerator.ts` to actually make an exercise for this vocab.

*Note:* We can take *massive* inspiration here from legacy code, where this stuff is mostly implemented with a slightly different paradigm. Make sure to read and summarize all files in the following folders: `legacy/pages/practice/model/generator/make-specific-exercises/words`, `/home/brokkoli/GITHUB/linguanodon/legacy/pages/practice/model/generator/make-specific-exercises`, `legacy/pages/practice/model/generator`. But again, this is ONLY inspo. Rely on the newly defined types, not the legacy types of sentences, words, and linguistic Units.

For now, the generator should follow very simple logic:

- For a given `vocab`, check its level.
    - If it's -1, generate a "try to remember" style exercise
    - If it's any higher, generate a reveal exercise from `vocab.content` to comma separated list of its `translations`

- `PracticeVocabWidget` is responsible also for scoring a given exercise (or rather, its vocab). For that, call the relevant entity function. Then, send a finish event up to the page so it knows to load the next unit-exercise or a task.

#### ui/


Similar to the task functionality, we will have an exercise registry here (although this flow is much simpler, exercises are single components that all live in `src/features/practice-vocab/ui/exercises`), a registry probably, a [meta renderer picking the right component](src/features/practice-vocab/ui/MetaExerciseRenderer.vue).

Note: I copied legacy files here, because we can reuse a lot of UI. However, you'll need to adapt some logic, make sure props and emits work with the new paradigm, and you correctly import the ui widgets from `src/shared`.


## entities/

See [README](src/entities/README.md) to understand what an entity is

### vocab

#### vocab/vocab 

##### VocabData

`VocabData` is likely THE MOST IMPORTANT type in the whole application. It is already defined. Make sure to read it carefully, as well as its dependencies.
It's in the path `src/entities/vocab/vocab/VocabData.ts`

##### VocabStorage

A dexie db implementation to persist VocabData. Check legacy files such as [this](legacy/entities/linguisticUnits/words/WordDexieRepository.ts) and [this](legacy/entities/linguisticUnits/words/WordRepository.ts) as inspiration.

Note that this storage is not exposed to the rest of the app. All outside contact is done via `VocabAndTranslationRepo`.

Make sure that if the db is empty to add some demo content which meshes with the other demo content.

#### vocab/translation

Similar scheme as above, only for the `TranslationData` type (which is really only ever relevant in context of `VocabData`, which is also why it's nested)

#### Vocab and Translation Repo

[This file](src/entities/vocab/VocabAndTranslationRepoContract.ts) defines the contract of repo functions that have to be exposed. [This file](src/entities/vocab/VocabAndTranslationRepo.ts) actually implements them, utilizing the two dexie dbs in its functions above.

This split is so that functions throughout the app can expect the `*Contract`, and we can mock the actual implementation in tests.

We need the following functions:

- `getVocab()` // ensure a smart pagination mechanism here
- `getVocabByUID()`
- `getVocabByLanguageAndContent()`
- `getRandomDueVocab(number)`
- `calculateMasteryLevelForVocab(id:str): number`
    - calculates the mastery of a vocab. For now, simple calculation: Map from level -1 to level 4 to return value of 0 to 100
- `scoreVocab`: upserts the progress. Use `ts-fsrs` functionality to grade (search legacy code). Also, either ++, -- or reset the streak to 0 (accordingly if it was correct/easy or wrong/hard). At streak of 1, ++ the level (levels cannot go back down) and reset the streak to 0.
- `addPronunciationToVocab()`
- `hasPronuncation(uid)`
- `getRandomVocabWithMissingPronunciation()`

### immersion-content

This is the second important entity our MVP is build around.
It should also have a persistence layer w/ dexie, also defined via a contract. Make sure to understand the types that `src/entities/immersion-content/ImmersionContentData.ts` is implementing.
The entity should expose the following functions:

- `getAllImmersionContent()`
- `getImmersionContentById()`
- `getRandomDueImmersionContent()` // either if `lastShownAt` is null (=new one) or if `wantToDoAgain` is true and we are beyond `nextShownEarliestAt`

Make sure that if the db is empty to add some demo content which meshes with the other demo content.

## shared/

- See [README](src/shared/README.md) to understand what belongs here.

- we have [array utils](src/shared/arrayUtils.ts) here. If you need shuffled arrays, weighted random picking, pick random from array, all that kinda stuff, put it here!