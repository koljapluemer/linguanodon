# Managing Languages

Linguanodon enables users to learn languages.

Learners can both add their own vocabulary and sentences, as well as download designed lessons from the backend data repository.

This means that we have to do some dance to even manage languages by themselves

## Definitions

To have some base, we are using [IETF BCP 47 language tags](https://en.wikipedia.org/wiki/IETF_language_tag). An authoritative list of those, compatible with our [defined type](../src/types/persistent-general-data/Language.ts), is provided by our backend data repo at [this link](https://scintillating-empanada-730581.netlify.app/language_tags.json).

## Core Problem

On the surface, we may think that a user simply speaks language x and wants to learn language y, and that's it.

In practice however, several scenarios can arise, such as:

- A "language" may really be several languages: For example, *Egyptian Arabic (arz)* uses a bunch of *Standard Arabic (arb)*
- A learner may have several "native" languages: They may be fluent in English, but also may want to add translations to their actual native language (say, French)
- We are importing external language sources, and these may use differing levels of precision when labeling languages — for example, content in dialectical Arabic may be simple labeled *Arabic (ar)*


## Use Cases

Why do we even have to manage languages (per user)? Here are a few cases:

- When the user searches for additional material in our remote data repo, they probably want, by default, to only search for content in languages they are learning
- When parsing translations of a [unit of meaning](../src/types/persistent-general-data/UnitOfMeaning.ts), we want to only download the translations that are in relevant languages for the user
  - Note: At the beginning of the app, all provided translations will always be English (en), so we can for now ignore this
- When the user adds their own vocab, they need to set in the UI in what language the unit of meaning they're adding is in
- When we are downloading content from the remote repo, and some unit of meaning is in a language not yet seen, we should also track that in some sense (?)

## Implementation

- As written above, the SSoT for languages is the JSON list in our backend
  - It looks like this:

```JSON
8210	{ tag: "zpi", englishName: "Santa María Quiegolani Zapotec", nativeName: "Santa María Quiegolani Zapotec" }
8211	{ tag: "zpj", englishName: "Quiavicuzas Zapotec", nativeName: "Quiavicuzas Zapotec" }
8212	{ tag: "zpk", englishName: "Tlacolulita Zapotec", nativeName: "Tlacolulita Zapotec" }
```

- In the future, we can consider allowing the user to add custom languages (if they want to practice Klingon, there is really no reason why they shouldn't be allowed to), but we ignore that for now
- The user needs a view where they can set the primary and secondary languages that they are learning, as well as the primary and secondary languages that they already speak ("native" languages)
  - Users can have multiple languages of all of these types, but a given language cannot be in more than 
  - This feature is represented within the [user settings type](../src/types/per-user-data/UserSettings.ts)
  - The data should be persisted in localStorage

- When the user is administrating units of meaning, we provide a language select dropdown. We will use optgroup to show first the primary languages, then the second langues
  - Depending on use case in the form, we show all four groups, or just the target or just the native langs
