# Immersion Content Management

- Users should be able to see and manipulate immersion content, as well as adding new on their own
- The core features of this entity are to be found [here](src/entities/immersion-content)
- We have some legacy pages for managing (a slightly differently defined) immersion content, see `legacy/pages/manage-immersion-content/PageManageImmersionContent.vue` and `legacy/pages/list-immersion-content`


## Goals

- Make a page listing the existing immersion content
- Make a form page that allows adding new or editing existing immersion content
- Actually build [this feature](src/features/manage-vocab-of-immersion-content/ManageVocabOfImmersionContentWidget.vue) to render the existing vocab associated with the immersion content as a list, and with a dynamic form group (always automatic empty form line on the bottom) allow quickly adding and removing vocab to this immersion content
- Since `ImmersionContentData` is extending [TaskData](src/shared/TaskData.ts) and links to stuff on the internet, we need to ensure that the props `extraInfo` and `prompt` (of tasks in general) are securely render as markdown. Propose how to implement this (remember that our immersion content manage page must access this, but also task renderers from queue) while adhering to STRICT Feature-Sliced Design and Clean Code Principles.
- Make sure that the feature for managing vocab of immersion content is actually rendered on the task where you are supposed to consume immersion content. For that, make it take a prop `showExistingAssociatedVocab:bool` which decides whether to render all vocab already associated with the immersion content or not (we want that in the manage form, but not when utilizing this feature in the queue task)

## Clarification Questions

1. **Markdown Security**: Should the markdown renderer support all markdown features or a restricted subset? What specific security concerns do we have for user-generated content vs. system content?

Very very simple base set. Bold. italic. bullet lists. links. nothing fancy. Don't differentiate, assume all content is untrusted. There must be a simple way for that.

2. **Vocab Association UI**: For the dynamic vocab addition form, should we use:
   - Autocomplete search as user types
   - Dropdown selection from all vocab
   - A combination with search + browse functionality

For now, focus on allowing to add COMPLETELY NEW!! vocab. we will bother with attaching existing vocab later.

3. **Navigation Structure**: Should immersion content management be:
   - A top-level menu item alongside "Vocab"
   - A sub-section under a broader "Content" menu
   - Accessible from the queue interface when managing content

- top level menu item, done

4. **Persistence Strategy**: Should the immersion content form use the same auto-save approach as vocab forms, or is manual save preferred given the potentially larger content?

- same auto-save. just use a sane strategy; whatever's recommended. we are also just talking textareas here and simple inputs, its not crazy.

5. **Markdown Preview**: Do you want live preview functionality when editing prompt/extraInfo fields, or just the final rendered output?

- no, nothing fancy, just edit raw markdown, and then see the output when leaving the field

6. **Legacy Migration**: How should we handle the transition from legacy immersion content pages? Should we keep them during development or replace them immediately?

- replace immediately. there also no legacy immersion content. the code in `legacy/` is unused and only there for inspiration.

7. **Validation Rules**: What validation should we enforce for immersion content?
   - Required fields (title, prompt?)
   - URL validation for links in extraInfo
   - Maximum content length limits

- check that the required fields are filled out, yes. sane maximum content, say 2000 chars.

8. **Associated Vocab Limits**: Should there be a maximum number of vocab units that can be associated with a single immersion content item?

no?!