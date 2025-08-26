- split [the resource page](src/pages/resources-manage/PageManageResource.vue) into two pages, one for edit and one for delete, like described for [goals here](docs/instructions/046_better_goal_management.md)
- do not use an extra feature to manage the resource
- add form is similar as for goals, input fields, allow language, goal, content and link. Use [Linkform](src/shared/links/LinksForm.vue) to manage the link like the [vocabform](src/pages/vocab-add/ui/VocabAddFormAdvancedPropsRenderer.vue) does. However, in this case, we can only add one link. Manage that via a prop on the `LinksForm` so the UI makes sense.

- on the edit page, use Inline* component. Additionally Allow editing prio now, and whether extraction is finished.
- Notes again should work like [here](src/pages/vocab-add/ui/VocabAddFormAdvancedPropsRenderer.vue)
- Vocab should be managed via its own widget, parallel to how [this](src/pages/goal-edit/PageGoalEdit.vue) does it. Utilize the [vocab list](src/features/manage-vocab-list/ManageVocabList.vue) feature.
- Make a similar structure for fact cards: a widget to manage fact cards of a resource, and a general use feature to manage [fact cards](src/entities/fact-cards/FactCardData.ts) via their repo
- Make sure these widgets are usable and used for [this task](src/tasks/task-resource-extract-knowledge/RenderExtractKnowledgeFromResource.vue) (feel free to adapt the existing widgets mentioned in that file)