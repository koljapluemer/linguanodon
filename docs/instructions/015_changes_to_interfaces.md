# Interface Changes

I need to restructure some interfaces. Make sure that for everything, you adapt repos (especially the dexie db definition), features, components, entity files, contracts, pages.

## Changes

- [Link](src/shared/Link.ts) is now its own interface. It's used as described below.
- [VocabData](src/entities/vocab/vocab/VocabData.ts) is using the new link type for `links`. Should not change much functionality wise.
- we now have a [tasktype union](src/shared/TaskType.ts). 
  - move all options over from [TaskRegistry](src/pages/queue/propose-which-task-to-do/TaskRegistry.ts). Make sure TaskRegistry is using it currectly. Make sure other steps of the task progress use it correctly. No more magic string typing.
- [TaskData](src/shared/TaskData.ts) now has `decideWhetherToDoAgainAfterDoing?`. We will NOT!! implement logic for this yet, but make sure this is represented correctly in relevant repos (which is several different ones!)
- [ExampleData](src/entities/examples/ExampleData.ts) `id` is now called `uid` for consistency. Make sure this works everywhere, especially in dexie.
- `ExampleData` has a bunch of new props. Make sure to represent them. `situation` is meant as in "a situation in which you would say this". Check `VocabData` stack, a lot of the functions and props work similarly.
- [ResourceData](src/entities/resources/ResourceData.ts) can now also track references to `notes`
- [GoalData](src/entities/goals/GoalData.ts) also got the id uid rename. Similar to [ResourceData](src/entities/resources/ResourceData.ts), we can now attach vocab *and* examples *and* fact cards *and* notes. Also we have optional `prio` now.
- I want to delete the repo `ImmersionContent` completely. Instead, I added `isImmersionContent` to `ResourceData`. As such, all immersion content is now understood as a resource with `isImmersionContent=true`. Adapt the tasks and features accordingly. Then remove the [folder](src/entities/immersion-content) and the [pages](src/pages/immersion-content).

- [TranslationData](src/entities/vocab/translations/TranslationData.ts) got the id/uid rename. Also, it can now take an array of notes, which refer to uids of `NoteData`. You may need to change some forms here.

- [VocabData](src/entities/vocab/vocab/VocabData.ts) got the uid/id rename. I removed the `pronunciation` prop. We have a task which is adding a pronunication to a vocab unit — keep the prompt for the user and the framing of adding pronunciation, but simply add the pronunciation as a note with `showBeforeExercise = false`

## Meta

- This is a prototype. It is NOT!!! LIVE!!! DO not invent any "let's keep the legacy code" or "migration" strategies. Simply change, we will reset the data.
- Do adapt our [demo data](src/shared/demo-data/demo.json) accordingly
- Run lint and typecheck regularly to see what's going on.