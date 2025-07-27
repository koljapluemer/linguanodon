# Better Vocab Level Logic

## Goals

Make vocab levels and the conditional display really nice.

## Levels

### Level -1

- This is where every vocab starts
- Display both content and comma-separated translations
- Show the string "how hard is this word to remember?" and the buttons "impossible", "hard", "doable" and "easy"


### Level 0

From now on, and on all coming levels, do not show "how hard is this word to remember". Also, from now on, we *usually* follow the logic of first showing only the reveal button, then some additional info ("back of card") and the scoring buttons. Although there may be exceptions, for example the one right now:

the scoring buttons from now on should be: "Wrong", "Hard", "Correct" and "Easy" (in the backend they are scored the same, just map them in order to `ts-fsrs`)

On level 0, from now on, use a choose-from-two-buttons UI from vocab to translation.

To know how this should look like, check legacy: `legacy/pages/practice/ui/tasks/choose-from-two/ChooseFromTwoTask.vue`.

There is a specific mechanic in the UI: if the user clicks the wrong button, THAT BUTTON (not!! the other) should be disabled. if the user then clicks the correct button, we color that green and send the event that triggers scoring 100ms later so the feedback can be seen. 

Obviously, we need to shuffle the buttons, either in the UI or on creation earlier (and keep track of which one is the correct one).

If the user clicks the wrong button first, we rate the exercise as false, if they immediately get the right button, we rate the exercise correct.

We do not have a reveal button, we do not have evaluation by the user. We simply map false to `Hard` and correct to `Correct` in ts-fsrs (second option; third option).

Of course, we will need to fill in the buttons.

For the correct answer button, get the vocab's translations and pick one *at random* (only one!)

For the incorrect answer, do a two-step process. First, try to find an "ideal wrong answer". You may need to add one or several to [the repo](src/entities/vocab/VocabAndTranslationRepoContract.ts) to support this. An ideal translation has the following properties:

- It belongs to another vocab unit which is currently `due`
- Its string length is within plus minus three of the length of the chosen button answer
- Its string distance (just choose levenshtein or whatever is convenient) to *all* of the selected unit's translations is more than two

If such an answer cannot be found, just pick a random translation from a random vocab unit. Once chosen, check if its equivalent to *any* of the chosen units translations — if so, we hit an edge case where we make *both* buttons correct. This is an important fallback, which also informs the kind of data structure which we use to encode the button content.

### Level 1

If a unit is `level: 1`, we randomly choose to generate one of these two exercises:

- A choose-from-four exercise from vocab to a translation (see [this](legacy/pages/practice/ui/tasks/choose-from-four/ChooseFromFourTask.vue) for UI inspo). Works very similar to the one above, only with 3 incorrect options, all chosen with the same algo and same fallback (so, if we hit edge cases, multiple options may be true, but we try not to have this)
- A choose-from-two exercise from translation to vocab

This again works similar as above, only now the translation (again, a randomly chosen one) if printed and we have target language content in the two buttons.

accordingly, for the wrong answer, find *target language vocab* content *in the same language*, ideally within the constraints above (length +/-3, distance more than 2), but if not, any from the same lang will do

### Level 2

Again, if a unit is level 2, we randomly choose from two exercises

- A choose from four from vocab to translation, as described above
- A choose from four from translation to vocab (apply ideas from above)

### Level 3

In level 3, we have only one possible exercise:

A standard flashcard/reveal exercise, as is currently implemented as standard.
In level 3 it should actually work exactly as all exercise gen is working now, flashcard from vocab to comma separated translation list.


### Level 4

In level 4, we again randomly choose:

- Reveal from vocab to translation list, like above
- Exact same reveal, but from translation to vocab

This second option is completely same in the UI, but there is an important bit of logic, because we want to do this:

1) from our chosen unit, extract a random translation and the language of the unit
2) go to the repo/vocab unit and *find all vocab in the relevant language that has the chosen translation as a translation*
3) use all these vocab(s) as a comma seperated list on the back of our flashcard.

For example, we may have in our repo:
- "Hocker", with translation "chair"
- "Stuhl", also with translation "chair"

In that second case, we then want a flashcard with "chair" on the front and "Hocker, Stuhl" on the back.

This also requires that translation have a *unique* `content` property. Ensure this on repo level. For now, when someone tries to add a translation with a `content` that already exists, throw an error and reject the adding. You may need to change stuff in the repo for that.

*last note*: Level 4 is the highest. Make sure, in the entity functions, that if vocab is level 4, it cannot go on higher level, no matter what the streak does.

## Implementation Plan Proposal

### Phase 1: Core Infrastructure
1. **Update Exercise Types** - Extend `ExerciseTypes.ts` to support new exercise types:
   - `choose-from-two-vocab-to-translation`
   - `choose-from-two-translation-to-vocab`
   - `choose-from-four-vocab-to-translation`
   - `choose-from-four-translation-to-vocab`
   - Update existing `try-to-remember` and `reveal` types

2. **Enhanced ExerciseGenerator** - Replace current simple generator with level-aware logic:
   - Level -1: Try-to-remember with "how hard is this word to remember?" 
   - Level 0: Choose-from-two vocab→translation
   - Level 1: Random choice between choose-from-four vocab→translation OR choose-from-two translation→vocab
   - Level 2: Random choice between choose-from-four vocab→translation OR choose-from-four translation→vocab
   - Level 3: Standard flashcard reveal vocab→translation
   - Level 4: Random choice between reveal vocab→translation OR reveal translation→vocab(s)

3. **Wrong Answer Generation** - Add repository methods for finding distractor answers:
   - `getDueVocabForDistractions()` - Get due vocab for wrong answers
   - `getTranslationsWithinLength()` - Filter by string length ±3
   - `calculateStringDistance()` - Levenshtein distance utility
   - `findIdealWrongTranslation()` / `findIdealWrongVocab()` - Main distractor logic

### Phase 2: New Exercise Components
4. **ChooseFromTwo Component** - Based on legacy template but adapted for new architecture
5. **ChooseFromFour Component** - Similar to ChooseFromTwo but with 4 options
6. **Enhanced TryToRemember** - Update button text to "how hard is this word to remember?"
7. **Enhanced Reveal** - Support both directions (vocab→translation, translation→vocab)

### Phase 3: Repository Enhancements
8. **Translation Uniqueness** - Ensure unique translation content:
   - Add uniqueness validation in translation repo
   - Throw error on duplicate translation content attempts
9. **Level Cap Logic** - Ensure level 4 is maximum in scoring logic
10. **Reverse Lookup** - Add method to find all vocab with specific translation

### Phase 4: Exercise Rendering
11. **Update MetaExerciseRenderer** - Route to appropriate components based on exercise type
12. **Button Interaction Logic** - Implement disable-wrong-button, color-correct-button, 100ms delay
13. **Auto-scoring Logic** - Map first-try-correct→"Correct", first-try-wrong→"Hard" for choose exercises

## Clarification Questions

1. **Translation Structure**: Currently translations are stored as separate entities with IDs. For the level 4 reverse lookup (translation→vocab list), should we:
   - Add a new repo method to search by translation content across all vocab?
   - Create an index/cache for translation content → vocab mappings?
   - Handle case-sensitivity and exact matches only?

Exact matches, yes.
Decide for the best method of matching according to the existing types and the use case.

2. **String Distance Library**: Do you have a preference for string distance calculation?
   - Use a lightweight Levenshtein implementation
   - Add a specific npm package like `fast-levenshtein`
   - Implement a simple character-difference heuristic

Just do lightweight Levenshtein for now; it's just a quick heuristic

3. **Exercise Randomization**: For levels 1, 2, and 4 that have random exercise selection:
   - Should this be truly random (50/50)?
   - Should it be weighted based on past performance?
   - Should it be stored to avoid generating the same type repeatedly?


No just pure random (and not crypto secure) is fine

4. **Distractor Fallback Logic**: When ideal wrong answers can't be found:
   - For vocab distractors: any vocab in same language, or any vocab regardless of language?
   - Should we prefer distractors from recently practiced vocab?
   - Maximum retry attempts before falling back to random selection?

For vocab: must be same language. Otherwise, yes, fallback full random
No preferences except the ones stated above for ideal selection.
Implement reasonable fallback. I'm not sure in what way you are going to "retry", but I'm sure you can come up with something, using useful repo methods that don't tax daisy db too much (but keep in mind, it's local db, we *can* do some calculation)

5. **Edge Case Handling**: For the "both buttons correct" scenario:
   - Should we auto-score as correct?
   - Should we regenerate the exercise?
   - Should we show both as correct and let user pick either?

We don't show the user. We don't regenerate (retry should happen before this step, this is the final fallback). We simply encode both as correct in the data structure we send to the ui, and when the user clicks either, hey, its correct, we green it and score as correct

6. **Level 4 Implementation**: For translation→vocab exercises:
   - Should all vocab with that translation be shown, or limit to a reasonable number (e.g., max 5)?
   - How should we handle very common translations that might match many vocab items?
   - Should pronunciation be included in the comma-separated list on the back?

good point. limit to 8 translations max (in both directions, also when translation from translation to vocab content list) and show "..." if there's actually more

no special handling for "common" translations

no handling of pronunciation or anything like that, but make a dumb widget for displaying the comma separated list (takes an array of vocab)