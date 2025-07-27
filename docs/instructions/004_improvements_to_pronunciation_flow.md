# Improving the pronunciation task flow

- Include only vocab with at least a priority of 2
    - the priority prop was added to the type, please amend entity, repo, usage and example data (see `src/entities/vocab/vocab/VocabData.ts`)
    - if it's not explicitly set, priority is assumed to be 1
    - make sure it can be edited in the form
    - we also added the optional prop `doNotPractice`. Also amend relevant places, in the form add a checkbox "exclude from practice", make sure that if this is true, the unit is not picked by any unit proposer

- allow skipping any tasks *directly* from the 1st screen, `Skip` button should be part of [doTask](src/features/do-task)
    - if skipped in this way, do not go to eval screen, directly finish


- `Task` now has a prop `evaluateAfterDoing`. Adjust entity, repo, example data. Usually this is true. If it's false, do not show the evaluation screen after doing the task. add-pronunciation tasks should set this to true, and thus not show the eval.

- On the eval componnt, do not pre-set either the slider bar nor the button group deciding whether to do the task. Allow the user only to continue once they actually selected something on all 3 of those.

## Clarification Questions

1. **Priority filtering scope**: Should the priority >= 2 filter apply to ALL vocab proposers (new vocab, due vocab, immersion-related) or only specific ones?

It should not apply to ANY vocab proposers!! It should precisely and ONLY apply to this: `src/pages/queue/propose-which-task-to-do/proposers/ProposeAddPronunciation.ts` PRONUNCIATION TAAAASK PROPOSER!!!

2. **Skip button placement**: Should the Skip button be visually prominent (same style as "Mark as Completed") or secondary (smaller/different color) to encourage task completion?

secondary

3. **Default priority value**: For existing vocab without explicit priority, should we:
   - Set priority = 1 in migration/upgrade
   - Treat missing priority as 1 (current behavior)
   - Allow null/undefined priority with special handling

missing prio is treated as 1

4. **Evaluation validation UX**: When validation fails (user hasn't selected all fields), should we:
   - Show validation errors inline
   - Highlight missing fields
   - Show a toast/alert message

no bro, JUST DISABLE THE FINISH BUTTON until all are selected

5. **Task skip analytics**: Should we track skip events for analytics/learning purposes, or just skip silently?

Don't track anything in that sense, but set `nextShownEarliestAt` of the task to in one day 

6. **Form field placement**: Where should the priority and "exclude from practice" fields appear in the vocab form - at the top with basic info or in an "Advanced" section?

just somewhere sensible don't overengineer