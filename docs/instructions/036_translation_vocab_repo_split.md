let's clean up [the current translation and vocab repo](src/entities/vocab/VocabAndTranslationRepoContract.ts)

- make two entities `src/entities/vocab` and `src/entities/translations`.
  - They have their own contracts, repos, types, etc
  - They, according to FSD rules, may NOOOOOOOOT import each other. Functinality that needs both repos needs to live in pages/, features/ or widgets/
  - Accordingly, make sure all *forms* in the entity repo like [this](src/entities/vocab/VocabGroupForm.vue) or [this](src/entities/vocab/translations/TranslationGroupForm.vue) or this [this](src/entities/vocab/VocabRowConnect.vue) are either dumb (NO!!!!!! knowledge of any repo) or move them to a feature

- After that, fix usages across the code base  