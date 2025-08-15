## Step 1

Let's improve `PageVocabEdit` (src/pages/vocab-edit/PageVocabEdit.vue).

First of all, inline [this](src/features/vocab-unit-manage/VocabFormController.vue) and [this](src/features/vocab-unit-manage/VocabFormRenderer.vue) into the page and delete the feature. This is not reused anywhere, so it should be on the page.

## Step 2

Let's change the form paradigm to inline, per-row editing. Make a shared component that can both simply display an input + label and shows a little edit button next to the label, when clicked, the component switches to an editable input.

Do not use slots.
Make such a component for textarea, input, select and checkbox. 

These components are dumb and communicate only via props and emits. 

Utilize them on the form edit page.