Let's make a new practice mode, called "Ultrarandom"


- First, understand [this](src/pages/practice/modes/modes/sisyphos/SisyphosWidget.vue), [this](src/pages/practice/modes/modes/sisyphos/generateSisyphosTasks.ts), [this](src/pages/practice/modes/modes/eyes-and-ears/EyesAndEarsWidget.vue) and [this](src/pages/practice/modes/modes/eyes-and-ears/generateEyesAndEarsTasks.ts) to understand what a practice mode is


- you may take some inspiration from [queue logic](src/pages/practice/modes/modes/classic-queue/ClassicQueueWidget.vue) (see also its used utils), but note that that's much more complex
- make sure to add to [overview](src/pages/practice/PracticeOverview.vue) and [router](src/app/router.ts)
- goal is to dynamically pick a random task from [all tasks](src/pages/practice/tasks/ui/taskRegistry.ts) and generate a random tasks of this type.
- responsibility for generating a random task is in each task folder in a file with the same naming scheme, e.g. [here](src/pages/practice/tasks/task-cloze-choice/getRandom.ts) or [here](src/pages/practice/tasks/task-fact-card-reveal/getRandom.ts).
- Some tasks may not yet have a function to gen a random task, in that case, add it.
- If a random task generator returns no task, fallback to the next task type and so on.