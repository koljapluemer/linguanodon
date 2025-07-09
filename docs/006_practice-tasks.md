# Practice Tasks

- In [the task list widget](../src/components/lists/widgets/ListWidgetTask.vue), implement a "Practice" button
- Pressing it, we want a practice flow relating to this task, very similar to the now obsole [set-based learning](000_set-based-learning.md) (including [storing exercise data](001_storing-exercise-learning-data.md))
- Since a [Task](../src/entities/Task.ts) has both `unitsOfMeaning` and `primaryUnitsOfMeaning`, we need to adapt the [exercise gen util as follows](../src/utils/generateExercises.ts): Make sure that we pick 70% exercises based on *primary* units of meaning (weighted random function)
- On the UI side, use [this page](../src/pages/PagePracticeTask.vue), which loads [this control](../src/components/practice/task/PracticeTaskControl.vue), which loads [this renderer](../src/components/practice/task/PracticeTaskView.vue)
- This view, in turn, first goes through the 20 exercises, using [the exercise controller](../src/components/practice/exercise/ExerciseFlashcardControl.vue)
- After that's done, `PracticeTaskView` loads [this component where the user can actually do the task](../src/components/practice/task/TaskExecuteControl.vue) (utilizing [this renderer](../src/components/practice/task/TaskExecuteView.vue))
  - This component combinations simply displays the task itself to the user, and then shows a nice form which in the background adds a [TaskAttempt](006_practice-tasks.md) to the task's `.attempts` history in [its store](../src/stores/taskStore.ts)
  - visually, we use two simple Lickert scale, one for ease where it says on the left "very difficult" and on the right "very easy" (with 5 radio buttons between), and on for correctness saying "not correct at all" and on the right "entirely correct"