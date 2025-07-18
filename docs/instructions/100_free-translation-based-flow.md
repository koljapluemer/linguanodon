# Free-Translation-Based Flow

This is an attempt to restart architectural setup to quickly get to MVP state, without running into complexity dead ends.

First, we need three types: `Sentence`, `Word`, and `LinguisticUnit`.

We can steal these from legacy code, more or less:
- `Word` = [this type](../../legacy/entitiesRework/unitOfMeaning/word/Word.ts)
- `Sentence` = [this type](../../legacy/entitiesRework/unitOfMeaning/sentence/Sentence.ts)
- the both derive from `LinguisticUnit`, where we can get inspiration from [here](../../legacy/entitiesRework/unitOfMeaning/abstractUnitOfMeaning/AbstractUnitOfMeaning.ts)

But note: Since we are using **Feature-Sliced Design** ([tutorial](https://feature-sliced.design/docs/get-started/tutorial), [overview](https://feature-sliced.design/docs/get-started/overview)), we will *actually* represent all these objects as non-hydrated types, ready to be send over JSON APIs, and ready to be handled by Dexie.

- We have a legacy type that may inspire our design [UnitOfMeaningRemote](../../legacy/entitiesRework/unitOfMeaning/UnitOfMeaningRemote.ts) — note how it refers to [UnitOfMeaningIdentification](../../legacy/entitiesRework/unitOfMeaning/parts/UnitOfMeaningIdentification.ts), a simple type with two props (languageCode and content) that identifies a linguistic unit. We can use this.

We will need to persist data.
This requires some abstraction. In our legacy code, we already have strong ideas.

In short, we used an abstract interface to define what a persistence layer must implement, then wrote implementations in dexie and earlier in pinia. We are going to do something similar again.

First, here are relevant legacy files:

- [injectionKeys](../../legacy/types/injectionKeys.ts), which was used so that pages know what they could provide to components. The page decided which implementation to use, and components got the repo implementation injected.
- [here](../../legacy/repositories/interfaces/UnitOfMeaningRepository.ts) is an exemplary repository interface
- [here](../../legacy/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning.ts) is an exemplary implementation
- [here](../../legacy/pages/PageManageUnitOfMeaning.vue) is a page that provides some repos
- [here](../../legacy/components/forms/control/FormControlUnitOfMeaning.vue) is a component utilizing the injected repos


Here are key changes that we are making:

- Adhere to FSD. No sibling dependencies, no depending on layers above!
- Provide a control of which implementation to use in [App.vue](../../legacy/App.vue), not in the pages
- In the dexie implementations, we are, for now, just going to hardcode some data.

We are going to have the following repositories:

## Basic Repositories

A `WordData[]` repo, with the following example data:

```ts
[
  {
    language: "eng",
    content: "want",
    notes: [
      {
        content: "verb",
        showBeforeExercise: true
      }
    ],
    translations: [
      {
        language: "apc",
        content: "حابب"
      }
    ],
    links: []
    otherForms: []
    synonyms: []
    appearsIn: [
      {
        language: "eng"
        content: "I want to talk to you."
      }
    ]
  },
  {
    language: "apc",
    content: "حابب",
    notes: [
      {
        content: "verb",
        showBeforeExercise: true
      }
    ],
    translations: [
      {
        language: "apc",
        content: "حابب"
      }
    ],
    links: [
      {
        label: "Wiktionary",
        url: "https://en.wiktionary.org/wiki/%D8%AD%D8%A7%D8%A8%D8%A8"
      }
    ],
    links: []
    otherForms: []
    synonyms: []
    appearsIn: [
      {
        language: "apc"
        content: "انا حابب احكي معك."
      }
    ]
  }, 
]
```

*Note that we're kicking a few props from the original type.*

Then, of course, we are going to have a `Sentence[]` repo, with the following example data:

```ts
[
  {
    language: "eng",
    content: "I want to talk to you."
    notes: []
    translations: [
      {
        language: "apc"
        content: "انا حابب احكي معك."
      }
    ]
    links: []
    credits: [
      {
        license: "CC-BY-NC-4.0",
        owner: "guymorlan"
        ownerLink: "https://huggingface.co/guymorlan"
        source: "Huggingface - Levanti Dataset"
        sourceLink: "https://huggingface.co/datasets/guymorlan/levanti"
      }
    ],
    containsWords: [
      {
        language: "eng"
        content: "want"
      }
    ]
  },
  {
    language: "apc"
    content: "انا حابب احكي معك."
    notes: []
    translations: [
      {
        language: "eng"
        content: "I want to talk to you."
      }
    ]
    links: []
    credits: [
      {
        license: "CC-BY-NC-4.0",
        owner: "guymorlan"
        ownerLink: "https://huggingface.co/guymorlan"
        source: "Huggingface - Levanti Dataset"
        sourceLink: "https://huggingface.co/datasets/guymorlan/levanti"
      }
    ],
    containsWords: [
      {
        language: "apc"
        content: "حابب"
      }
    ]
  }
]

```

We will also need a `Language[]` repository. We will fill it with the following example data, which also explains the type:

```ts
[
  {
    code: "apc"
    name: "Levantine Arabic"
    isAddedByUser: false
    isTarget: true
    isNative: false
  },
  {
    code: "eng"
    name: "English"
    isAddedByUser: false
    isTarget: false
    isNative: true
  }
]
```


## Tracking/Progress Repositories

We will also need repositories to track user repos in relation to our objects.


## User View

With these basics out of the way, we can describe what we actually want:

We want the learner to go through `Lesson`s. 
This is another entity, but it will not be persisted or anything.

A lesson has 5-20 `Exercise`s. The last one is special.

`Exercise` is an entity. A very abstract one.

Some very important mental model distinction: `Exercise` is a backendy thing that gets generated. It then informs a `Task` (yet another entity) that gets represented to a user via a component.

- For example (these are not yet to be implemented, just demonstrating the two entities):
  - Based on a `Word`, we make a native → target `Exercise`. This utilizes a `Task` that represents a flashcard (the user sees the front, clicks 'Reveal', sees the back, and rates)
  - Based on a `Word`, we make a target → native `Exercise`. This utilizes a `Task` that represents a flashcard (the user sees the front, clicks 'Reveal', sees the back, and rates)
  - Based on a `Word`, we make a native → target `Exercise`. This utilizes a `Task` that represents a writing challenge (the user sees the prompt (native lang word), has to write the (target lang) answer in an input box, clicks "Check", and sees the correct answer, rates himself)
  - Based on a `Sentence` that is in a target lang and has no native lang translation, we make an exercis where the user sees only the target lang, and has to write a guess on the translation in a textbox. This utilizes the same `Task` as above, only in a variation, because we cannot show the user the answer.
  - Based on a `Word` that is in a native lang and has no target lang translation, we make an `Exercise` where the user has to search the internet and find the translation. We use a `Task` that allows adding other `Word`s as translations to a `Word`, utilizing existing form components
  - Based on a `Resource` (type not specified yet, no worries; is to represent an external source like a blog post), we make an `Exercise` that prompts the user to read the resource and add words and/or sentences to the `Resource`. The `Task` itself is similar to the one described above. 

This goes to show that we need some very, *very* good abstractions for `Task` and `Exercise`. That is one of the core challenges of the whole project.
We can take *some* inspiration from the exercise generators of our legacy code, but not much. Here are some interesting files:

- [a practice component based on a unit of meaning spawning its own exercises](../../legacy/components/practice/unitOfMeaning/PracticeUnitOfMeaningBased.vue)
- [control](../../legacy/components/practice/exercise/DoExerciseControl.vue) and [render](../../legacy/components/practice/exercise/DoExerciseRender.vue) components wrapping the render action of the actual exercises
- [control](../../legacy/components/practice/exercise/specific/choose-from-two/ExerciseChooseFromTwoControl.vue) and [render](../../legacy/components/practice/exercise/specific/choose-from-two/ExerciseChooseFromTwoRender.vue) for a task (as we would call it now, back then it was not differentiated against exercises) where the user has to select the answer from two buttons
- [control](../../legacy/components/practice/exercise/specific/flashcard/ExerciseFlashcardControl.vue) and [render](../../legacy/components/practice/exercise/specific/flashcard/ExerciseFlashcardRender.vue) for a task (back then `Exercise`) where the user flips a classic flashcard
- [control](../../legacy/components/practice/exercise/specific/free-translation/ExerciseFreeTranslationControl.vue) and [render](../../legacy/components/practice/exercise/specific/free-translation/ExerciseFreeTranslationRender.vue) for an exercise where the user freely types a translation in a textbox
- [parent util function](../../legacy/utils/exercise/generateExercisesForUnitOfMeaning.ts) for generating exercises per unit of meaning
- [generating basic flashcards](../../legacy/utils/exercise/generators/generateBasicFlashcards.ts)
- [generate choose-from-two-exercises for what now would be a Word](../../legacy/utils/exercise/generators/generateChooseFromTwoForUnitAndLanguage.ts)
- [cloze exercise generator](../../legacy/utils/exercise/generators/generateClozesForUnitAndLanguage.ts)
- [free translation exercise generator](../../legacy/utils/exercise/generators/generateFreeTranslationForUnitAndLanguage.ts)
- we also have [a folder full of fairly implementation-agnostic utils for doing stuff like cloze gen](../../legacy/utils/exercise/utils), which can be reused large-scale

Just to note this again: We probably have to rethink a lot of this, with our split of `Exercise` vs `Task` and adherence to *Feature-Sliced Design*

Back to the user flow, we want really a rather limited scenario in this first version:

- First, the user gets 5-19 classic flashcard exercises for `Word`s.
  - These can be native → target or vice versa. More on that later.
  - How will those be chosen? More on that later.
- Then, at the very end of the `Lesson`, we want to give one free translation exercise based on a `Sentence`. 
  - The user gets the target lang sentence and a free text field, gives its his best, reveal solution, rates himself.


We are hitting on an important detail here:
Some exercises can be repeated basically indefinitely (according to a spaced repetition algo), others are more one-shot (except if the user wishes to give it another try).
We can give an `Exercise` a simple `isRepeatable` prop; that's the easy part. How is how we react to this in user land:

- For a repeatable exercise:
  - The `Task` gives the user the `Exercise`, lets them do it, reveals, and user rates themselves, boom, next.
- For a non-repeatable exercise:
  - The `Task` gives the user the `Exercise` — there is usually a "Skip" option — the user does it, reveals solution if applicable, rates themselves (not necessarily same rating that is meaningful here), and then we have a screen that asks the user whether they want to do the exercise ever again ("no", "yes, soon", "maybe in a while")

We have to react to both of these smartly and think about the correct abstraction and which data to save.
Also, we want to smartly choose `Word`s and `Sentence`s to in the first place — not too easy, not too hard, not too repetitive.

To do that, we have to save some data when the user does exercises relating to a `Word` or `Sentence`. Hen and egg problem.

## Learning Data

First of all, we're going to persist data related to a user's progress disconnected from the data of the actual thing. That means:

- We are going to have a class `Exercise` doing logic, a repo storing `ExerciseData[]`, and a repo storing `ExerciseProgressData`
- We are going to have a class `LinguisticUnit` doing logic (shared for `Word` and `Sentence`), but no repo for that, but we *will* have a repo storing `LinguisticUnitProgressData[]`, since what we want to save is fairly similar between `Word` and `Sentence`
- We are going to have a class `Word` and a repo with `WordData`, but no repo for its progress data
- We are going to have a class `Sentence` and a repo with `SentenceData`, but no repo for its progress data
- We are *also* going to have a repo saving `LearningEventData[]`, which tracks every learning event that happens (i.e. an `Exercise` being done) just so we track that

### LinguisticUnitProgressData

Now, if the learner completes an exercise based on a `Word` or `Sentence`, we *upsert* the fitting `LinguisticUnitProgressData`.

We simply match the two (/three) disconnected entities by always using the identifier `language + content`, so that should be fine.

Now, we need to take a step back first. When an `Exercise` is generated, I want to give it a `level` prop.
This is hardcoded by the generator scripts (we will, talk about that later).

For now, we don't have to think about the exact levels. Just know that for example:

*An `Exercise` that requires to choose the correct answer from two options may have a `level` of `2`, while one where you have to choose the correct answer from four options may have a `level` of `3`, and one where you have to type the answer has a level of `7`.*

Also, an exercise stores an `affectedLinguisticUnits: LinguisticUnitIdentifier[]` prop.
For example:

*The cloze deletion `Exercise` "Fill in the blank 'I want to ＿ to you'" may store the affected linguistic units of `{language: "eng", content: "I want to talk to you"}` (the sentence the cloze is based on) and `{language: "eng", content: "talk"}` and have a `level` of `5`.*

Thus, when we do an exercise, we can loop the affected units and upsert a `ts-fsrs` rating to the *correct level* of each linguistic unit.

<!-- TODO: define what happens when levels of a unit are unfilled -->

We will type exercise ratings in a data structure like this, with key from 0-9:

```ts
{
  0: Card
  2: Card
  3: Card
  7: Card
}
```

`Card` is a type from `ts-fsrs` — check [here](../../legacy/utils/exercise/recordExerciseLearningEvent.ts) for example usage.
So, we will simply either use `createEmptyCard()` to add tracking for the unit's correct level, or, if a `Card` already exists, we score it.

Specifically, the UI will look like this:

- For the first, normal flashcard tasks: show the front, user clicks "Reveal", we show front and back, and we ask "How easy was this task?" and offer four buttons "Impossible", "Hard", "Doable", "Easy". We map this two the `ts-fsrs` `Rating`s (Wrong, Hard, Correct, Easy) or whatever they're calld.
- For the last, sentence free translate task, we show the target lang sentence and a text input box, let the user try, reveal solution, and again ask the same question with the four buttons.

A Learning event is thus typed like this

```ts
interface LearningEvent {
  userEaseRating: Rating
  timestamp: Date
  exerciseType: string
  taskType: string
  level: number
  linguisticUnit: LinguisticUnit
  userInput?: string // only relevant for the free translate, we save what the user writes here.
}
```

### Selecting Data

Since we're persisting progress for `Word`s and `Sentence`s, we can smartly select them according to which are due. 

To design our `Lesson`, we first pick a `Sentence` (or rather, `SentenceData`) that is elibible for a free translation exercise.
For these exercise, we can *only* use `SetenceData` where we have *no attached `LinguisticUnitProgressData`* (=sentences not used for exercises before).

We need to also check that at least 60% of its attached are *mastered*

<!-- todo: define "mastered" (above) -->

We generate that exercise (smartly factor these util functions, and put heavy work in either the `Sentence` class or the `LinguisticUnit` class) according to the functionality needed, described above.

Then, we generate exercises for the `Word`s attached to the used `Sentence` (`containsWords` props).
However, we want only choose `Words` that are due.
To find out which words are du, we find the `LinguisticProgressData` for each word in `containsWords` and check for which levels we can generate exercises (more on that later). Check if *any* of the following conditions is true:

- The `WordData` has *no* attached `LinguisticProgressData`, but we can generate exercises for at least 1 level for it.
- The `WordData` is linked to a `LinguisticProgressData` object and the `Card` for any level of it is currently due, according to fsrs
- The `WordData` is linked to a `LinguisticProgressData` object, none of the `Card`s attached to any of its levels are due, but we *can* generate exercises for a level that has no attached `Card` yet (=was not practiced before) 

For exercise generation, let's start with following principles:

- To save compute, each generator should offer
  - a function that actually generates `Exercises`
  - a function that returns a bool to see if it would be possible to generate at least 1 exercise (for quick checks, saving compute)

For words and sentences, we will have high-level exercise gen functions like: `generateWordExercisesLevel0`, `generateWordExercisesLevel1`, ...up until level 9

Specifically, (for now), we want to implement the following exercise generation:

### `WordData` Exercise Gen Levels

#### Level 0

##### Look At Card

This is a very simple exercise and task. 
It gets a word in a target lang, shows the target content and all translations into native langs in a comma-separated list.
Or it gets a word in a native lang, checks which languages are available in its translations, picks one that is also a user's target lang at random, and show one view with both the native lang content and all translations in the chosen target lang as a comma-seperated list.

Then, simply have prompt "Try to remember this word." and ask "How difficult is the word" and show the classic "Impossible", "Hard", "Doable", "Easy" and rate accordingly.

*This exercise can only be generated if the word has no associated `LinguisticProgressData` (=never seen before)

#### Level 1

##### Flashcard from target to native, select from two buttons

Make an exercise with the target content and "What does this mean?" and two buttons: one is the correct `Word` in a native lang, the other is a randomly chosen, ideally also due `Word` in the same native lang.
When the user clicks the wrong button, it gets disabled. When the user clicks the correct button, color it green, wait 100ms then score the exercise.

#### Level 2

##### Flashcard from target to native, select from four buttons

Same as before, but, well, with four buttons (one of them correct)

##### Flashcard from native to target, select from two buttons

Same as `Flashcard from target to native, select from two buttons`, only with the native being shown and target lang options being on the buttons, one of them correct


#### Level 3

##### Flashcard from native to target, select from four buttons

Same as before, only with four buttons

#### Level 4

##### Flashcard target to native

Similar as before, only instead of buttons, there is a "Reveal" button which simply unveals the correct translation(s). Then the user rates.

#### Level 5

##### Flashcard native to target

As above, only reverse

#### Level 6, 7, 8, 9

*More to come. Implement these functions as a stub returning no exercises*


### `SentenceData` Exercise Gen Levels

#### Level 0

##### Free Translation

As described before: The user is shown the target lang content and is prompted to write their best guess as to how to translate it. There is a reveal button, and a the attached native lang translation(s) are shown.

*This exercise can only be generated if*:

- *the `SentenceData` has no associated `LinguisticProgressData` (= it has not been seen before)*
- *looping all the `containsWords` and within that all the levels, every single one of the levels 0 to 5 (inclusive) either cannot generate exercises, or, if thy can, this level is currently not due (ts-fsrs check) according to the associated `card`*

In other words, this exercise is only generated for previously unseen sentences where the words in the sentence are already pretty well studied

#### Level 1-9

*to be implemented later*


## Full Generation Logic

Now we have the setup to fully discuss how exercises for a `Lesson` are actually generated for our basic flow.

0) Randomly decide how many exercises the `Lesson` will have, see above

1) Use a function called *searchForSpecialExercise*
2) This function will, later, have multiple options to try and find that special per-exercise level, for now, it only calls *searchForFreeTranslateExercise*
3) `searchForFreeTranslateExercise()` will find the `Sentence` that was not seen before and where the highest average progress was made in the first 6 levels (0-5) of its `containsWords` array (see criterion for Free Translation gen described above) — it may either find one where the exercise can be generated, or one where we are fairly close.
  - if we can generate the Exercise, great. Do that and save it to a temp.
  - if not, also fine. We will have no special exercise for this lesson. Move to next step.
4) Next, we will have a function `addExercisesHelpingWithSpecialExercise()`. We take the `Sentence` that was picked before (no matter whether we got a special exercise out of it or not) and generate 1 due `Exercise` for every `Word` attached to it via `containsWords`. If a `Word` was not seen before, generate a level 0 exercise. If it was, pick one of the levels that are currently due (or, if none are due, the lowest level that was yet unplayed), generate the `Exercise`s according to the level (if a level allows multiple types of exercises, pick at random) and return randomly chosen `Exercise`.
5) Last, we call `fillUpLesson`. It simply checks for due `LinguisticUnit` (via their attached data), randomly picks one, randomly returns one exercise based on due levels same as above, until we have as many exercises in the lesson as we wanted.

At the end of each lesson, we have a little component saying "Done with the lesson" and "Next" button which loads the next lesson.