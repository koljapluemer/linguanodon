Let's improve goal management.

First of all, break [the goal page](src/pages/goals-manage/PageManageGoal.vue) into two [pages](src/pages), like vocab: [add](src/pages/vocab-add) and [edit](src/pages/vocab-edit)

The goal add page should be normal inputs.
Its just a few fields, so we do not to replicate the "show all data" toggle structure from vocab.

Allow user to input:
- language
- title

Buttons at the bottom:
- cancel
- save (saves and redirects to edit)
- save and add another (saves and redirects to empty add page)

Now, the edit page is a bit more complex.
First, it should use the inline form elements like the vocab edit page!!

Again, we don't need a toggle for fields, its not that many, but we have a few more:

- prio
- doNotPractice
- isAchieved

Then, we have a bunch of stuff that is managed via its own features:

- [subgoals](src/features/goal-manage-its-sub-goals/ManageSubGoalsWidget.vue). Check how [vocab form](src/pages/vocab-edit/ui/VocabFormCoreRenderer.vue) renders translations for inspiration. should allow editing the titles via a button, and to delete them, and also to go the edit page of that goal
- directly below that, allow toggling `finishedAddingSubGoals`
- milestones: this is how the user can check whether they have achieved this goal, tangible actions that prove progress. These are simple strings with a toggle on whether this milestone is achieved. They should also have their own feature (does not exist yet)
- facts cards and vocab, also have their own widgets and directly below that we need `finishedAddingKnowledge`

In general, and this applies to THE PAGES AND THE FEATURES, KEEP IT SIMPLE!! At the moment, we have 10 million wrapper containers, every heading 5 times and everything is a card. Do not do that.