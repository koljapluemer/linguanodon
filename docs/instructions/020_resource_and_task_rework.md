# Resource and Task Rework

## Core Idea

Let's make `Task` its own entity, with a repo, repo contract and own entity function and some entity UI stuff (and standardize its relationship management and display)

## Changes

- `ResourceData` no longer extends `TaskData`, but instead has an array `tasks` referring to `TaskData` (which was also changed substantially and [moved here](/home/brokkoli/GITHUB/linguanodon/src/entities/tasks/TaskData.ts))
- I removed `RuntimeTaskType`. It's no longer needed, now that tasks actually carry their own data references. Look for usage and replace.
- [Task](/home/brokkoli/GITHUB/linguanodon/src/entities/tasks/Task.ts) is the runtime object, used to standardize task state etc.

## Small Stuff

- [ResourceData](src/entities/resources/ResourceData.ts) props vocab, examples and factCards were renamed for clarity. Check if that caused issues, possibly w/ dexie.
- `ResourceData` no longer extends LocalObject, it's not needed. Check dexie.
- Instead of [the resource task](src/widgets/task-for-resource/RenderTaskForResource.vue) being one giant fat thing, it should be split into three separate tasks: 'add-vocab-to-resource', 'add-examples-to-resource', 'add-fact-cards-to-resource' (that allows us to get rid of the tabbed layout)
- Instead of showing the button for one task modal on the [resource page](src/pages/resources/PageManageResource.vue), show a list of associated tasks on the bottom of the page, each with a button to do the task
- We want a page that lists our last 50 executed tasks in a tabular fashion, just for interest 
- `RemoteResourceData` changed a little, but not much. When loading remote resource data, auto generate the three tasks named above, persist them and attach them to the resource ("Go to resource and extract interesting vocab", ...)



## Notes

- Do not consider "merging" or "migrations" or "backwards compatibility". This is an early prototype. We will simply throw away the data.

## Clarification Questions

1. **Task Repository Implementation**: Should we create a new TaskRepo with TaskRepoContract following the same pattern as other entities? What methods should it include (getTaskById, getAllTasks, saveTask, deleteTask, getTasksByResourceId)?

yes. standard CRUD, and what you need to implement the requirements above.

2. **RuntimeTaskType Migration**: I found 15+ files importing `RuntimeTask` and `TaskDefinition` from `@/shared/RuntimeTaskTypes` (which doesn't exist). Should we:
   - Create new TaskData-based equivalents for RuntimeTask and TaskDefinition?
   - Update TaskProposerContract to return Task (the runtime object) instead of RuntimeTask?
   - Update TaskRegistry to work with the new TaskType enum?

- the old runtime tasks was a dumb hack to associate other entities with tasks, because tasks all the time refer to different objects like vocab or resources. For that, [TaskData](src/entities/tasks/TaskData.ts) now has an actual prop `associatedUnits` which saves the type of referenced object and its uid. Rebuild references to use this approach. It should not be needed to build additional data structure, TaskData is now actually the source of truth

3. **Resource Property Renaming**: ResourceData.ts:15-17 shows properties renamed to `vocab`, `examples`, `factCards`. Should we verify these match any existing Dexie schema or do we need to handle the schema changes?

Just tabula rasa. I will delete the old db.

4. **Task Association with Resources**: When loading RemoteResourceData, should the three auto-generated tasks ('add-vocab-to-resource', 'add-examples-to-resource', 'add-fact-cards-to-resource') be:
   - Created immediately when importing the remote resource?
   - Created on-demand when the resource is first accessed?
   - Have specific prompts/titles or generic ones?

Immediately.

5. **Task List Page**: For the "last 50 executed tasks" page, should this:
   - Be a new route like `/tasks/history`?
   - Show task completion timestamps, difficulty ratings, correctness ratings?
   - Allow filtering by task type or associated entities?

yes, new route, simply `tasks/`. Name, prompt, and the data you mentioned. no crazy filters or anything. KISS. this is mostly for debug

6. **Association Interface**: In TaskData.ts:32-35, the Association interface is defined but not used. Should `associatedUnits` be of type `Association[]` instead of `AssociatedEntity[]`?

good catch. fixed already.

7. **Task Size and Scheduling**: The TaskData includes `taskSize`, `lastShownAt`, `nextShownEarliestAt` - should these integrate with the existing queue system's scheduling logic, or is this a separate task scheduling mechanism?

Ignore the queue for now as much as you can. We will get to that in a following step.

8. **ResourceData.tasks Array**: Should this array maintain referential integrity with the TaskRepo? Should tasks be automatically deleted when a resource is deleted?

Yes, that would be good. Note that we use Feature-Sliced Design, though!! No imports on the same layer; for example, tasks repo may not import resoruce repo or vice versa!!