<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "../../../model/Task";

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
 * Handles task completion with rating and user input.
 */
function handleCompleteTask(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy') {
  emit('rate', rating, userInput.value);
}

/**
 * Handles input change for the translation textarea.
 */
function handleInputChange(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  userInput.value = target.value;
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <!-- Task Prompt -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">{{ getPrompt() }}</h3>
        
        <!-- Translation Input -->
        <div v-if="!isRevealed" class="mb-4">
          <textarea
            v-model="userInput"
            @input="handleInputChange"
            class="textarea textarea-bordered w-full h-24"
            placeholder="Type your translation here..."
          ></textarea>
        </div>
      </div>

      <!-- Solution (when revealed) -->
      <div v-if="isRevealed" class="mb-6">
        <div class="alert alert-info">
          <div>
            <h4 class="font-semibold">Solution:</h4>
            <p class="whitespace-pre-line">{{ getSolution() }}</p>
          </div>
        </div>
        
        <!-- User's Answer (if provided) -->
        <div v-if="userInput" class="alert alert-warning mt-2">
          <div>
            <h4 class="font-semibold">Your Answer:</h4>
            <p class="whitespace-pre-line">{{ userInput }}</p>
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
          @click="handleCompleteTask('Impossible')"
        >
          Skip
        </button>

        <!-- Rating Buttons (when revealed) -->
        <div v-if="isRevealed" class="flex gap-2">
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