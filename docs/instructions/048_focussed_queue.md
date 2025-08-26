I want to allow focussing the [queue](src/pages/queue/PageQueue.vue) around specific [vocab](src/entities/vocab/vocab/VocabData.ts), so that you can click on a router-link button "Practice this" on the [vocab page](src/pages/vocab-edit/PageVocabEdit.vue) and you get redirected to queue in such a way that is focussed around this.

For this, we need the following things:

- optional page param (also in [router](src/app/router.ts)) for the queue page `focusOnVocab:string`
- A [util](src/pages/queue/lesson-generator/utils) `getTaskBasedOnVocab` that taks in a vocab uid and spits out a task, after correctly judging which task may be generated for this. Check [the doc](docs/reference/tasks) but it's not quite complete; also check other utils and of course use them if relevant.
- Then, [makeTask](src/pages/queue/lesson-generator/makeTask.ts) should be passd the optional prop, and if it exists, it should with 80% chance defer task creation to the to-be-created util `makeTaskWithFocusOnVocab`.
- Now, before that can work, we need one more util `useTrackTaskNumber` which simply tracks state (its a composable) of how many tasks the user has done already
- Using this composable `makeTaskWithFocusOnVocab` does one of two things
  - If it's the first task of the session, make a task based on the vocab we have in focus
  - If it's not the first task, we have a bit more choice: We may pick the focused vocab, or *any of the vocab that's connected to it*, as long as they're either due or new and we are [still allowed to make new vocab](src/pages/queue/lesson-generator/utils/useNewVocabTracker.ts). Pick one of them based on those criteria and make valid task.
  - If we can make no valid task, we simply return null and in `makeTask` fall back to standard generation