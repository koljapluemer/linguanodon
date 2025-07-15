<template>
  <div class="max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Front side (input) -->
        <div v-if="!isRevealed" class="text-center">
          <div class="text-2xl mb-6 p-4 bg-base-200 rounded-lg" v-html="exercise.front"></div>
          <input
            v-model="userInput"
            type="text"
            class="input input-bordered w-full mb-4"
            placeholder="Type your translation here..."
            :disabled="isRevealed"
            @keyup.enter="reveal"
          />
          <button 
            @click="reveal" 
            class="btn btn-primary"
          >
            Reveal Answer
          </button>
        </div>
        
        <!-- Back side (answer + scoring) -->
        <div v-else class="text-center">
          <h2 class="card-title justify-center mb-4">Compare your translation</h2>
          <div class="mb-4">
            <span class="font-medium opacity-70">Target sentence:</span>
            <div class="mt-2 p-3 bg-base-200 rounded-lg min-h-[2rem]" v-html="exercise.front"></div>
          </div>
          <div class="mb-4">
            <span class="font-medium opacity-70">Your translation:</span>
            <div class="mt-2 p-3 bg-base-300 rounded-lg min-h-[2rem]">{{ userInput }}</div>
          </div>
          <div class="mb-6">
            <span class="font-medium opacity-70">Reference translation:</span>
            <div class="mt-2 p-3 bg-base-200 rounded-lg min-h-[2rem]" v-html="exercise.back"></div>
          </div>
          <div class="flex flex-wrap gap-2 justify-center">
            <button 
              @click="score(Rating.Again)" 
              class="btn btn-error"
            >
              Wrong
            </button>
            <button 
              @click="score(Rating.Hard)" 
              class="btn btn-warning"
            >
              Hard
            </button>
            <button 
              @click="score(Rating.Good)" 
              class="btn btn-success"
            >
              Correct
            </button>
            <button 
              @click="score(Rating.Easy)" 
              class="btn btn-info"
            >
              Easy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

/**
 * Render component for free-translation exercises. Handles user input, reveal, and scoring.
 */
<script setup lang="ts">
import { ref } from 'vue'
import type { ExerciseFreeTranslation } from '@/utils/exercise/types/exerciseTypes'
import { Rating } from 'ts-fsrs'

interface Props {
  exercise: ExerciseFreeTranslation
}

interface Emits {
  (e: 'score', score: Rating): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const isRevealed = ref(false)
const userInput = ref('')

/**
 * Reveals the reference translation and user input for comparison.
 */
function reveal() {
  isRevealed.value = true
}

/**
 * Emits score event and resets for next exercise.
 */
function score(scoreValue: Rating) {
  emit('score', scoreValue)
  isRevealed.value = false
  userInput.value = ''
}
</script>

<style scoped>
/* Ensure proper styling for mark tags */
:deep(mark) {
  background-color: yellow;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}
</style> 