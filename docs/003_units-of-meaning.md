# Units Of Meaning

Next, we want to establish basic features for `UnitOfMeaning`

## Basics

- Units are typed [here](../src/entities/UnitOfMeaning.ts)
- They have their own store [here](../src/stores/unitOfMeaningStore.ts), which manages a `UnitOfMeaning[]` structure

## Importing

- Currently, the [set store](../src/stores/setStore.ts) gets initialized with some bundled JSON files, as a demo
  - later, the user will be able to download sets from an API, btw
  - right now, all set data is handled in the set store
    - however, we want to move the units of meaning in a set file into their own store, and then link them from the other store via their uids (as described in the [Set type](../src/entities/Set.ts))
    - note: a target language sentence (or word) and its translation are each their own units of meaning.
      - They are mutually linked via their `translations` prop
      - This has to be setup correctly when loading sets

## Learning

- Units should also, once they occcur in exercises, be treated as `ts-fsrs` cards (see [doc](external/ts-fsrs-readme.md))
- For this, the type carries an optional `card?` prop

- When generating [exercises](../src/entities/Exercise.ts), an exercise may involve multiple units of meaning
- For example, when generating flashcard cloze exercises, a given 

## Notes

- The store for units will interact with other stores in complex way. Note how that's properly done in [the relevant pinia doc](external/pinia-referencing-other-stores.md)
- "Unit of Meaning" is a nerdy, internal term. When exposing them to the user, call it "Words & Sentences"