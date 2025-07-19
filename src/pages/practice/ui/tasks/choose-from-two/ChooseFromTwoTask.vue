<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "../../../model/Task";

interface Props {
  task: Task;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isRevealed = ref(false);

/**
 * Gets the prompt from task data.
 */
function getPrompt(): string {
  return props.task.data.prompt as string;
}

/**
 * Gets the options from task data.
 */
function getOptions(): string[] {
  return props.task.data.options as string[] || [];
}

/**
 * Gets the correct answer from task data.
 */
function getCorrectAnswer(): string {
  return props.task.data.correctAnswer as string || '';
}

/**
 * Gets the linguistic unit from task data.
 */
function getLinguisticUnit() {
  return props.task.data.linguisticUnit;
}

/**
 * Handles option selection.
 */
function handleOptionSelect() {
  // For now, just reveal the solution
  // In a full implementation, this would track the selection
  isRevealed.value = true;
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <!-- Task Prompt -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">{{ getPrompt() }}</h3>
        
        <!-- Options (when not revealed) -->
        <div v-if="!isRevealed" class="mb-4">
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="option in getOptions()"
              :key="option"
              class="btn btn-outline btn-lg justify-start"
              @click="handleOptionSelect()"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- Solution (when revealed) -->
      <div v-if="isRevealed" class="mb-6">
        <div class="alert alert-info">
          <div>
            <h4 class="font-semibold">Correct Answer:</h4>
            <p class="whitespace-pre-line">{{ getCorrectAnswer() }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions justify-between">
        <!-- Reveal Button -->
        <button
          v-if="!isRevealed"
          class="btn btn-secondary"
          @click="isRevealed = true"
        >
          Reveal Solution
        </button>

        <!-- Skip Button -->
        <button
          v-if="task.canSkip && !isRevealed"
          class="btn btn-outline"
          @click="emit('rate', 'Impossible')"
        >
          Skip
        </button>

        <!-- Rating Buttons (when revealed) -->
        <div v-if="isRevealed" class="flex gap-2">
          <button
            class="btn btn-error"
            @click="emit('rate', 'Impossible')"
          >
            Impossible
          </button>
          <button
            class="btn btn-warning"
            @click="emit('rate', 'Hard')"
          >
            Hard
          </button>
          <button
            class="btn btn-info"
            @click="emit('rate', 'Doable')"
          >
            Doable
          </button>
          <button
            class="btn btn-success"
            @click="emit('rate', 'Easy')"
          >
            Easy
          </button>
        </div>
      </div>

      <!-- Linguistic Unit Info -->
      <div class="mt-4 text-sm text-base-content/70">
        <p>
          <strong>Type:</strong> {{ (getLinguisticUnit() as any).type }} | 
          <strong>Language:</strong> {{ (getLinguisticUnit() as any).language }} | 
          <strong>Content:</strong> {{ (getLinguisticUnit() as any).content }}
        </p>
      </div>
    </div>
  </div>
</template> 