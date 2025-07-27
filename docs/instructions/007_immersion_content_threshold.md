# Immersion Content Threshold

## Goal:

Better regulate when immersion tasks show up

## Process

- add a function `isCurrentlyTopOfMind` to the `VocabData` entity that takes a uid and does the following: 
    - check whether or not the vocab is at least level 3
    - check whether the vocab is also currently *not due*
- then, for features utilizing immersion goals (note FSD! we cannot call vocab entity functions from the immersion content entity!), we can utilize this for these things:
    - when showing the list of immersion content (on the page for that), async load in a progress bars that show how many of thee associated vocab is currently onTopOfMind
    - [ProposeImmersionContent](src/pages/queue/propose-which-task-to-do/proposers/ProposeImmersionContent.ts) should from now on loop `ImmersionContent` that is due (its `nextShownEarliestAt` does either not exist or is in the future), and then for each check if at least 60% of its associated vocab `isCurrentlyTopOfMind`. It can then return that. if it finds none, return none
    - [ProposerByImmersionContentAlmostReady](src/pages/queue/propose-which-vocab-to-practice/proposers/ProposerByImmersionContentAlmostReady.ts) can do a similar process: Loop through `ImmersionContent` and find the one where the percentage of `isCurrentlyTopOfMind` is highest, but below 90%. `Console.info` which immersion content was chosen at what percentage for this vocab proposer.

## Clarification Questions:

1. **Function placement**: Should `isCurrentlyTopOfMind` be a method on the `VocabData` interface/type, or should it be a utility function that takes a `VocabData` object? Given that `VocabData` is currently just an interface, I assume it should be a utility function in the vocab entity layer?

should be a util in the [relevant entity folder](src/entities/vocab)

2. **"Not due" definition**: For checking if vocab is "not due", should this use `vocab.progress.due > now` (meaning the next review is scheduled for the future)? Looking at the existing code, it seems the `due` field from ts-fsrs Card is used to determine when vocab needs review.

yes, exactly

3. **Access to VocabRepo in proposers**: Both proposer classes currently have access to `VocabAndTranslationRepoContract`. Should the `isCurrentlyTopOfMind` function be added as a method to this repository contract, or should the proposers call a utility function directly?

Good question. Please review Feature-Sliced Design (https://feature-sliced.design/docs/get-started/overview) and take a good decision here.

4. **Progress bar implementation**: For the immersion content list progress bars, should these show:
   - "X of Y vocab are top-of-mind" as text?
   - A visual progress bar (like 7/10 = 70% filled)?
   - Both percentage and count?

Only the progress bar. No commentary for now.

5. **Empty associated vocab handling**: How should we handle immersion content with no associated vocab units? Should these be:
   - Always eligible (100% top-of-mind)?
   - Never eligible (0% top-of-mind)?
   - Excluded from percentage calculations?

0%. Simply hide the progress bar when it's at 0%.

6. **Performance considerations**: Should we add any caching for the top-of-mind calculations, or is it acceptable to calculate these on-demand each time the proposers run? 

For now, simply on-demand calculation.