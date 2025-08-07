# Reimagning Exercises as Tasks

- Currently, [Vocab](/home/brokkoli/GITHUB/linguanodon/src/entities/vocab/vocab/VocabData.ts) is practiced via [exercises](/home/brokkoli/GITHUB/linguanodon/src/features/practice-vocab/gen/ExerciseGenerator.ts)
- I want to change this to use our [task](/home/brokkoli/GITHUB/linguanodon/src/entities/tasks/TaskData.ts) system instead
- For that, we will add a `tasks: string[]` prop to `VocabData`, such as [resources](/home/brokkoli/GITHUB/linguanodon/src/entities/resources/ResourceData.ts) have
- Then, we will convert all our [fancy exercises](/home/brokkoli/GITHUB/linguanodon/src/features/practice-vocab/ui/exercises) into tasks, living separately as a widget and following the structure of our other tasks
- Then, instead of generating exercises ad hoc triggered from queue, we will implement a feature called update-vocab-tasks, which will be triggered when the state of a given vocab data changes (e.g. because a Task that refers to them was done, or because the user added a new vocab unit). This feature *updates the task array* of `VocabData` with valid tasks, using all the same level-dependent logic etc. that we already use, we can mostly move that over, but *as tasks*.
- Then, we can delete the complete practice-vocab feature
- Then, like on [the resource page](/home/brokkoli/GITHUB/linguanodon/legacy/pages/manage-resource/PageManageResource.vue), we can show a list of the tasks attached to a given vocab unit on the [vocab page](/home/brokkoli/GITHUB/linguanodon/src/pages/vocab/PageVocabForm.vue)

Do not forgot to adapt dexie repos as needed. Do not forgot how to save dexie objects.

## Clarification Questions

1. **Task Persistence**: Should vocab tasks be persisted in the TaskData repository like other tasks, or should they be ephemeral and regenerated as needed?

They should be persisted correctly.

2. **Task Lifecycle**: When vocab tasks are completed, should they be removed from the vocab.tasks array or marked as done and kept for history?

Tasks are not auto removed in this way. They may be set `isActive` false if the conditions to do this task are no longer met (e.g. level is exceeded)

3. **Level-based Task Logic**: Should the level-dependent exercise logic (ExerciseGenerator.ts:18-44) be moved as-is to the update-vocab-tasks feature, or do you want any modifications to the progression system?

as is

4. **Task Scheduling**: Should vocab tasks use the existing task scheduling system (nextShownEarliestAt, lastShownAt) or continue using the vocab's LearningProgress system?

do not get confused.

[VOCABDATA](/home/brokkoli/GITHUB/linguanodon/src/entities/vocab/vocab/VocabData.ts)!!!!! will continue tracking its `progress` as before. `TASKDATA` is a different fucking interface, and tracks its own props. One does not replace the other.

5. **Queue Priority**: How should vocab tasks be prioritized in the queue relative to other task types (goals, resources, etc.)?

Touch the queue as little as possible. We will implement the changes in the next step.

6. **Task Updates**: Should update-vocab-tasks run automatically after each vocab task completion, or triggered by other events?

Triggered by by vocab task completion, yes. But make it its own features so it can also be triggered by other things.

7. **Reverse Exercises**: The ExerciseGenerator has complex logic for reverse exercises (translation→vocab). Should this be split into separate task types or handled within single task types?

Consider the UI as the determining factor for what is its own tasks. If its currently sharing one component to render the exercise, it can be understood as the same task type.

8. **Distractor Generation**: Should the DistractorGenerator logic be moved into the task widgets or kept as a shared service?

moved into the task widget if it's only relevant for a given task. moved into the `vocab` entity if its shared.

## Implementation Notes

- **Dexie Integration**: Must update VocabAndTranslationRepo to handle new tasks array
- **Data Persistence**: Remember to use `toRaw()` when saving reactive objects to Dexie per CLAUDE.md rules
- **Task Repository**: Need to create/update TaskRepo for vocab task persistence
- **Queue Integration**: Update queue proposers to handle vocab tasks instead of exercises