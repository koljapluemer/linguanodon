# Examples

Let's build examples.
From the user perspective, these are mostly *sentences* that show how a given vocab unit may be used.

In the UI, we usually call them *Usage Example* or *Example*

## Reqs

- They are their own entity, with their own repo, abstracted behind a contract, living in their own folder in `entities` which may (FSD rules!) not import or be imported by other entities
- very similar to `src/pages/immersion-content`, we want to have 2 pages, one to list examples, one to edit one

- They have the following propos:
    - `id`
    - `language`
    - `content`?: str
    - `translation`?: str
    - `isUserCreated?`
    - `associatedVocab`: `str[]` // ids of vocab
    - `associatedTasks`: `TaskData[]`


## Main Flow

Beside looking at the examples, editing them and adding new ones, we have the following flow:

### Free Translation

This applies for externally added `Example`s (`isUserCreated` = false).

From the user perspective, it looks at follows:

After practicing a good amount of the associated vocab, we get the exercise 

"Attempt to translate this sentence", a text field, and a "Reveal demo solution".

Then, the difficulty/correctness is rated, and user chooses whether to do this again.

- This feature was partly built in legacy code, see [here](legacy/pages/practice/ui/tasks/free-translate/FreeTranslateTask.vue) and [here](legacy/pages/practice/model/FreeTranslateNewSentenceLessonGenerator.ts) for inspiration.

Now this functionality needs two parts:

#### Free Translate Task Itself

made from:

- A [task proposer living here](src/pages/queue/propose-which-task-to-do) (which ofc needs to be integrated in the random selection/propose logic), which 
    - checks for `Example`s in their repo via the repo contract that either
        - are `isUserCreated` = false and have a `TaskData` of `taskType` "free-translate" in their array `associatedTasks` (make sure to persist this correctly btw!!) and its `wantToDoAgain` and its `nextShownAt` is in the past *and* `isCurrentlyTopOfMind` is true for >= 60% of its associated units (check [this doc](docs/instructions/007_immersion_content_threshold.md) and vocab entity for this feature)
        - are `isUserCreated` = false and they have no `TaskData` with type "free-translate" in their array *and* `isCurrentlyTopOfMind` is true for >= 60% of its associated units (check [this doc](docs/instructions/007_immersion_content_threshold.md) and vocab entity for this feature)
    - ...then proposes the actual free translate task
- Of course, needs the task ui itself, which should lvie in `src/widgets`, like all tasks

#### Free Translate Vocab Proposers

For this feature to work well, examples also "want" that their units are practiced. As such, they also get their own vocab proposer which should live and be integrated [here](src/pages/queue/propose-which-vocab-to-practice)

It looks for any `example` that similar to above is both:
- not user created and due (or such task was never done)
- and `isUserCreated` is true for *less than* 80% of its units

It then proposes *all due vocab units* from the randomly picked example such chosen.

## Notes

I want to generate some examples outside this app as default data — to ensure that I get that right, please add two demo examples to [this json file](src/shared/demo-data/demo.json)

## Implementation Plan

Based on analysis of existing patterns (ImmersionContent, vocab proposers, task system), here's the implementation plan:

### Phase 1: Entity Layer (FSD)
1. **Create Examples Entity Structure**
   - `src/entities/examples/ExampleData.ts` - Interface definition
   - `src/entities/examples/ExampleStorage.ts` - Dexie storage implementation  
   - `src/entities/examples/ExampleRepo.ts` - Repository implementation
   - `src/entities/examples/ExampleRepoContract.ts` - Repository contract interface

### Phase 2: Repository Integration
2. **Repository Injection**
   - Add ExampleRepo to `src/app/injectRepositories.ts`
   - Update dependency injection system

### Phase 3: Pages Layer (FSD)
3. **Create Pages (following immersion-content pattern)**
   - `src/pages/examples/PageListExamples.vue` - List page
   - `src/pages/examples/PageManageExample.vue` - Edit/create page
   - Add routes to router

### Phase 4: Features Layer (FSD)
4. **Create Form Components**
   - `src/features/example-form/ExampleFormController.vue`
   - `src/features/example-form/types.ts` - Form data types
   - `src/features/example-form/useExampleForm.ts` - Form composable
   - `src/features/example-list/ExampleListWidget.vue`

### Phase 5: Task System Integration
5. **Free Translate Task Proposer**
   - `src/pages/queue/propose-which-task-to-do/proposers/ProposeFreeTranslate.ts`
   - Register in `TaskRegistry.ts`
   - Update `TaskPicker.ts` initialization

6. **Free Translate Task Widget**
   - `src/widgets/free-translate-task/FreeTranslateTaskWidget.vue` (based on legacy)
   - Update `MetaTaskRenderer.vue` to handle 'free-translate' taskType

### Phase 6: Vocab System Integration  
7. **Examples Vocab Proposer**
   - `src/pages/queue/propose-which-vocab-to-practice/proposers/ProposerByExamples.ts`
   - Register in `VocabPicker.ts`

### Phase 7: Data & Testing
8. **Demo Data**
   - Add two demo examples to `src/shared/demo-data/demo.json`

## Clarification Questions

1. **ExampleData Properties**
   - Should `content` and `translation` be required or optional? The interface shows `content?` and `translation?` but typical examples would need both.
   - Should we add `createdAt`/`updatedAt` timestamps like we considered for ImmersionContent?

*both* are optional. this will make sense for future features

at no point did I ever desire `createdAt` or `updatedAt` timestamps. I still don't.

*Do* however simply extend [Local Object](src/shared/LocalObject.ts) for our `ExampleData` type.

2. **TaskData Integration**
   - The spec mentions Examples have `associatedTasks: TaskData[]` - should this follow the same pattern as ImmersionContent where TaskData is embedded directly in the Example entity?
   - When a free-translate task is completed, should it automatically create/update a TaskData entry in the Example's associatedTasks array?

If you can handle the array of arbitrary length smoothly, please just do so, yes.
Yes, please upset a task of type "free-translate" on completion into the array. (if already one exists in the array with "free-translate", edit)

3. **Task Proposer Logic**
   - For condition "are `isUserCreated` = false and have a `TaskData` of `taskType` \"free-translate\"" - should we check that the task's `nextShownEarliestAt` is in the past AND `wantToDoAgain` is true?
   - The 60% top-of-mind threshold - should this be configurable or hardcoded?

yes, your logic is correct.
put the threshold configurable in a config on top of the relevant file, but hrdcode

4. **Vocab Proposer Logic**  
   - For "isUserCreated is true for *less than* 80% of its units" - this seems like a typo. Should it be "isCurrentlyTopOfMind is true for less than 80%"?
   - Should we prioritize examples that are closer to the 80% threshold, or select randomly among all qualifying examples?

good catch. yes, talking about isCurrentlyTopOfMind. Random pick is fine for now.

5. **UI/UX Considerations**
   - Should the Free Translate Task widget show the user's previous attempts if they've done this example before?
   - Should examples have a difficulty rating or priority system like ImmersionContent?

No, nothing like that for now

6. **Data Relationships**
   - How should we handle the relationship between Examples and Vocab? Should Examples store vocab IDs in `associatedVocab` or should Vocab entities reference Examples?
   - Should we validate that all `associatedVocab` IDs exist when creating/updating Examples?

Examples should store vocab ids in `associatedVocab`
No validation for now, we handle that later.