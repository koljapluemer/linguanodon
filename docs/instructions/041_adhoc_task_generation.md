After [our last change](docs/instructions/040_move_towards_dynamic_task_rendering.md), I want to adapt the queue itself.

On [the queue page](src/pages/queue/PageQueue.vue), change how tasks are generated.
We no longer want to generate whole task batches, nevermind two of them.

Instead, we are going to opt for a much tighter loop: Generate one task (A) and the next task (B), when A is done, show B instead and generate a new next task C.

Instead of utilizing [the lesson generator](src/pages/queue/lesson-generator/makeLesson.ts), build for [each task that we have](src/widgets/do-task/taskRegistry.ts) a file `getRandom*Task` which should live in [this folder](src/pages/queue/lesson-generator/utils) and utilize [these generators](src/pages/queue/lesson-generator/task-generator) and then build out [this file](src/pages/queue/lesson-generator/makeTask.ts) which for now just picks a random task generator (if the one it picked cannot generate a task, go down the list until we got one or checked all tasks) and returns it. Use that in queue.