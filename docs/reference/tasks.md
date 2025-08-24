# Tasks

A reference of all existing tasks in the app.

## Core File

- [TaskData interface and definition of valid types](src/entities/tasks/TaskData.ts); [Task component registry](src/widgets/do-task/taskRegistry.ts)

## Vocab-Based

### add-pronunciation

medium, don't evaluate difficulty, is one time, do not decide whether to do again.

can be [generated](src/features/vocab-update-tasks/updateVocabTasksService.ts) for [VocabData](src/entities/vocab/vocab/VocabData.ts) that has a priority of at least 2, and does not have a linked [note](src/entities/notes/NoteData.ts) with `noteType` "pronunciation", has at least one translation, and has content.

prompt: "Research the pronunciation and add it". In the task itself, show the vocab content and show a text field to input the translation. Can be considered done if the text field is not empty.

### vocab-try-to-remember

`isOneTime`. do not rate difficulty, do not ask whether to do again. Prompt: "Try to remember the meaning of this word". Can be considered done immmediately.

### vocab-reveal-target-to-native

Small task. Evaluate difficulty. Do not ask whether to do again. Has an internal reveal state logic. Is automatically considered done after the reveal.

`VocabData` must have >0 translations and content must be set.

### vocab-reveal-native-to-target

Same as above.

### vocab-choose-from-two-target-to-native

Same as above.

### vocab-choose-from-two-native-to-target

Same as above.

### vocab-choose-from-four-target-to-native

Same as above.

### vocab-choose-from-four-native-to-target

Same as above.

### Task Generation by Vocab Level and Length

#### not-specified

- **Level -1**: vocab-try-to-remember
- **Level 0**: vocab-choose-from-two-target-to-native
- **Level 1**: vocab-choose-from-two-target-to-native, vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native
- **Level 2**: vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native, vocab-choose-from-four-native-to-target
- **Level 3**: vocab-choose-from-four-native-to-target, vocab-reveal-target-to-native
- **Level 4+**: vocab-reveal-target-to-native, vocab-reveal-native-to-target

#### shorter-than-word

- **Level -1**: vocab-try-to-remember
- **Level 0**: vocab-choose-from-two-target-to-native
- **Level 1**: vocab-choose-from-two-target-to-native, vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native
- **Level 2**: vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native, vocab-choose-from-four-native-to-target
- **Level 3**: vocab-choose-from-four-native-to-target, vocab-reveal-target-to-native
- **Level 4+**: vocab-reveal-target-to-native, vocab-reveal-native-to-target

#### single-word

- **Level -1**: vocab-try-to-remember
- **Level 0**: vocab-choose-from-two-target-to-native
- **Level 1**: vocab-choose-from-two-target-to-native, vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native
- **Level 2**: vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native, vocab-choose-from-four-native-to-target
- **Level 3**: vocab-choose-from-four-native-to-target, vocab-reveal-target-to-native
- **Level 4+**: vocab-reveal-target-to-native, vocab-reveal-native-to-target

#### multi-word-expression

- **Level -1**: vocab-try-to-remember
- **Level 0**: vocab-choose-from-two-target-to-native
- **Level 1**: vocab-choose-from-two-target-to-native, vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native
- **Level 2**: vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native, vocab-choose-from-four-native-to-target
- **Level 3**: vocab-choose-from-four-native-to-target, vocab-reveal-target-to-native
- **Level 4+**: vocab-reveal-target-to-native, vocab-reveal-native-to-target

#### single-sentence

- **Level -1**: vocab-try-to-remember
- **Level 0**: vocab-choose-from-two-target-to-native
- **Level 1**: vocab-choose-from-two-target-to-native, vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native
- **Level 2**: vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native, vocab-choose-from-four-native-to-target
- **Level 3**: vocab-choose-from-four-native-to-target, vocab-reveal-target-to-native
- **Level 4+**: vocab-reveal-target-to-native, vocab-reveal-native-to-target

#### multiple-sentences

- **Level -1**: vocab-try-to-remember
- **Level 0**: vocab-choose-from-two-target-to-native
- **Level 1**: vocab-choose-from-two-target-to-native, vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native
- **Level 2**: vocab-choose-from-two-native-to-target, vocab-choose-from-four-target-to-native, vocab-choose-from-four-native-to-target
- **Level 3**: vocab-choose-from-four-native-to-target, vocab-reveal-target-to-native
- **Level 4+**: vocab-reveal-target-to-native, vocab-reveal-native-to-target


## Resource-Based

### add-vocab-to-resource

big, no difficulty eval, ask user whether to do again.

[generated](src/features/resource-update-tasks/updateResourceTasksService.ts) when a resource is created.


### add-fact-cards-to-resource

Works like `add-vocab-to-resource` 


## Goal-Based

### add-sub-goals

- [generated](/home/brokkoli/GITHUB/linguanodon/src/features/goal-update-tasks/updateGoalTasksService.ts) when a goal is created. shows the sub goal connected so far, standard adaptive meta-form with one line per goal and allowing to add one at the end. Ask whether to do task again. Size medium. can be considered done as soon as the sub goal list has changed.


### add-vocab-to-goal

- Works like `add-sub-goals`, just with vocab.