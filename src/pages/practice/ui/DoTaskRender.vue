<script setup lang="ts">
import { computed } from "vue";
import type { Exercise } from "../model/Exercise";
import { TaskRegistry } from "./tasks";

interface Props {
  exercise: Exercise;
}

interface Emits {
  (e: 'complete-exercise', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Get the appropriate task component based on exercise type.
 */
const taskComponent = computed(() => {
  const exerciseType = props.exercise.type;
  const registeredTask = TaskRegistry.get(exerciseType);
  
  if (!registeredTask) {
    console.warn(`No task component registered for type: ${exerciseType}`);
    return null;
  }
  
  return registeredTask.component;
});

/**
 * Handles exercise completion with rating.
 */
function handleRate(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string) {
  emit('complete-exercise', rating, userInput);
}
</script>

<template>
  <!-- Render the appropriate task component based on exercise type -->
  <component 
    v-if="taskComponent"
    :is="taskComponent" 
    :exercise="exercise"
    @rate="handleRate"
  />
  
  <!-- Fallback for unknown exercise types -->
  <div v-else class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="alert alert-error">
        <span>Unknown exercise type: {{ exercise.type }}</span>
      </div>
    </div>
  </div>
</template>
