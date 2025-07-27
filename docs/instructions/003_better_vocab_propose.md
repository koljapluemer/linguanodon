# Better Vocab Proposer Logic

At the moment, `src/pages/queue/propose-which-vocab-to-practice/proposers/ProposerByDueVocab.ts` uses `getRandomDueVocab`, which is not very precise.
Change the proposer and entity logic so that:

- We have one `ProposerByDueVocab` calling `getRandomAlreadySeenDueVocab`, which *only* gets due vocab that is not new (=only vocab with `progress.reps` > 0)
- Have another `ProposerOfNewVocab` calling `getRandomUnseenVocab` that does the opposite; getting vocab that was never practiced before
- integrate both into the proposing logic (equal random choice as already implemented and explained in `docs/instructions/000_mvp`)

## Clarification Questions

### Repository Method Behavior
- Should `getRandomAlreadySeenDueVocab()` check both `progress.reps > 0` AND `progress.due <= now`, or is the reps check sufficient?

Both 

- For `getRandomUnseenVocab()`, should we return vocab where `progress.reps === 0` specifically, or also include vocab that might have undefined/null progress?

sure, go for null and undefined as well. if you catch some on that special condition, throw a warn in console, sinc that shouldn't happen

### Proposer Naming and Responsibilities  
- Should we rename `ProposerByDueVocab` to `ProposerByAlreadySeenDueVocab` for clarity, or keep the existing name?

yes rename

- Should the new `ProposerOfNewVocab` respect any constraints (like limiting new vocab introduction rate), or just return any available unseen vocab?

for now, no constraints

### Integration with Existing Logic
- Should we keep the existing `getRandomDueVocab()` method for backward compatibility, or can it be removed/replaced entirely?

remove

- In the VocabPicker integration, should both proposers always be active, or should there be logic to prioritize one type over another based on learning state?

- all proposers always active. ask all for propositions, pick randomly. this should already be the case with the existing logic, right?

### Edge Cases
- What should happen if one proposer type has no vocab available (e.g., all vocab has been seen, or no new vocab exists)?
- Should there be a fallback mechanism if the preferred proposer type returns empty results?

- see above. there is no preferred proposer. fallback is built-in, b/c all proposers are asked for n propositions. if none returns anything, show a message on the page

### Testing and Verification
- How can we verify that the separation is working correctly? Should we add logging to track which proposer contributed which vocab?

- yeah add some console.info

- Are there specific scenarios or user states we should test to ensure the separation works as intended?

- not yet