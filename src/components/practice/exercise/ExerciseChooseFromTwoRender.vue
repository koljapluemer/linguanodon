<template>
  <div class="max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Question -->
        <div class="text-center">
          <div class="text-2xl mb-6 p-4 bg-base-200 rounded-lg" v-html="exercise.front"></div>
          
          <!-- Answer options -->
          <div class="space-y-3 mb-6">
            <button 
              v-for="(option, index) in shuffledOptions" 
              :key="index"
              @click="selectAnswer(option)"
              class="btn btn-outline btn-lg w-full text-left justify-start"
              :class="{ 
                'btn-success': selectedAnswer === option && option === exercise.correctAnswer,
                'btn-error': selectedAnswer === option && option === exercise.incorrectAnswer,
                'btn-disabled': selectedAnswer !== null
              }"
            >
              <span class="font-mono mr-3">{{ String.fromCharCode(65 + index) }}.</span>
              {{ option }}
            </button>
          </div>
          
          <!-- Context -->
          <div v-if="exercise.context" class="text-lg mb-4 p-3 bg-base-300 rounded-lg">
            {{ exercise.context }}
          </div>
          
          <!-- Feedback -->
          <div v-if="selectedAnswer !== null" class="mb-4">
            <div v-if="selectedAnswer === exercise.correctAnswer" class="alert alert-success">
              <span>Correct! Well done!</span>
            </div>
            <div v-else class="alert alert-error">
              <span>Incorrect. The correct answer is: {{ exercise.correctAnswer }}</span>
            </div>
          </div>
          
          <!-- Continue button -->
          <button 
            v-if="selectedAnswer !== null"
            @click="continueToScoring"
            class="btn btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Rating } from 'ts-fsrs'
import type { ExerciseChooseFromTwo } from '@/entities/Exercises';

interface Props {
  exercise: ExerciseChooseFromTwo
}

interface Emits {
  (e: 'score', score: Rating): void
}

const emit = defineEmits<Emits>()

const props = defineProps<Props>()
const selectedAnswer = ref<string | null>(null)

/**
 * Shuffle the answer options to randomize their order
 */
const shuffledOptions = computed(() => {
  const options = [props.exercise.correctAnswer, props.exercise.incorrectAnswer]
  return options.sort(() => Math.random() - 0.5)
})

/**
 * Handle answer selection
 */
function selectAnswer(answer: string) {
  if (selectedAnswer.value !== null) return // Prevent multiple selections
  selectedAnswer.value = answer
}

/**
 * Continue to scoring phase
 */
function continueToScoring() {
  if (selectedAnswer.value === null) return
  
  // Determine rating based on correctness
  const rating = selectedAnswer.value === props.exercise.correctAnswer 
    ? Rating.Good 
    : Rating.Again
    
  emit('score', rating)
  selectedAnswer.value = null // Reset for next exercise
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