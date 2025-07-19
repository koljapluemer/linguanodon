<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "../../../model/Task";
import WidgetBigText from "@/shared/WidgetBigText.vue";
import WidgetInstruction from "@/shared/WidgetInstruction.vue";
import WidgetImportantTextArea from "@/shared/WidgetImportantTextArea.vue";
import WidgetRateConfidence from "@/shared/WidgetRateConfidence.vue";
import WidgetRevealButton from "@/shared/WidgetRevealButton.vue";

interface Props {
  task: Task;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const userInput = ref('');
const isRevealed = ref(false);

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
 * Handles task completion with rating and user input.
 */
function handleCompleteTask(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy') {
  emit('rate', rating, userInput.value);
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <!-- Task Instruction -->
      <WidgetInstruction>
        {{ getPrompt() }}
      </WidgetInstruction>

      <!-- Front (Linguistic Unit Content) -->
      <div class="mb-4 text-center">
        <WidgetBigText :is-extra-big="false">
          {{ getLinguisticUnitContent() }}
        </WidgetBigText>
      </div>
      
      <!-- Translation Input -->
      <div v-if="!isRevealed" class="mb-4">
        <WidgetImportantTextArea
          v-model="userInput"
          placeholder="Type your translation here..."
        />
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
          
          <!-- User's Answer (if provided) -->
          <div v-if="userInput" class="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p class="text-sm font-medium text-warning-content">Your Answer:</p>
            <p class="whitespace-pre-line">{{ userInput }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions justify-between">
        <!-- Reveal Button -->
        <WidgetRevealButton
          v-if="!isRevealed"
          @click="isRevealed = true"
        />

        <!-- Skip Button -->
        <button
          v-if="task.canSkip && !isRevealed"
          class="btn btn-outline"
          @click="handleCompleteTask('Impossible')"
        >
          Skip
        </button>

        <!-- Rating (when revealed) -->
        <WidgetRateConfidence
          v-if="isRevealed"
          prompt="How difficult was this to translate?"
          @rate="handleCompleteTask"
        />
      </div>


    </div>
  </div>
</template> 