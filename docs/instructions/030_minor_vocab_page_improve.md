Let's improve `PageVocabEdit` (src/pages/vocab-edit/PageVocabEdit.vue).

First of all, inline [this](src/features/vocab-unit-manage/VocabFormController.vue) and [this](src/features/vocab-unit-manage/VocabFormRenderer.vue) into the page and delete the feature. This is not reused anywhere, so it should be on the page.