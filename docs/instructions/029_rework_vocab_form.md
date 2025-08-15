# Reworking the Vocab Manage Page


- Let's rework 

- Currently we have [the vocab manage page](src/pages/vocab-manage/PageVocabManage.vue). It's pretty awkward. Let's factor the code out from there and delete.

## What we need

### Vocab List Page

A simple list rendering one vocab per row. Not editable. Currently [here](src/pages/vocab-list/PageVocabList.vue). Buttons to got to page and to delete. Should paginate this in an elegant way (check dexie recommendations while we're at it)

### Vocab Add Page

A new page (currently covered by [the vocab manage page](src/pages/vocab-manage/PageVocabManage.vue)).

I want a new workflow though.
Should have a toggle on top "show all options". If not activated, show only language dropdown, content and target.

All of these inputs should be big. Should utilize our [FormField](src/shared/ui/FormField.vue).

The full options rely also on [the group form for notes](src/entities/notes/NoteList.vue) and the shared options for [link edit](src/shared/ui/LinkEdit.vue). 


Should not auto-save. Instead, have buttons "Cancel", "Save" and "Save and Add Another" on the bottom. Language as well as *either* one translation or content must be set.

For the translations, we whould use a dumb translation group form, like described below.

### Vocab Edit Page

A new page (currently covered by [the vocab manage page](src/pages/vocab-manage/PageVocabManage.vue)).

Instead of relying on the [FormField](src/shared/ui/FormField.vue), I want a new shared dumb component `EditableField` that is just displayed normally, but has a little edit button (just an icon) to the right, and when clicked, switch to a form field. The parent (the vocab edit page) should then handle the edit, which can be saved/cancelled from within th dumb component.


### As a task

Often, we manage vocab *of* something within tasks.