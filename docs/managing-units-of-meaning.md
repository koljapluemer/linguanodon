# Managing Units of Meaning

## Basics

- a `UnitOfMeaning` is what a learner would call a "word" or a "sentence"
- a unit of meaning is always in a specific language — it may have synonyms in the same language, and translations in another language
  - each of these synonyms/translations is also its own `UnitOfMeaning`

## Components

### ListUnitsOfMeaning

- In the [unit of meaning list view](../src/modules/unit-of-meaning/user-interaction/list-units-of-meaning/ListUnitsOfMeaning.vue), the learner can see the units of meaning saved in their db
- Clicking on one takes them to an edit page for this unit of meaning (see below)

### ManageUnitOfMeaning

- The main screen to, well, manage a unit of meaning
- This does not do much, except getting the actual UnitOfMeaning from the db (by calling relevant functions) from the uid in its url
- It then, mostly, loads the core component: `UnitOfMeaningForm`

### UnitOfMeaningForm

- The core component of the whole workflow. It can resursively load itself, but more on that later.
- First of all, it's a basic form for the non-optional and optional props of the [unit of meaning type](../src/modules/unit-of-meaning/types/UnitOfMeaning.ts)
  - One special thing: To select the language the unit is in, we use a dropdown. This reaches over to the [user settings db](../src/modules/user-settings/utils/useUserSettingsDB.ts). It then makes four `<optgroup>`s in the dropdown: primary target langs, primary native langs, secondary target langs, secondary native langs. In that order.
  - Optional props on the type are also optional in the form, and should be marked as such
  - Now the kicker: UnitOfMeaningForm takes a prop `showTranslations: bool` which decides whether at the bottom of the form we render [a translation widget](../src/modules/unit-of-meaning/user-interaction/manage-unit-of-meaning/TranslationsWidget.vue)
- Edits are immediately persisted to daisy
  - know crazy hook architecture tho: load from dexie on mount, then have a reactive form, listen to changes and write them to dexie. Show a little `<small>` above the form card that indicates whether we have unsaved changes, are saving, or have saved

### TranslationWidget

- First of all, it displays the translations of the unit of meaning it belongs to in a zebra table
- In each row, we can "Remove from Translation" ("disconnects" the unit of meaning as a translation from the current unit of meaning) or "Edit" (jumps to the route of this translation)
- Below that, we have two buttons: "Add Existing Word or Sentence as Translation" and "Add new Word or Sentence as Translation"

### ConnectUnitOfMeaningAsTranslation

- A modal where the user can search in their existing db for units of meaning (simple `<input>` and smart string-match dropdown)
- Results are automatically limited to units of meaning from the "opposite" language group: If the original unit was in a native lang, limit results to target lang units and vice versa
- This modal can be aborted or confirmed, nothing crazy

### AddUnitOfMeaningAsTranslation

- The real kicker: Opens a *nested* UnitOfMeaningForm, to make a new unit which is interepreted as a translation
  - While the parent form, included by ManageUnitOfMeaning, takes `showTranslations = true`, here, we don't show the translations, otherwise we have endless recursion
  - In the language, we automatically select the first option in the primary group of the "opposite langues" — if the o.g. unit of meaning was in target, we auto-select first primary native lang and vice versa