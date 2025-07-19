<script setup lang="ts">
import { ref } from "vue";
import type { RevealExercise } from "../../../model/Exercise";
import WidgetBigText from "@/shared/WidgetBigText.vue";
import WidgetInstruction from "@/shared/WidgetInstruction.vue";
import WidgetRateConfidence from "@/shared/WidgetRateConfidence.vue";
import WidgetRevealButton from "@/shared/WidgetRevealButton.vue";

interface Props {
  exercise: RevealExercise;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Internal state for reveal
const isRevealed = ref(false);

/**
 * Gets the prompt from exercise data.
 */
function getPrompt(): string {
  return props.exercise.prompt;
}

/**
 * Gets the solution from exercise data.
 */
function getSolution(): string {
  return props.exercise.solution;
}

/**
 * Gets the linguistic unit from exercise data.
 */
function getLinguisticUnit() {
  return props.exercise.linguisticUnit;
}

/**
 * Gets the linguistic unit content.
 */
function getLinguisticUnitContent(): string {
  const unit = getLinguisticUnit() as { content: string };
  return unit.content;
}

/**
 * Checks if the linguistic unit is a word.
 */
function isWord(): boolean {
  const unit = getLinguisticUnit() as { type: string };
  return unit.type === 'word';
}
</script>

<template>

  <!-- Task Instruction -->
  <WidgetInstruction>
    {{ getPrompt() }}
  </WidgetInstruction>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">


      <!-- Front (Linguistic Unit Content) -->
      <div class="mb-4 text-center">
        <WidgetBigText :is-extra-big="isWord()">
          {{ getLinguisticUnitContent() }}
        </WidgetBigText>
      </div>

      <!-- Solution (when revealed) -->
      <div v-if="isRevealed">
        <!-- Dashed Line -->
        <div class="border-t-2 md:border-dotted border-base-300 my-4"></div>

        <!-- Back (Solution) -->
        <div class="mb-6 text-center">
          <WidgetBigText :is-extra-big="false">
            {{ getSolution() }}
          </WidgetBigText>
        </div>
      </div>



    </div>
  </div>


  <!-- Action Buttons -->
  <div class="flex justify-center gap-2 w-full">
    <!-- Reveal Button -->
    <WidgetRevealButton v-if="!isRevealed" @click="isRevealed = true" />

    <!-- Skip Button -->
    <button v-if="!exercise.isRepeatable && !isRevealed" class="btn btn-outline" @click="emit('rate', 'Impossible')">
      Skip
    </button>

    <!-- Rating (when revealed) -->
    <WidgetRateConfidence v-if="isRevealed" prompt="How difficult was this?" @rate="emit('rate', $event)" />
  </div>
</template>