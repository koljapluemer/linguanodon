

- in the [translation entity folder](/home/brokkoli/GITHUB/linguanodon/src/entities/vocab/translations), build a structure similar to [VocabGroupForm](/home/brokkoli/GITHUB/linguanodon/src/entities/vocab/VocabGroupForm.vue), but for translations.
- use this to make translations editable in the [vocab form](/home/brokkoli/GITHUB/linguanodon/src/features/vocab-form/VocabFormController.vue)
- put the vocab's content field and the translations field first in the form, in nice big type (/big input fields), given that they're the core data.
- make sure the wrapping [page](/home/brokkoli/GITHUB/linguanodon/src/pages/vocab/PageVocabForm.vue) calls [vocab task update](/home/brokkoli/GITHUB/linguanodon/src/features/update-vocab-tasks) when the form is saved