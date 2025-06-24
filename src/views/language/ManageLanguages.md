# Managing Languages

- This app's purpose is to teach Egyptian Arabic, for people who already speak English
- However, Egyptian Arabic uses quite some Modern Standard Arabic, and furthermore users may want to add other native languages of theirs, to differentiate the exact language of a given translation

## Implementation

- Therefore, we implement `Language` like this:

```ts
export interface Language {
    name: string;
    abbreviation: string;
    requiredByApp: boolean;
    isTargetLanguage: boolean
    position: number
}
```

- Since languages are (within limits) user-editable, we manage them via a dexie table: `../../dexie/useLanguageTable.ts`
- The following languages are added by the app as a default, and must always exist (recreate on load when not existing):
  - "Egyptian Arabic", abbreviation "🇪🇬", isTargetLanguage
  - "Modern Standard Arabic", abbreviation "ض", isTargetLanguage
  - "Other Arabic Dialect", abbreviation "؟", isTargetLanguage
  - "English", abbreviation "🇬🇧"

- The user may not edit or delete these

## User Interface

- The user however does get `ManageLanguages.vue`, a view to administer languages
- It consists mainly of two columns, one for native language, one for target languages
- Within these columns, languages may be dragged and dropped 
  - (the order later determines the default value and the order of `<options>` when using languages in forms)
- Also, in each column languages may be added
- Languages added by the user may be edited and deleted, directly inline, with appropriate buttons