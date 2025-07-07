<template>
  <div class="max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Front side (cloze) -->
        <div v-if="!isRevealed" class="text-center">
          <h2 class="card-title justify-center mb-4">Fill in the blank</h2>
          <div class="text-2xl mb-6 p-4 bg-base-200 rounded-lg" v-html="formattedFront"></div>
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
          <div class="text-2xl mb-6 p-4 bg-base-200 rounded-lg" v-html="formattedBack"></div>
          
          <div class="flex flex-wrap gap-2 justify-center">
            <button 
              @click="score('hard')" 
              class="btn btn-error"
            >
              Hard
            </button>
            <button 
              @click="score('wrong')" 
              class="btn btn-warning"
            >
              Wrong
            </button>
            <button 
              @click="score('correct')" 
              class="btn btn-success"
            >
              Correct
            </button>
            <button 
              @click="score('easy')" 
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
import { ref, computed } from 'vue'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'

interface Props {
  exercise: ExerciseFlashcard
}

interface Emits {
  (e: 'score', score: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isRevealed = ref(false)

/**
 * Formats front content with proper line breaks
 */
const formattedFront = computed(() => {
  return props.exercise.front.replace(/<br>/g, '<br>')
})

/**
 * Formats back content with proper highlighting
 */
const formattedBack = computed(() => {
  return props.exercise.back
})

/**
 * Reveals the answer side of the flashcard
 */
function reveal() {
  isRevealed.value = true
}

/**
 * Emits score event and resets for next exercise
 */
function score(scoreValue: string) {
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
</style>
