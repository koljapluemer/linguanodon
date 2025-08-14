# Fixing Goals

Let's fix up goals.

They are currently in a broken state, halfway between a legacy implementation and a current one.

## Current State Analysis

The current goal implementation:
- ✅ `GoalData` interface has `tasks: string[]` array for task IDs (good)
- ✅ Goal task widgets exist: `src/widgets/task-goal-add-vocab/` and `src/widgets/task-goal-add-sub-goals/`
- ✅ `GoalRepoContract` has basic CRUD operations
- ✅ `TaskRepoContract` exists with basic task management
- ❌ No `getTasksByGoalId` method in `TaskRepoContract`
- ❌ No goal-update-tasks feature (vocab-update-tasks exists as template)
- ❌ No auto-generation of goal tasks on creation/completion
- ❌ PageManageGoal.vue doesn't trigger task generation

## Clarification Questions

1. **Task Types for Goals**: What specific task types should be generated for goals? Looking at the existing widgets, I see:
   - `task-goal-add-vocab` - for adding vocabulary to goals
   - `task-goal-add-sub-goals` - for adding sub-goals
   
   Are these the only two types, or are there other goal-related tasks we need?

For now, only ones

2. **Task Generation Timing**: When exactly should goal tasks be auto-generated?
   - On goal creation (new goal)?
   - When goal is modified (vocab/sub-goals added/removed)?
   - When a goal-related task is completed?
   - All of the above?

- on goal creation, on goal-related task completion

3. **Task Lifecycle**: Should goal tasks be:
   - Single-use (deleted after completion)?
   - Recurring (regenerated based on goal state)?
   - Conditional (only created if goal meets certain criteria)?


- use `decideWhetherToDoAgainAfterDoing=True`. this means that the user decides whether to do task again in the future.

4. **Queue Integration**: For the queue system integration:
   - Should goal tasks be weighted differently from vocab/resource tasks?
   - Should goal tasks have priority over other task types?
   - How often should goal tasks appear relative to vocab exercises (you mentioned "1 goal-based task per queue iteration")?

   - I mentioned "1 goal-based task per queue iteration" because I meant exactly that. No either weighting or prio.

5. **Goal Task Proposer**: Should the goal proposer:
   - Pick from any incomplete goals randomly?
   - Prioritize goals by some criteria (creation date, priority field, etc.)?
   - Consider goal dependencies (sub-goals before parent goals)?

- for now, any goal in th repo where `doNotPractice` is not true

