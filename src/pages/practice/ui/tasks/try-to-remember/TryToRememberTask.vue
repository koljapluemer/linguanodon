<script setup lang="ts">
import type { Task } from "../../../model/Task";
import WidgetBigText from "@/shared/WidgetBigText.vue";
import WidgetInstruction from "@/shared/WidgetInstruction.vue";
import WidgetRateConfidence from "@/shared/WidgetRateConfidence.vue";

interface Props {
  task: Task;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Gets the prompt from task data.
 */
function getPrompt(): string {
  return props.task.data.prompt as string;
}

/**
 * Gets the solution from task data.
 */
function getSolution(): string {
  return props.task.data.solution as string;
}

/**
 * Gets the linguistic unit from task data.
 */
function getLinguisticUnit() {
  return props.task.data.linguisticUnit;
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

      <!-- Dashed Line -->
      <div class="border-t-2 md:border-dotted border-base-300 my-4"></div>

      <!-- Back (Solution) -->
      <div class="mb-6 text-center">
        <WidgetBigText :is-extra-big="true">
          {{ getSolution() }}
        </WidgetBigText>
      </div>




    </div>
  </div>

  <!-- Rating -->
  <WidgetRateConfidence prompt="How difficult to remember is this word?" @rate="emit('rate', $event)" />
</template>
