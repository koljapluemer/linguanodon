# New Task Based Practice

- *Note:* The user-side flow is basically equivalent to [the previous implementation](006_practice-tasks.md). We have more changed the underlying structure, especially data persistence and exercise gen is reworked an restructure.

## Process

With the above in mind, here is how generation should work:

- Use [this util](../src/utils/exercise/generateExercisesForTask.ts) in general, which is the high-level function to get exercises for a given task
    - First, utilize 