medium, don't evaluate difficulty.

can be [generated](src/features/vocab-update-tasks/updateVocabTasksService.ts) for [VocabData](src/entities/vocab/vocab/VocabData.ts) that has a priority of at least 2, and does not have a linked [note](src/entities/notes/NoteData.ts) with `noteType` "pronunciation", has at least one translation, and has content.

prompt: "Research the pronunciation and add it". In the task itself, show the vocab content and show a text field to input the translation. Can be considered done if the text field is not empty.

- can be skipped. in that case, set the underlying `VocabData` progress' due 10 minutes into the future
- can be skipped and disabled, in that case, set Vocab's `notInterestedInPronunciation` to true (this is a new prop and needs to be persisted)