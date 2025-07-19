<script setup lang="ts">
import type { Lesson } from "../model/Lesson";
import type { Exercise } from "../model/Exercise";
import DoTaskRender from "./DoTaskRender.vue";

interface Props {
  lesson: Lesson | null;
  exercise: Exercise | null;
  loading: boolean;
  error: string | null;
}

interface Emits {
  (e: 'complete-exercise', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string): void;
  (e: 'start-new-lesson'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Handles exercise completion with rating.
 */
function handleCompleteExercise(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string) {
  emit('complete-exercise', rating, userInput);
}

/**
 * Handles starting a new lesson.
 */
function handleStartNewLesson() {
  emit('start-new-lesson');
}

/**
 * Gets progress percentage for the lesson.
 */
function getProgressPercentage(): number {
  if (!props.lesson) return 0;
  return (props.lesson.currentExerciseIndex / props.lesson.exercises.length) * 100;
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4 text-lg">Loading lesson...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="alert alert-error">
        <span>{{ error }}</span>
      </div>
      <button class="btn btn-primary mt-4" @click="handleStartNewLesson">
        Try Again
      </button>
    </div>

    <!-- Lesson Completed State -->
    <div v-else-if="lesson?.isCompleted" class="text-center py-12">
        <div class="">
          <h2 class="text-2xl mb-4">🎉 Lesson Completed!</h2>
          <p class="text-lg mb-6">
            You completed {{ lesson.exercises.length }} exercises.
          </p>
          <div class="justify-center">
            <button class="btn btn-primary btn-lg" @click="handleStartNewLesson">
              Start New Lesson
            </button>
          </div>
        </div>
      </div>

    <!-- Active Lesson State -->
    <div v-else-if="lesson && exercise" class="space-y-6">
      <!-- Progress Bar -->
      <div class="">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium">
              Exercise {{ lesson.currentExerciseIndex + 1 }} of {{ lesson.exercises.length }}
            </span>
            <span class="text-sm text-base-content/70">
              {{ Math.round(getProgressPercentage()) }}% Complete
            </span>
          </div>
          <progress 
            class="progress progress-primary w-full" 
            :value="getProgressPercentage()" 
            max="100"
          ></progress>
      </div>

      <!-- Current Exercise -->
      <DoTaskRender
        :exercise="exercise"
        @complete-exercise="handleCompleteExercise"
      />
    </div>

    <!-- No Lesson State -->
    <div v-else class="text-center py-12">
      <p class="text-lg mb-4">No lesson available.</p>
      <button class="btn btn-primary" @click="handleStartNewLesson">
        Start Lesson
      </button>
    </div>
  </div>
</template>
