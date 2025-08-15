## Step 1

Let's improve `PageVocabEdit` (src/pages/vocab-edit/PageVocabEdit.vue).

First of all, inline [this](src/features/vocab-unit-manage/VocabFormController.vue) and [this](src/features/vocab-unit-manage/VocabFormRenderer.vue) into the page and delete the feature. This is not reused anywhere, so it should be on the page.

## Step 2

Let's change the form paradigm to inline, per-row editing. Make a shared component that can both simply display an input + label and shows a little edit button next to the label, when clicked, the component switches to an editable input.

Do not use slots.
Make such a component for textarea, input, select and checkbox. 

These components are dumb and communicate only via props and emits. 

Utilize them on the form edit page.


## Step 3

Let's improve vocab rendering a bit more, but staying within page.

- `src/pages/vocab-edit/ui/VocabEditFormController.vue` should handle all save logic. Put the [useless composable](src/pages/vocab-edit/useVocabForm.ts) into this controller component and delete it.
- `src/pages/vocab-edit/ui/VocabFormMetaRenderer.vue` should be a simple component with a toggle "Show basic data" "Show all data". Depending on that, it should render either jsut the basic render form below or both, below each other. persist this toggle setting in localstorage 
- `src/pages/vocab-edit/ui/VocabFormCoreRenderer.vue` renders: language, content, translations. In this order.
- `/home/brokkoli/GITHUB/linguanodon/src/pages/vocab-edit/ui/VocabFormAdvancedPropsRenderer.vue` renders prio, exlcude from practice, notes, links


You love adding useless headings to everywhere and everything. Do not do that, unless explicitly instructed. For example, do not label the core data form "Core Data Form". Noone cares.

You love putting cards and borders on fucking everything for no reason. Do not do that either.