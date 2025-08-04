# Basic Language Management

- Implement basic languange management
- [Interface](src/entities/languages/LanguageData.ts) already exists
- repo with contract (like all the other entities/ repos) should be added
- page where the user can manage their (target) languages should be added

page should have a list of user target languages.
there is a dropdown [fed by this JSON](src/entities/languages/isoLangs.json) where the user can add new langs as their target language.
in the list, they can temporarily disable languages (checkbox) and also remove them completely
the dropdown to add languages should be a smart text input, with the dropdown loading once the user types (see [legacy implementation](legacy/pages/manage-languages/PageManageLanguages.vue) for inspiration).

then, go through the app and
a) wherever the user can set a language via a text field, replace that with a dropdown (without text input, JUST dropdown) with only the user's languages
b) whenever language of somethign is displayed in a UI with little space, show the language's (now properly typed) emoji if exists, or code if not. In UIs where we have more space, show the whole language name

Adhere to FSD!!!!!!!! No cross imports on the same layer!!!!

## Clarification Questions

1. **User Language Types**: Should we support both "native" and "target" languages like the legacy implementation, or just "target" languages as mentioned in the current requirements? The LanguageData interface only has `isActive` but the legacy has both `isNative` and `isTarget`.

I said "just target" because I mean "just target", as in: Just target

2. **Language Data Source**: Should we merge emoji data from isoLangs.json into our LanguageData when a user adds a language, or keep them separate and look up emojis dynamically?

merge emoji data for added lang

3. **Default Languages**: Should we pre-populate any default languages for new users, or start with an empty list?

empty

4. **Language Removal**: When a user "removes" a language completely, should we delete it from storage or mark it as inactive? This affects whether they can re-add it later with previous settings.

there is BOTH a checkbox to make it inactive, and a removal button to remove completely. of course, they can always re-add it anyways. this is just a user-side nicety

5. **Integration Scope**: Which specific components/pages currently use text language inputs that need to be converted to dropdowns? Should we search the entire codebase or focus on specific areas first?

- search entire src/
- actually, first search entities, and understand which *Data.ts interfaces use `language` as a prop

6. **Language Display Priority**: In compact UIs, should we prioritize emoji > code > name, or code > emoji > name when displaying languages?

- code is not optional, so you never need to show name in compact uis

7. **Validation**: Should we validate that language codes exist in isoLangs.json when users add languages, or allow free-form language codes?

- for now, only allow existing languages from the dropdown. do not use an add button next to the input, allow only adding by clickign on the lang in the dropdown.