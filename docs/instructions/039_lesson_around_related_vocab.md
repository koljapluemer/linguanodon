Let's make an integrate a new [lesson flavor](src/pages/queue/lesson-generator/flavors).

It should pick a due [vocab unit](src/entities/vocab/vocab/VocabData.ts) — [entity function](src/entities/vocab/VocabRepoContract.ts) for that exist, however we need to adapt one to get vocab that is not only due (or new, that is in this case allowed), but also has >= items in `relatedVocab`.

Also, add all vocab that is connected to this vocab and is either due or new (see other flavors to see how this is implemented) and for each (also the base vocab picked above) add a random task like usual.

Then that's it.