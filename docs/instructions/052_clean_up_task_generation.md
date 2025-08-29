I resorted the generate-lesson folder.
Importantly, it's now more aptly called [generate-task](src/pages/queue/generate-task).


Help me complete the refactor

- I deleted `addTasksForVocabList`, it was weird and obsolete. Whoever imports that should do this functionality for itslf
- I commented out the logic of whether a given task can be generated in ALL of [these](src/pages/queue/generate-task/make-a-task). It's unnecessary. This logic should be executed in the caller to pick a useful entities in the first place. the `make-a-task` functions should then simply, well, generate the task. The commented out code is just for you to know what to implement in the callers. It should NOT!!! be uncommented again.
- Whenever!!! ANY!!! function needs to get an entity such as vocab or resource, it should DIRECTLY utilize a SPECIFIC [repo function](src/entities/vocab/VocabRepoContract.ts) instead of calling a general one and filter it in memory
- Build out the files in [this folder](src/pages/queue/generate-task/flavors/by-task-size-balance/helpers) and refactor [this](src/pages/queue/generate-task/flavors/by-task-size-balance/chooseTaskBasedOnUnderusedTaskSize.ts) into using them
- Make [maketask](src/pages/queue/generate-task/makeTask.ts) choose a flavor (as it already does), but then defer to the top level files in the relevant [flavor directory](src/pages/queue/generate-task/flavors)
- `src/pages/queue/generate-task/by-entity/vocab/getTaskBasedOnVocab.ts` was deleted. Cover its functionality [here](src/pages/queue/generate-task/by-entity/vocab/getRandomGeneratedTaskForVocab.ts) instead
- Fix import issues and now broken code. If you are unsure how to fix, IMMEDIATELY stop and ASK CLARIFICATION QUESTIONS. do not just hallucinate garbage into the file, as this will COMPLETELY kill the purpose of the refactor!!!!!!!!!!!!!!!!