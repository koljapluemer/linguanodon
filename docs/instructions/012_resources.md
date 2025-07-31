# Resources

An entity related to reading blog posts about grammar or watching videos with important language knowledge

## Similarities to ImmersionContent

- `Resource` is extremely similar to the `ImmersionContent` (`src/entities/immersion-content`) entity, as you can see when checking [its interface](src/entities/resources/ResourceData.ts) which is already defined
- It should have its own repo (with contract and dexi implementation), and its own task, structured like [this one](src/widgets/task-for-immersion-content).
- The differences are:
    - The wording on the Resource task is "extract important words, examples and facts from the resource"
    - It should be possible to manage in this task words, examples, and facts
    - for all 3 of these, we should use fairly dumb forms that use props and emits and live in the entity folders (form for group of vocab, form for group of examples, form for group of fact cards). These then should be used by 3 features (manage-vocab-of-resource, manage-examples-of-resource, manage-facts-of-resource). All these should be then used in a task (living in widgets) `task-for-resource` which basically mirrors [this task](src/widgets/task-for-immersion-content/RenderTaskForImmersionContent.vue).

- [like immersion content](src/pages/queue/propose-which-task-to-do/proposers/ProposeImmersionContent.ts), resources should have their own proposer, albeit much simpler: since resources do not have required vocab that has to be learned first, the proposer for now just picks a resource at random (yes, JUST at random) and proposes the task as described above
- no vocab proposer for resources
- Build a list and a form page for resources, build the routes and integrate in App.vue header like all the other standard pages.

## Clarification Questions

1. **Entity Form Design**: For the 3 dumb entity forms (VocabGroupForm, ExampleGroupForm, FactCardGroupForm), should they:
   - Allow inline creation of new items OR only manage existing item associations?
   - Use simple multi-select dropdowns OR more complex management interfaces?

They simply get an array of existing items, which may be empty. Display each in a row (short form, not every possible prop). On clicking on a row, it switches to an edit mode. For each row, use actually a nested dumb component (or two) for simply displaying editing this specific thign. In the last row of the meta form, always have an input row to add new stuff

I have no idea why you are talking about "multi-select dropdowns"?!?!

2. **Resource Task Wording**: The task instruction is "extract important words, examples and facts from the resource" - should this:
   - Display the resource content (title/prompt/extraInfo) for reference?
   - Have separate sections for each type (vocab, examples, facts) OR integrated interface?

Make this instruction the prompt. Display title and extra info. Utilize this to show the task.
You can make sections, but all is on one page.

3. **Task Completion Logic**: When a user completes the resource task, should it:
   - Update the resource's TaskData fields (lastShownAt, wantToDoAgain, etc.)?
   - Have an evaluation step like immersion content OR just mark complete?

Show our standard [eval widgt](src/features/evaluate-task-widget) and evaluate accordingly.

4. **Demo Data Content**: What type of sample resources should be included?
   - Grammar articles, cultural blog posts, language learning videos?
   - How many sample resources (3-5)?

Just make 3 things up. This is just about the data structure.

5. **Resource Proposer Priority**: Since it picks "just at random", should it:
   - Respect TaskData scheduling fields (nextShownEarliestAt) OR truly ignore everything?
   - Have any filtering by language OR completely random across all resources?

Respect the field. No lang filtering

6. **Entity Form Patterns**: Should the dumb entity forms follow the same auto-save pattern as notes, or require explicit save actions like the vocab management widgets?

Auto save