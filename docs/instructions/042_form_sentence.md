Let's make a new medium task.

The user gets two vocab (due and seen, content and translations exist), and is prompted to form a sentence with them.


- register task [here](src/widgets/do-task/taskRegistry.ts) as medium sized task
- ensure words are the same language
- make a function to generate a random such task [here](src/pages/queue/lesson-generator/utils) and integrate [here](src/pages/queue/lesson-generator/makeTask.ts)
- put the UI for the task itself [here](src/tasks). Understand the files in the task and [TaskRenderer](src/widgets/do-task/TaskRenderer.vue) to format it correctly.
  - UI should show the two words in big font, and their translations smaller below them
  - then a lg textarea to form a sentence
  - below a skip button and a done button, the done button is only enabled when the user has input at least chars of length 3 in the textarea
  - when done is clicked, persist the user's sentence as a [note](src/entities/notes/NoteData.ts) with note type 'example sentence task' and attach reference to that note to each attached [vocab](src/entities/vocab/vocab/VocabData.ts) (these should be attached as `associatedVocab` to the `Task`, of course)


Make the UI look similar to other tasks. Refrain from excessive container divs and cards and headings.