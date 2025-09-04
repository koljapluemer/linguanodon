Let's make a new mode "Sentence Slide"

- First read [this](docs/instructions/057_illegal_immersion_mode.md) and [this](docs/instructions/056_ultrarandom_mode.md) and check out the files mentioned in there. Summarize what a mode is and what has to be changed when adding a new one.

Sentence Slide should work as follows:

- Get a [random vocab unit](src/entities/vocab/VocabData.ts) [of length sentence that is unseen and has >= 1 relatedVocab](src/entities/vocab/VocabRepoContract.ts)
- Track a list of all the connected vocab
- pick random connected vocab from this list
- [make task](src/pages/practice/modes/utils/getRandomGeneratedTaskForVocab.ts) based on it, let the user do it
- use `setWrongVocabDueAgainImmediately` again
- after the vocab task is done, *only* remove the vocab from the list if its not due now (check repo for this). Usually, vocab would not be due now, unless it was previously unseen, or task was wrong. Log this.
- Keep a progress bar similar to illegal immersion, counting the initial number of vocab in the tracked list vs number now
- If connected vocab list empty, all done, show [sentence meaning guess](src/pages/practice/tasks/task-guess-what-sentence-means) task on the sentence itself
- Then, repeat whole loop with the next sentence

Keep the UI standard and minimal. KISS. 

## Clarification Questions

1. **Sentence selection criteria**: The instruction says to get sentences that are "unseen and has >= 1 relatedVocab". Should we prioritize sentences with more related vocab, or is any sentence with at least 1 related vocab equal priority?

No. No prio.

2. **Connected vocab definition**: When tracking "connected vocab", does this include:
   - Only direct `relatedVocab` references from the sentence?
   - Vocab that has the sentence in their `relatedVocab` array (bidirectional)?
   - Both directions of the relationship?

Just `relatedVocab`

3. **Due status check**: The instruction says to remove vocab "only" if it's not due now, "unless it was previously unseen, or task was wrong". This seems contradictory. Should unseen vocab that becomes due after the first task stay in the connected list, or be removed?

Simply score the vocab. Then query the repo again and see if its due or not. If not, remove. If still due, don't remove

4. **Progress calculation**: Should the progress bar count:
   - Total initial connected vocab vs remaining connected vocab?
   - Or include all completed tasks vs estimated total tasks for the current sentence?

Total length of bar = initial connected vocab.
Progress % = how many of those already done (=not due anymore)

5. **Next sentence selection**: After completing all connected vocab for a sentence, how should the next sentence be selected? Same criteria as the first (unseen + >= 1 relatedVocab), or different criteria?

Same criteria

6. **Mode termination**: What happens when no more valid sentences exist? Should it show an empty state like other modes, or loop back to previously seen sentences?

standard empty state

7. **setWrongVocabDueAgainImmediately usage**: Should this be passed to TaskRenderer via mode-context (like illegal immersion), or handled differently?

make illegal immersion and sentence slide work the same. However, I don't understand why we're doing all this work via TaskRenderer. In my book, the widgets can just hardcode this parameter in their own files?!

8. **Task variety**: Should we use the same task generation logic as other modes (getRandomGeneratedTaskForVocab), or are there specific task types preferred for sentence slide mode?

yes same exact fuckign function, that's what i said, isn't it?!?