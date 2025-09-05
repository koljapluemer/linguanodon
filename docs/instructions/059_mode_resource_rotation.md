Make a new mode "Resource Rotation".

First, read [this](docs/instructions/056_ultrarandom_mode.md) , [this](docs/instructions/057_illegal_immersion_mode.md) and [this](docs/instructions/058_mode_sentence_slide.md) and ALL!!!!!!!! mentioned files and explain how they work, what a mode is, and where it must be changed added.

- Adhere to the [UI guidelines](docs/how_to_design.md). As a first step, list ALL OF THEM in chat.

- Mode is fairly simple: Pick [resource](src/entities/resources/ResourceData.ts) that is not `finishedExtracting` and generate [this task](src/pages/practice/tasks/task-resource-extract-knowledge) (you can actully just use its [getRandom](src/pages/practice/tasks/task-resource-extract-knowledge/getRandom.ts), if done, next.
- If no task can be generated, link to [the page for adding a resource](src/app/router.ts)