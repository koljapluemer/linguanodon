# MVP Clarification Questions

These questions need answers to ensure the queue-based language learning MVP is implemented correctly.

## **Queue Behavior & Flow**

### 1. Exercise vs Task Transitions
What determines when to show a task vs continue with exercises? Is it:
- After every N exercises?
- Based on task availability/priority?
- Random chance?

**Answer:**

- Start with a batch of exercises (random length as described)
- *note:* don't forget the preloading of the upcoming stuff here
- after this exercise batch is done, we want 1 task, if one is available
- when the task is done (or if we couldn't generate one), do the next batch of exercise, again random length
- observe the described smart preloading process so the user does not have to wait


### 2. Batch Completion
When `currentVocabForExercises` is exhausted, do we:
- Immediately switch to `nextVocabForExercises`?
- Check for tasks first?
- Always try to insert a task between batches?

**Answer:**

- As described above, try to do a task (one should be preloaded if one exists), if none exist, "swap" the batches and keep doing exercise

## **Task System Architecture**

### 3. Task Data Polymorphism
How should I handle the fact that different tasks need different data?
- Pronunciation tasks need a `VocabData`
- Immersion tasks need `ImmersionContentData`
- Should I use discriminated unions in `TaskData`?
- Or a generic `Task<T>` approach?

**Answer:**

- Leave `TaskData` as is, as its used for db stuff. Note that I added a `taskType` prop to it tho, so that we can see which task is meant.
- Decide for yourself how you want to handle live task, whether generic or discriminated union. Keep clean and extensible.

### 4. Task Proposer Priority
When multiple proposers suggest tasks, how do we choose?
- Random selection?
- Priority-based?
- Round-robin?

**Answer:**

- Random selection for now. Use array utils.

## **Exercise Generation Details**

### 5. Exercise Complexity
For levels above -1, you mentioned "reveal exercises from content to translations". Should this:
- Always show vocab → comma-separated translations?
- Sometimes reverse (translation → vocab)?
- Include multiple choice variations?

**Answer:**

- Simply directly show vocab → to comma-separated translations, similar to that task component in the legacy code.
- no multiple choice for now

### 6. Exercise Scoring
When scoring vocab, what constitutes "correct/easy" vs "wrong/hard"?
- Is this user self-reported?
- Based on response time?
- Different for different exercise types?

**Answer:**

- Please check the legacy code. This [file](legacy/pages/practice/ui/tasks/reveal/RevealTask.vue) shows how these tasks are done.
- And yes, self-reported so that it is easily feedabl to `ts-fsrs`
- And the initial level -1 "try to remember" has the very same buttons, like [here](legacy/pages/practice/ui/tasks/try-to-remember/TryToRememberTask.vue).
- Side note: When the level is -1, simply always `createEmptyCard` and set the level to 0


## **Repository & Data Concerns**

### 7. Demo Data Relationships
Should the demo content be:
- Completely interconnected (immersion content references existing vocab)?
- Independent per entity?
- What languages should I include?

**Answer:**

- Yes, interconnected. Just a few examples. Use something like Italian basic words or whatever.
- Ideally put the demo content in a json file, so i can later put cooler content there. 


### 8. Vocab-Immersion Association
How are vocab units "associated" with immersion content?
- Manually tagged during content creation?
- Auto-detected from content text?
- Pre-defined relationships?

**Answer:**

- as you can see in the type, immersion content has an array prop to save them
- as a perspective, we will mostly load them from the backend, with references to vocab already included.
- however, as you can read, when the user is watching the immersion content, they may also *add additional vocab* to immersion content via [this widget](src/features/add-vocab-to-immersion-content/AddVocabToImmersionContentWidget.vue). That should rather look and feel like [this legacy component](legacy/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormRender.vue) and [this](legacy/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormControl.vue)


## **UI/UX Flow**

### 9. Task Evaluation
After `DoTaskWidget` emits completion, what should `EvaluateTaskWidget` actually do?
- Rate task difficulty/usefulness?
- Schedule next occurrence?
- Update progress metrics?

**Answer:**

Good point. Yes, use two `<input type="range">` to record correctness and *difficulty*, perceived by the user. Then ask the user whether they want to do the task in the future "no", "yes", "maybe at some point" and upsert the progress metric (the binary, and nextShownAt to +1 day/+1 week) or something. KISS, this is just MVP/Proof of Concept 

### 10. Error States
How should the queue handle:
- No due vocab available?
- No tasks available?
- Repository errors?

**Answer:**

Add basic graceful handling. No tasks is fine, we will just only do exercises (but warn in console). No exercises is fine, we will just only do tasks (but warn in console). If we can't find either, show a little message on the page, and make sure we don't land in an endless loop crashing the browser.