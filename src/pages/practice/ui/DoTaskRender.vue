<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "../model/Task";
import { TaskRegistry } from "./tasks";

interface Props {
  task: Task;
}

interface Emits {
  (e: 'complete-task', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Get the appropriate task component based on task type.
 */
const taskComponent = computed(() => {
  const taskType = props.task.taskType;
  const registeredTask = TaskRegistry.get(taskType);
  
  if (!registeredTask) {
    console.warn(`No task component registered for type: ${taskType}`);
    return null;
  }
  
  return registeredTask.component;
});

/**
 * Handles task completion with rating.
 */
function handleRate(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string) {
  emit('complete-task', rating, userInput);
}
</script>

<template>
  <!-- Render the appropriate task component based on task type -->
  <component 
    v-if="taskComponent"
    :is="taskComponent" 
    :task="task"
    @rate="handleRate"
  />
  
  <!-- Fallback for unknown task types -->
  <div v-else class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="alert alert-error">
        <span>Unknown task type: {{ task.taskType }}</span>
      </div>
    </div>
  </div>
</template>
