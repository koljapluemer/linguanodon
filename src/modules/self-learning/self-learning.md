# Self Learning Mode

A cycle where the learner sets learning goals, specifies what exactly they need to know to get there, creates exercise templates (via meaning-translation pairs), then generates learn cards, then practices them.

## Flow

### 1. Setting Goals

A very simple UI asking the learner what they want to learn or know. Simple textarea.
Persist all of this in a local `CouchDB`. Use the type `LearningGoal`.

Add a button in the top of the UI saying `Add New Goal`

### 2. Setting Subgoals

Ask the learner in a simple UI if they want to specify their goal. 
Offer a list of text inputs (3 at the beginning, but empty one omitted to the end when they get filled).
Allow also to delete them again.
These are explicit children of the previously set goal.
This relationship should be represented with a `parents` prop on the type.
Furthermore, the parent goal should be visible on the UI.

### 3. Choosing random `LearningGoal`

Load a random `LearningGoal`.
Offer options: `Edit Learning Goal`, `Delete Learning Goal`, `Add Units of Meaning` and `Practice`. 

If the `LearningGoal` has associated `UnitOfMeaning`s, make that the primary button. If not (as will now be the case, in the beginning), hide the `Practice` button. Instead, make `Add Units of Meaning` the primary button.

### 4. Adding `UnitsOfMeaning`

Assuming the user chooses to add units of meaning, go to this screen.
This is another fairly minimal UI.
The subgoal it belongs to should be shown.
Apart from that, offer a list of text inputs, again 3 rows, and if filled, add always another, and allow deletion.

However, in each row, have two colums/two text input. Label one 🇪🇬 and one 🇬🇧. The user may fill in target language words and their translations here. Important: Each row may contain *either* language's translation, or both, but that's not required. Tell this to the user.

Have a `Save` button. When clicked, save all of this in a `CouchDB` table on its own and go on.

### 5. Generating `Exercise`s

This happens in the background.
For now, there will be 3 types of `Exercise`. 
Every `Exercise` has an `instruction` and `exerciseType`. The rest of the props vary depending on derived type.
Make sure to keep this type cleanly extensible, and derive the following 3 types, for now.

- `ExerciseFlashcard`: has a front and a back. Any kind of `UnitOfMeaning` where both `target_language` and `translation` should generate two of those: One with target on the front and translation on the back, and vice versa. Instruction: "Translate." type: FLASHCARD
- `ExerciseCloze`: Instruction is "Fill in the blank". Any `UnitOfMeaning` that has `translation` set AND more than one word in the *target* language should generate as many such exercises as it has words. It has the following properties `content` (the translation + `\n\n` + full sentence in the target language) and `clozeStart` and `clozeEnd`, which are the indices in the string from where to where the symbols will be replaced with "_". These should be correctly calculated. type: FLASHCARD
- `FindTranslation`: Every `UnitOfMeaning` where either translation or target_lang is missing should generate one of these. When this exercise comes up, the user is prompted to find the translation/target_lang. Instruction "Find the translation", type: TODO

### 6. Going through `Exercise`

After each other, load and let the learner go through 5 exercises. Then go back to 3.

- For the exercises, make sensible MINIMAL uis. 
  - type flashcard should have a "reveal" button and only after that back is shown, then a "show next" button
  - type TODO should have a "Done" and a "Not Now" and a "Delete this" button