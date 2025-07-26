# New Exercise Queue Paradigm

I want to establish a new mode of generating and interacting with exercises.

This will replace the sunsetted `Lesson` paradigm, which code can still be found *for reference only* in the legacy code folder (`docs/legacy_code/practice`). Please ensure that you read *all* of the containing files *thoroughly*. I want summaries of each and every one.

## Planned Structure

Now, *all* of the code for this should live in `pages/queue/`, since none of this will be shared.
We will also utilize entity code, especially in `entitis/linguisticUnits/`. Read the containing files and summarize.

## Approach

At core, we will have a `PageQueue`. 
It displays an infinite progression of exercises to the user.
Thus, it does *not* have a progress bar or messages when a "lesson" is completed. These concepts make no sense with this approach.

Internally, the page works with a preload approach:
It uses a composable (`useQueue`, to be created) that keeps track of two `Exercise[]` arrays, one current, and the one that we show next, and when we're done with the current, we swap and preload the one to come after (this is b/c exercise gen may take a bit, so we want to be prepared.)

We can call these arrays ExerciseBatch.

How then, do we get such an exercise batch filled with exercises?

We will make a class responsible for that, called `ExerciseBatchGenerator`. It will have a static method returning `Exercise[]` which equals a batch.

First, note that a batch will be made from 3 kinds of exercises.

- bread and butter exercises
- special exercises *(optional)*
- fun exercises *(optional)*

To get the bread and butter exercises, we will make a class `BreadAndButterExerciseGenerator`, whose only public method is a one to, well, generate exercises.

This class, in turn, will hold a reference of all our implementations of `LinguisticUnitsProposalGenerator`, an interface we also have to make, with derived classes. `BreadAndButterExerciseGenerator` will as a first order of business call all `LinguisticUnitsProposalGenerator` it knows about.

`LinguisticUnitsProposalGenerator` is an interface that enforces one static method which returns `LinguisticUnitData[]`.
For now, we will only have one class implementing this interface: `DueLinguisticUnitsProposalGenerator`,
which asks the `linguisticUnits` repo for 100 random due linguistic units, and returns them. We have to implement functionality for this in `linguisticUnits`.

...now, for things to make sense, we need to change some stuff about `LinguisticUnitData`, or rather `LinguisticUnitProgressData`.

## Type Changes to `LinguisticUnitData`

- We no longer need `LinguisticUnitProgressData`. It does not have to be in its own repo
- Instead, make a small type `LinguisticUnitProgress`, which lives as optional prop `progress?: LinguisticUnitProgress` on `LinguisticProgressData`. Make sure to adapt both the type and the dependent dexie dbs. Then delete the `LinguisticUnitProgressData` folder
- `LinguisticUnitProgress` should extend `ts-fsrs` `Card` (search code base for use!) and also have two additional props: `streak: number` and `mastery: number`


## ...back to main flow

<!-- TODO: talk about TranslationPair, and the whole idea of not tracking native units -->

With this in mind, as said, `BreadAndButterExerciseGenerator` will take its list of units, shuffle them, take the first 20, and one by one create exercises based on them.
For that, it will check a bunch of conditions, and if a given condition is true, it will call a specific generator derived from yet another interface, `ExerciseGenerator`:

- If the `linguisticUnit` is a word and the `streak` is 0, call `TryToRememberExerciseGenerator implements ExerciseGenerator`. Check the legacy code for `try-to-remember` style exercises

## Notes

### Conceptual Approach For Rendering Exercise Types

Here is a general guide for the paradigm of generating exercises:

*This does not mean we literally want to implement it exactly like this, this is JUST!! THE!! CONCEPT!!!*

#### 1. Define a Discriminated Union

```ts
interface BaseExercise {
  id: string
  type: 'free-translate' | 'multiple-choice' // discriminator
}

interface FreeTranslateExercise extends BaseExercise {
  type: 'free-translate'
  prompt: string
  expectedAnswer: string
  // other specific props
}

interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice'
  question: string
  options: string[]
  correctIndex: number
}

type Exercise = FreeTranslateExercise | MultipleChoiceExercise
```

---

#### 2. Create a Component Map

```ts
import FreeTranslateExerciseRender from './FreeTranslateExerciseRender.vue'
import MultipleChoiceExerciseRender from './MultipleChoiceExerciseRender.vue'

const exerciseComponentMap = {
  'free-translate': FreeTranslateExerciseRender,
  'multiple-choice': MultipleChoiceExerciseRender,
}
```

---

#### 3. Render with `<component :is="..." />` Using Narrowing

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ exercise: Exercise }>()

const component = computed(() => {
  return exerciseComponentMap[props.exercise.type]
})
</script>

<template>
  <component
    :is="component"
    v-bind="exercise"
  />
</template>
```

* `v-bind="exercise"` spreads props according to type.
* TypeScript infers correct props based on discriminated union.

---

#### 4. Type-Safety in Components

Each component defines props matching its specific interface:

```ts
// FreeTranslateExerciseRender.vue
<script setup lang="ts">
defineProps<FreeTranslateExercise>()
</script>
```
