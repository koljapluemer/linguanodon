# Goals

The user should be able to set goals. 
These will then bit-by-bit filled up and fulfilled, mainly by a range of tasks.

## Needed Components

### Type and Repo

Like other [entities](src/entities), goals should have their own interface and repo, with content and implementation.
Should have the following props

```
interface Goal implements LocalObjects implements Task {
    uid
    subGoals: str[] // array of uids of other goals
    milestones: Task []
    coreTasks: Task[] // auto-generated when task started
    vocab: str[] // uids of `Vocab`
    examples: str[] // uids of `Example`
}
```


### Pages

A `PageManageGoal` and `PageListGoals`, similar pattern to other [pages](src/pages).

- `PageManagGoal` should mainly import the features below, thus allowing adding a new or editing an existing goal on one page

### Features

#### edit-goal

very simple ui that's just an input, letting the user complete the sentence "I want to be able to ".
Since we're extending `TaskData`, we will save the input as `title`. `taskType` is "complete-goal"
On save, some fancy stuff (task auto generating) has to happen on entity level, see below.

#### mark-whether-goal-is-completed

a simple ui listing a given goal's subgoals, milestones and nr of vocab and nr of examples ,and let's the user decide whether the goal is completed w/ two buttons

This UI is interacting with the repo, and the repo is updating `wantToDoAgain` which our base interface `TaskData` provides us.

#### manage-sub-goals-of-goal

a simple ui where new goals can added as sub-goal of the goal. simply render existing sub-goals line by line, allow removing/editing their `title`, and always smartly have the last line be an empty input field where the user can add new sub goals.

#### manage-vocab-of-goal

similar to above, but with vocab. 
existing vocab is shown in a pragmatic view row by row, (just lang, content and translations as badges), and in the dynamic last row new vocab can be attached. text field for the lang, text field for the content (optional), single text field to add one translation (also optional but either the `content` or the `translation` field must be set to allow adding the vocab unit)

Make sure to talk to all relevant repos.

#### manage-examples-of-goal

*Exactly* the same idea, but for `ExampleData` and its repo.


#### manage-milestones

Allows managing (add and edit) of `milestones`, custom tasks the learner can do to check whether they fulfilled the goal (such as "count to 20 in your head" or "form five sentences using past tense")

On the UI side, this is again just simple text fields, row by row (user can only influence `title` of the task)

### Tasks

Based on these, we can define a bunch of tasks. These should live in `widgets/` and be integrated in the [task proposer](src/pages/queue/propose-which-task-to-do/proposers) structure like the existing ones


#### Task to add subgoal

When adding a new goal to the repo, append a core task to `coreTask`. `title` "Add Sub-Goals", `prompt` "Add smaller goals that help you achieve this larger goal".

Proposed by the proposer if we have a goal thats not done yet (`wantToDoAgain` !== false) and its attached task `add-sub-goals` is also not yet === false.

The UI utilizes the "manage-sub-goals" feature described above. Prompt the user to complete "To reach the goal defined above, I will learn to "


#### Task to add vocab

Same idea: on creation, we add a `add-vocab-to-goal` to the goal and so on. Again, we check for goals not done, with this task not done, and using the feature above, prompting the user to add vocab.


#### Task to add examples

Same idea, with `add-example-to-vocab`.


#### Adding Milestones

Same idea, with `add-milestones`. Again, feature above.


*...more to come, but not now*

## Vocab Proposer

We also want to build and integrate a [vocab proposer](src/pages/queue/propose-which-vocab-to-practice). It should propose any due or new vocab from a randomly chosen goal that's not done.

## Example

At last, add 2 valid goal examples, fully typed and with the props set to useful stuff to [our example file](src/shared/demo-data/demo.json)

## Clarification Questions

Please clarify these aspects to ensure the best implementation:

1. **Goal Hierarchy**: Should sub-goals have their own sub-goals (recursive nesting) or is it just one level deep?

Recursive, but non-cyclic. Every goal can also have only one parent (but multiple children)

2. **Core Tasks Auto-generation**: When exactly should the core tasks (add-sub-goals, add-vocab, add-examples, add-milestones) be created? Should they all be created immediately when a goal is created, or should they be created on-demand?

when goal is created

3. **Goal Completion Logic**: Should a goal be automatically marked as completed when all its sub-goals, milestones are done and vocab/examples are learned? Or is it always manual via the "mark-whether-goal-is-completed" feature?

always manually.

4. **Vocab Selection for Goals**: For the vocab proposer, should it prioritize vocab from goals that have fewer completed vocabulary items, or should it be purely random selection from incomplete goals?

purely random

5. **Task Priority**: Should goal-related tasks (add-sub-goals, etc.) have higher priority than other tasks in the queue system?

no. random select.

6. **Milestone Validation**: Should milestones be automatically marked as complete based on some criteria, or are they always manually marked by the user?

manually. that's not really implemented yet as a task, that's fine.

7. **Goal Progress Tracking**: Do you want any progress indicators showing completion percentage based on associated vocab mastery, completed sub-goals, etc.?

sure, now that you ask, show `topOfMind` % for the associated vocab on the goal in the list 

8. **UI Layout**: For the manage-goal page, should all features (edit-goal, manage-sub-goals, manage-vocab, etc.) be on a single page with tabs/sections, or should they be separate routes?

just sections. it's essentially just one form, pieced together