<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "../model/Task";

interface Props {
  task: Task;
  userInput?: string;
}

interface Emits {
  (e: 'complete-task', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
  (e: 'reveal-solution'): void;
  (e: 'input-change', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localUserInput = ref(props.userInput || '');

/**
 * Handles input change for free-translate tasks.
 */
function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  localUserInput.value = target.value;
  emit('input-change', target.value);
}

/**
 * Handles solution reveal.
 */
function handleRevealSolution() {
  emit('reveal-solution');
}

/**
 * Handles task completion with rating.
 */
function handleCompleteTask(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy') {
  emit('complete-task', rating);
}

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
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <!-- Task Prompt -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">{{ getPrompt() }}</h3>
        
        <!-- Free Translation Input -->
        <div v-if="task.taskType === 'free-translate' && !task.isRevealed" class="mb-4">
          <textarea
            v-model="localUserInput"
            @input="handleInputChange"
            class="textarea textarea-bordered w-full h-24"
            placeholder="Type your translation here..."
          ></textarea>
        </div>
      </div>

      <!-- Solution (when revealed) -->
      <div v-if="task.isRevealed" class="mb-6">
        <div class="alert alert-info">
          <div>
            <h4 class="font-semibold">Solution:</h4>
            <p class="whitespace-pre-line">{{ getSolution() }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions justify-between">
        <!-- Reveal Button -->
        <button
          v-if="!task.isRevealed"
          class="btn btn-secondary"
          @click="handleRevealSolution"
        >
          Reveal Solution
        </button>

        <!-- Skip Button -->
        <button
          v-if="task.canSkip && !task.isRevealed"
          class="btn btn-outline"
          @click="handleCompleteTask('Impossible')"
        >
          Skip
        </button>

        <!-- Rating Buttons (when revealed) -->
        <div v-if="task.isRevealed" class="flex gap-2">
          <button
            class="btn btn-error"
            @click="handleCompleteTask('Impossible')"
          >
            Impossible
          </button>
          <button
            class="btn btn-warning"
            @click="handleCompleteTask('Hard')"
          >
            Hard
          </button>
          <button
            class="btn btn-info"
            @click="handleCompleteTask('Doable')"
          >
            Doable
          </button>
          <button
            class="btn btn-success"
            @click="handleCompleteTask('Easy')"
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
