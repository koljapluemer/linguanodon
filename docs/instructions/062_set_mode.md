Make a new mode "Set Study".

First, read [this](docs/instructions/056_ultrarandom_mode.md) , [this](docs/instructions/057_illegal_immersion_mode.md) and [this](docs/instructions/058_mode_sentence_slide.md) and ALL!!!!!!!! mentioned files and explain how they work, what a mode is, and where it must be changed added.


---

*Set Study* should be based on a [local set](src/entities/local-sets/LocalSetData.ts).

As such, it has the special need of having first an UI screen where a set can be selected from the user's [sets](src/entities/local-sets/LocalSetRepoContract.ts) (SEARCH! the codebase for how smart dropdowns are handled throughout).

Pre-select the latest downloaded set in the dropdown.

In this UI, also let the user set the maximum amount of new vocab they want to learn.

Then start the actual set, generate vocab tasks as do the other modes, heeding the limitation that they must be from the set, and adhere to the maximum of new vocab.

