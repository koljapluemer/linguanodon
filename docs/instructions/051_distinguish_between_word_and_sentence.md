Let's distinguish between [Vocab](src/entities/vocab/vocab/VocabData.ts) with length "word" and "sentence" a bit better.

As a first step, I have changed the allowed [lengths](src/shared/Length.ts) to a simple type and only included "sentence" and "word".

Run linter and build and see what breaks; add all affected files to the bottom of this file with a one-sentence explanation of how vocab length is used in that context

## Context

**src/entities/remote-sets/validation/vocabSchema.ts** - Uses Length as a Zod enum for validating vocabulary length field in remote dataset schemas.

**src/entities/vocab/vocab/VocabData.ts** - Uses Length type to define the length property in VocabData interface structure.

**src/pages/vocab-add/ui/VocabAddFormAdvancedPropsRenderer.vue** - Uses Length values to populate length dropdown options in the advanced vocabulary creation form.

**src/pages/vocab-add/ui/VocabAddFormController.vue** - Uses Length values as default options for the length field in vocabulary creation forms.

**src/pages/vocab-add/ui/VocabAddFormMetaRenderer.vue** - Uses Length values to generate dropdown options for vocabulary length selection during creation.

**src/pages/vocab-edit/ui/VocabEditFormController.vue** - Uses Length values to populate length field options in vocabulary editing forms.

**src/pages/vocab-edit/ui/VocabFormAdvancedPropsRenderer.vue** - Uses Length for creating dropdown options and type checking in advanced vocabulary edit form.

**src/pages/vocab-edit/ui/VocabFormCoreRenderer.vue** - Uses Length values for length field options in the core vocabulary editing interface.

**src/pages/vocab-edit/ui/VocabFormMetaRenderer.vue** - Uses Length to generate length dropdown options in the vocabulary metadata editing form.

**src/features/manage-vocab-list/ManageVocabList.vue** - Uses hardcoded "not-specified" length value when creating vocab entries.

**src/pages/downloads/UnifiedRemoteSetService.ts** - Maps external length values to internal Length type for imported vocabulary.

**src/pages/queue/lesson-generator/task-generator/generateClozeChoiceFromFour.ts** - Checks vocab length against old values "multi-word-expression" and "single-sentence" to determine task eligibility.

**src/pages/queue/lesson-generator/task-generator/generateClozeChoiceFromTwo.ts** - Checks vocab length against old values "multi-word-expression" and "single-sentence" to determine task eligibility.

**src/pages/queue/lesson-generator/task-generator/generateClozeReveal.ts** - Checks vocab length against old values "multi-word-expression" and "single-sentence" to determine task eligibility.

**src/pages/queue/lesson-generator/utils/getRandomClozeChoiceTask.ts** - Uses length comparisons with old values "multi-word-expression" and "single-sentence" for task filtering.

**src/pages/queue/lesson-generator/utils/getRandomClozeRevealTask.ts** - Uses length comparisons with old values "multi-word-expression" and "single-sentence" for task filtering.

**src/tasks/task-cloze-choice/TaskClozeChooseFromOptions.vue** - Compares vocab length against old values "single-sentence" and "multi-word-expression" for UI rendering.

**src/tasks/task-cloze-reveal/TaskClozeReveal.vue** - Compares vocab length against old values "single-sentence" and "multi-word-expression" for UI rendering.

**src/tasks/task-vocab-reveal/TaskVocabReveal.vue** - Compares vocab length against old values "single-sentence" and "multiple-sentences" for UI rendering.

**src/tasks/task-vocab-try-to-remember/TaskVocabTryToRemember.vue** - Compares vocab length against old values "single-sentence" and "multiple-sentences" for UI rendering.