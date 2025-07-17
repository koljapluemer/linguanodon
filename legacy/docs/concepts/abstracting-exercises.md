# Plug‑and‑Play Polymorphic Components

A mental model for wiring up discriminated‑union data with dynamic Vue components using a single facade.

---

## 1. Registry

Declare a single `renderers` object that maps type keys to component implementations.

```ts
export const renderers = {
  mcq: MCQExercise,
  fillBlank: FillBlankExercise,
} as const
````

* Centralizes component lookup.
* `as const` ensures literal key types.

## 2. Type Derivation

Derive a string‑literal union from the registry’s keys, eliminating handwritten magic strings.

```ts
export type ExerciseType = keyof typeof renderers
// 'mcq' | 'fillBlank'
```

## 3. Payload Interfaces

Define one payload interface per type. Each extends a common base, carries its own data, and specifies its `type` literal.

```ts
interface BaseExercise {
  id: string
  instruction: string
}

export interface MCQExercise extends BaseExercise {
  type: 'mcq'
  options: string[]
  answerIndex: number
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fillBlank'
  blanks: string[]
}

export type Exercise = MCQExercise | FillBlankExercise
```

* Keeps data shapes isolated and type‑safe.
* Discriminator field `type` ties payload to renderer.

## 4. Generic Facade Component

Create `Exercise.vue` to accept any `Exercise` and render the correct sub‑component via Vue’s dynamic `<component>`.

```vue
<template>
  <component :is="renderer" :exercise="exercise" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { Exercise, ExerciseType } from './types'
import { renderers } from './types'

export default defineComponent({
  name: 'Exercise',
  props: {
    exercise: {
      type: Object as () => Exercise,
      required: true,
    },
  },
  setup(props) {
    const renderer = computed(() =>
      renderers[props.exercise.type as ExerciseType]
    )
    return { renderer }
  }
})
</script>
```

* No `v-if` chains.
* Full TypeScript safety: lookup keys match payload `type`.

## 5. Extensibility

To add a new exercise type:

1. Create `NewExercise.vue` component.
2. Define `NewExercise` interface extending `BaseExercise` with `type: 'newType'`.
3. Add one line in the `renderers` object:

   ```ts
   newType: NewExercise
   ```

That's it—no boilerplate duplication, just plug-and-play!"

