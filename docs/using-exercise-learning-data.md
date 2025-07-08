# Using Exercise Learning Data

After we [stored exercise data](storing-exercise-learning-data.md), we now want to use it.

## Usage

- At the end of [generating exercises](../src/utils/generateExercises.ts), we pick 20 exercises at random (currently)
- instead of doing this, first find the following counts
  - how many of these exercises are `due` (=exist in [store](../src/stores/exerciseStore.ts) and due data is in the past)
  - how many of these exercises are new (nothing with the generated uid in the store)
  - how many of these exercises are not due (exist in store, but due date in the future)
- `console.info` the counts
- Then, choose the 20 exercises with the following rules:
  - Prioritize *due* exercises. If more than 20, pick randomly from those.
  - If less than 20, add all of them to the return, but fill up also with randomly picked *new* exercises.
  - If we run out of both *due* and *new* exercises, then and only then fill up with exercises that are *not due*, prioritizing those with the "lowest" due date

## Notes

- The store persists cards — but the `Date` type [will cause rehydration problems](https://prazdevs.github.io/pinia-plugin-persistedstate/guide/limitations.html#non-primitive-types-are-not-persisted). The doc recommends the following function:

```

afterHydrate

    type: (context: PiniaPluginContext) => void
    default: undefined

Hook function run after rehydrating a persisted state. The hook gives access to the whole PiniaPluginContext. This can be used to enforce specific actions after hydration.

```