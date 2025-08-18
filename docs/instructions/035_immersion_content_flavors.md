Let's make some [lesson generator flavors](src/pages/queue/lesson-generator/flavors) around [immersion content data](src/entities/immersion-content/ImmersionContentData.ts). Make the following in their own files, and integrate them into the random selection

## Based on random immersion content

Decide on nr of tasks, randomly between 5 and 17.

Find random immersion content where
- no tasks are attached


Check the `neededVocab` for this `ImmersionContentData`.

- If we have vocab in that list that is unseen, pick 1-3 (randomly chosen) from those vocab and attach a random active task of this vocab to our task array
- If we have vocab that is seen and due related to this immersion content, pick from that randomly and add a randomly chosen task from that vocab until there is no more vocab to pick from or we hit our task limit
- If we have not hit the task limit, fill up with random due seen vocab from the whole db

## Based on immersion content with low average mastery

Exactly like above, only pick the immersion content based on:

- no tasks attached
- average vocab mastery (check `src/pages/immersion-content-manage/PageManageImmersionContent.vue` and `src/features/immersion-content-manage-needed-vocab/VocabProgressWidget.vue` for how that's calculated) is below 20%

## Based on immersion content with high-ish average mastery

Exactly like above, only pick the immersion content based on:

- no tasks attached
- average vocab mastery (check `src/pages/immersion-content-manage/PageManageImmersionContent.vue` and `src/features/immersion-content-manage-needed-vocab/VocabProgressWidget.vue` for how that's calculated) is above 50%, but below 90%


Log which flavor is used and which immersion content the lesson was based on.