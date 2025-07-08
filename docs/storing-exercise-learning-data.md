# Storing Learning Data

As the learner goes through exercises, we want to store and utilize learning data.

## Setup

- First, when [this util](../src/utils/generateExercises.ts) generates `Exercise`s, also generate its `.card: Card` prop.
    - This uses `ts-fsrs`
      - [README](https://raw.githubusercontent.com/open-spaced-repetition/ts-fsrs/refs/heads/main/README.md)
      - [types](https://raw.githubusercontent.com/open-spaced-repetition/ts-fsrs/refs/heads/main/src/fsrs/types.ts)
      - This is not sm-2, not Anki, and not something where we can guess how the API may work, but we have to follow the documentation EXACTLY!!!!

## Rating

- [The exercise render component](../src/components/practice/exercise/ExerciseFlashcardRender.vue) should directly utilize `Rating.Again`, `Rating.Hard`, `Rating.Good` and `Rating.Easy` on its buttons, and pass that up with the scoring event
- [The control](../src/components/practice/exercise/ExerciseFlashcardControl.vue) should mostly just pass the relevant data to the [exercise store](../src/stores/exerciseStore.ts).
- The store then should update the `Exercise`'s `.card` according to the ts-fsrs doc
- Note that a given exercise is *only* stored when its rated, *not* when its initially generated

## Debug

- We want a [debug page](../src/pages/debug/DebugExerciseData.vue) tabulating the saved exercise and its data
- Since this is a debug page, it can be designed as simple dexie table, all on the page component (don't spam components into the rest of the app for this)

## Utilizing the learning data

- Note that we are not yet *using* the exercise data for anything. That will be done in the future, and explained in [this doc](using-exercise-learning-data.md)