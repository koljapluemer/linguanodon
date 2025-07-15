<template>
  <div class="max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Front side (cloze) -->
        <div v-if="!isRevealed" class="text-center">
          <div class="text-2xl mb-6 p-4 bg-base-200 rounded-lg" v-html="exercise.front"></div>
          <button 
            @click="reveal" 
            class="btn btn-primary"
          >
            Reveal Answer
          </button>
        </div>
        
        <!-- Back side (answer + scoring) -->
        <div v-else class="text-center">
          <h2 class="card-title justify-center mb-4">Answer</h2>
          <div class="text-2xl mb-6 p-4 bg-base-200 rounded-lg" v-html="exercise.back"></div>
          
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

<script setup lang="ts">
import { ref } from 'vue'
import { Rating } from 'ts-fsrs'
import type { ExerciseFlashcard } from '@/entities/Exercises';

interface Props {
  exercise: ExerciseFlashcard
}

interface Emits {
  (e: 'score', score: Rating): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const isRevealed = ref(false)

/**
 * Reveals the answer side of the flashcard
 */
function reveal() {
  isRevealed.value = true
}

/**
 * Emits score event and resets for next exercise
 */
function score(scoreValue: Rating) {
  emit('score', scoreValue)
  isRevealed.value = false
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

/* Ensure proper text sizing for the main cloze sentence */
:deep(div[dir]) {
  font-size: 1.875rem; /* text-3xl */
  margin-bottom: 1.25rem; /* mb-5 */
}

/* Ensure proper text sizing for the context sentence */
:deep(div[dir] + div[dir]) {
  font-size: 1.5rem; /* text-2xl */
}
</style>
