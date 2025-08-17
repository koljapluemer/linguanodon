# Queue Rework

Let's change how queue works.
I already deleted a lot of obsolete proposer structure.
The new paradigm is:

- [this](src/pages/queue/useQueuePreloader.ts) calls [this](src/pages/queue/lesson-generator/makeLesson.ts)
- [the lesson maker](src/pages/queue/lesson-generator/makeLesson.ts) (needs to be implemented), picks a specific lesson flavor, for now, just randomly
- [each lesson flavor](src/pages/queue/lesson-generator/flavors) does fancy logic, but in the end just returns a [TaskData](src/entities/tasks/TaskData.ts) array. 
- For now, we have 3 flavors:

## [around due vocab](src/pages/queue/lesson-generator/flavors/makeLessonAroundDueVocab.ts)

- find `VocabData` that is due and was seen before (5-20 or however many we have if less).
- for each, randomly pick an active task attached to it, return the tasks

## [around new vocab](src/pages/queue/lesson-generator/flavors/makeLessonAroundNewVocab.ts)

exactly as above, only reduce nr of due seen vocab to 5-17 and add 3-5 unseen (=new) vocab (or rather, their active tasks)

## [around resource extraction](src/pages/queue/lesson-generator/flavors/makeLessonAroundResourceExtraction.ts)

- randomly decide nr of tasks (5-20)
- find an active `ResourceData` object
- randomly attach one of its aktive tasks to the tasks[]
- fill up with active tasks of `vocab` attached to the [ResourceData](src/entities/resources/ResourceData.ts)
- If still vocab missing to fill up intended nr of task, add tasks of due seen vocab (from the whole app)

## Clarification Questions:

### Current Architecture Analysis
1. **Current vs New**: The existing `useQueuePreloader.ts` has its own logic with VocabPicker/ResourcePicker. Should this be completely replaced with the new lesson-based approach, or should they coexist?

replace

2. **File State**: The lesson generator files (`makeLesson.ts` and all flavor files) are currently empty. Should I implement them from scratch?

yes, from scratch

### Lesson Selection Logic
3. **Lesson Flavor Selection**: How should `makeLesson.ts` decide which flavor to use? Completely random (33% each), or should there be weighting based on user progress/preferences?

Just random. use a function in src/shared to pick random from array so i can easily add more flavors in the future

4. **Lesson Timing**: When/how often should new lessons be generated? On each queue access, periodically, or when the current lesson is depleted?

Please understand the current queue logic. This should be completely implemented

### Data Requirements
5. **"Due" Vocab Definition**: What defines vocab as "due"? Should I use the existing `getDueVocabInLanguage()` method, or implement new logic based on spaced repetition timing?

existing get due. 

6. **"Seen Before" vs "New" Vocab**: How do we determine if vocab was "seen before"? Is this based on `progress.level >= 0` or some other criteria?

progress level 0 is fine. there should be an entity function for it, or add one

7. **"Active" Resources**: What makes a ResourceData "active"? Any specific criteria beyond having active tasks?

yeah, active tasks

### Task Selection Logic  
8. **Random Task Selection**: When picking "randomly pick an active task attached to it" for vocab - should this be truly random or weighted by task type/priority?

truly random. KISS.

9. **Task Limits**: The flavors specify different ranges (5-20, 5-17+3-5). Should these be configurable constants or hardcoded?

make them obviously configurable in the flavor files, but don't overthink

### Integration Points
10. **Repository Dependencies**: Should the lesson generators receive repo instances as parameters, or should they be dependency-injected like the current architecture?

parameters. the queue component/page should pass them in, and they get it provided

11. **Error Handling**: How should the system handle cases where there aren't enough due/new vocab or active resources to fill a lesson?

throw a warning, but then just continue

12. **Caching**: Should lesson results be cached, or generated fresh each time?

new every time