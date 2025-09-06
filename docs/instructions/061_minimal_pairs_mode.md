- Let's make a new mode "Minimal Pairs"

First, read [this](docs/instructions/056_ultrarandom_mode.md) , [this](docs/instructions/057_illegal_immersion_mode.md) and [this](docs/instructions/058_mode_sentence_slide.md) and ALL!!!!!!!! mentioned files and explain how they work, what a mode is, and where it must be changed added.

- Adhere to the [UI guidelines](docs/how_to_design.md). As a first step, list ALL OF THEM in chat.

We need a new task. Read [this](/home/b/GITHUB/linguanodon/docs/instructions/054_img_and_sound_learning.md) in DEtAIL and checkout the relevant files to see what it entails to make a new task.

In some ways, this task will mirror [choose-image-by-sound](src/pages/practice/tasks/task-vocab-choose-image-by-sound/Render.vue). In fact, factor the sound player into a dumb component in @shared/ui and use it in both the old task and this new one.

Our task should be called "vocab-choose-from-sound".

Our mode will only pick [vocab](src/entities/vocab/VocabData.ts) data which fulfill all of the below

- either due or unseen
- `consideredCharacter` true
- `relatedVocab` length > 0
- `content` set

Filter, as always, IN THE [REPO](src/entities/vocab/VocabRepo.ts) and always use [array utils](src/shared/utils/arrayUtils.ts) if relevant.

Choose a random such vocab.

Then, from its relatedVocab, pick a random vocab that is also a character and has sound attached and content is set. Due status doesn't matter. If no such related vocab exists, the initial vocab is also invalidated and we need to find a new one.

On the task then, show the sound player for a randomly chosen sound from the initial vocab.

Then, two buttons, shuffled, with "$vocab1.content" "$vocab2.content". This way, the user can select which of the vocab they just heard.

Below that,  [the full vocab info](src/features/display-vocab-with-translations/VocabWithTranslationsDisplay.vue) for the two selections, in the same randomized order as the buttons.

Score like [here](src/pages/practice/tasks/task-vocab-single-choice/Render.vue), considering whether or not the user clicked the right button the 1st time or not.