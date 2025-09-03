- Make a new [mode](src/pages/practice/modes/modes) called "eyes and ears"
- make sure to put it in the [overview](src/pages/practice/PracticeOverview.vue)
- follow best practices and structure from other modes
- in some way it should follow the structure from the [factcard grind selector](src/pages/practice/modes/modes/fact-card-grind/generateFactCardGrindTasks.ts), but with [vocab](src/pages/practice/modes/modes/fact-card-grind/generateFactCardGrindTasks.ts): prio due seen vocab over new vocab stochastically just like you see in this file
- however, we also need additional props (and thus, new [repo functions](src/entities/vocab/VocabRepoContract.ts)): for this, we may only select vocab that has both `sound` and at least one `image`
- Based on this, make a new type of [task](src/pages/practice/tasks). Read several task files to understand what they are!!! [register it](src/pages/practice/tasks/ui/taskRegistry.ts) as vocab-choose-image-by-sound
- the task should look somewhat similar to the [vocab single choice task](src/pages/practice/tasks/task-vocab-single-choice/TaskVocabChooseFromOptions.vue): a prompt with two options, one correct, one false
- however, the "question" of the task is neither `content` nor `translation` but a little sound player which auto-plays (and allows replay, but NOTHING ELSE, NO BELLS AND WHISTLES) the vocab's sound.
- and the selection options are buttons which are only images. One button is a randomly selected correct image, while the other is a distractor — a random image from another vocab from the same lang that also has an image (we need another entity function for that)
- note that I added `hasImage` and `hasSound` props to vocab — these should be indexed by dexie [here](src/entities/vocab/VocabRepo.ts) and then used to find the relevant vocab in our entity functions. Of course, that also means these bools have to be set correctly when image/sound is saved or removed.

Keep UI simple. Do not add containers, cards, headers and extra info everywhere that I didn't ask for.

## Clarification Questions

1. **Vocab Selection Priority**: Should the "eyes and ears" mode prioritize due vocab over new vocab with the same 70/30 stochastic weighting as fact-card-grind, or should it use a different weighting for vocab that has both sound and images?

same weight

2. **Dexie Schema Update**: When adding indices for `hasImage` and `hasSound` fields, should this be done as a new database version (version 3) to ensure proper indexing for existing data?

yes

3. **Sound Auto-play Behavior**: Should the sound auto-play when the task loads, or should it auto-play when the user first interacts with the task? Should there be any volume controls or just a simple replay button?

sure, add volume. autoplay on task load.

4. **Distractor Selection Strategy**: For the distractor image (wrong answer), should we prefer vocab from the same semantic category/set if available, or just any random vocab from the same language with an image?

any random from same lang with img

5. **Image Display Format**: Should the image buttons be square/circular, or maintain aspect ratio? What size constraints should be applied to ensure consistent UI layout?

see how vocab images are displayed in the rest of the app. extract that to a shared dumb component in @src/shared. Use that.

6. **hasImage/hasSound Field Updates**: Should these boolean fields be updated automatically via database triggers/hooks when images/sounds are added/removed, or should they be updated explicitly in the add/remove methods? Do they need to handle multiple images per vocab correctly?

It's a fucking bool. Just set it true or false in the relevant repo methods. No overengineering.


7. **Task Completion Scoring**: Should the sound-to-image tasks use the same scoring system as other vocab tasks (Rating.Again for wrong first attempt, Rating.Good for correct), or should they have different scoring since they test a different skill (audio-visual association)?

It should work in scoring JUUUUST LIKE [THIIIIIS](src/pages/practice/tasks/task-vocab-single-choice/TaskVocabChooseFromOptions.vue)

8. **Error Handling**: What should happen if a vocab has a sound but the audio file is corrupted/unplayable, or if an image fails to load? Should these vocab be filtered out or should there be fallback behavior?

Add a skip button to the exercise above the prompt so the user can skip broken exercises