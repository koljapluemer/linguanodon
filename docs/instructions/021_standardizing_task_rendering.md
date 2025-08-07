ok. let's standardize task rendering a bit. Make a vue component in entities/tasks (no updward depencencies!) called    │
│   DoTaskFrame. In it, standardize: render the task name, and the task prompt in a defined way. then, leave a slot (if     │
│   that's the best concept) for the actual task's content which will vary from task to task. Listen to                     │
│   "taskMayNowBeConsideredDone" and "taskMayNowNotConsideredDon" and "taskDone" events from within the slot (it's the      │
│   responsibility of the individual task to actually throw these events). Show at the bottom 3 buttons: "Don't do this     │
│   task" "Skip" and "Done". "Don't do this task" immediately emits taskFinished (not the same as taskDone, which is an     │
│   internal signal used to potentially show the feedback stuff!) and set's TaskData.isActive to false. "Skip" also emits   │
│   taskFinished but does not deactive. "Done" is disabled until "taskMayNowConsideredDone" is fired.

For example, the add-vocab-to-resource task fires "taskMayNowConsideredDone" when the id list of vocab has changed at least once.
When the "Done" button is enabled and clicked, fire "taskDone" event.

If the Task (due to its TaskData) has both evaluateCorrectnessAndConfidenceAfterDoing and decideWhetherToDoAgainAfterDoing, just trigger "taskFinished". If not, render a "new" screen showing again the name of the task and (if that's on `true`) the evaluation sliders we already have and/or (if relevant prop `true`) the buttons deciding whether to do the task again. When the displayed stuff is answered, fire taskFinished

## Clarification Questions

1. **Button Wording**: The instructions mention three buttons: "Don't do this task", "Skip", and "Done". Should the first button be labeled "Don't do this task" exactly, or would "Deactivate Task" or "Disable Task" be more appropriate for the UI?

how about "Skip and Deactivate" and "Not now" on the second.

2. **Event Naming**: The instructions mention "taskMayNowNotConsideredDon" (likely a typo for "taskMayNowNotBeConsideredDone"). Should this be "taskMayNotBeConsideredDone" or "taskCannotBeConsideredDone"?

`taskMayNowNotBeConsideredDone`. As in, *just now* an event happened that disallows that the task may be considered done. This is currntly not possible, but will be used in later implementations.

3. **Slot Content Responsibility**: The instructions say individual tasks should emit the state events. Should the existing task components (like ManageVocabOfResourceWidget) be modified to emit these events, or should we create wrapper components that detect changes and emit the events?

What do you recommend? I don't really care, I just want one big component that manages this meta-task stuff that will otherwise will be replicated in every single task.

4. **Task State Persistence**: When "Don't do this task" sets `TaskData.isActive = false`, should this be persisted immediately to the TaskRepo, or should it be passed up through events for the parent to handle persistence?

Put it in a good place. I leave the decision to you for now.

5. **Evaluation Screen Logic**: The instructions say "If the Task has both evaluateCorrectnessAndConfidenceAfterDoing and decideWhetherToDoAgainAfterDoing, just trigger taskFinished". This seems backwards - shouldn't it show evaluation/decision screens if these flags are true, and skip them if false?

yes, you are right

6. **Existing EvaluateTaskWidget Integration**: There's already an EvaluateTaskWidget with correctness/difficulty sliders and "do again" buttons. Should DoTaskFrame use this existing component, or create its own evaluation UI?

use this. Move it into the task entity folder

7. **Task Content Change Detection**: For the add-vocab-to-resource example, how should we detect when "the id list of vocab has changed at least once"? Should we:
   - Monitor the ManageVocabOfResourceWidget's @update:vocab-ids event?
   - Compare initial vs current vocab list in the parent?
   - Add change tracking to the TaskRepo?

Yes, monitor `ManageVocabOfResourceWidget` update events.

8. **Entity Layer Dependencies**: The DoTaskFrame will be in entities/tasks but needs to handle task persistence (setting isActive = false). Should it:
   - Emit events for parent components to handle persistence?
   - Inject TaskRepo directly (violating the "no upward dependencies" rule)?
   - Accept a persistence callback prop?

I don't understand. `DoTaskFrame` is IN the entities/tasks folder. As such, it can of course handle persistence to a repo that's also IN the entities/tasks folder?!?!

9. **Evaluation Data Storage**: When evaluation/decision screens are completed, should the results be:
   - Stored in TaskData fields (lastDifficultyRating, lastCorrectnessRating)?
   - Passed up through the taskFinished event?
   - Both?

Just persist in `TaskData`

10. **Multiple Evaluation Flags**: What should happen if only one of `evaluateCorrectnessAndConfidenceAfterDoing` or `decideWhetherToDoAgainAfterDoing` is true? Show only that specific evaluation component?

exactly that, show either or both or skip completely, depending on the flags