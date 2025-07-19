<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "../model/Task";

interface Props {
  task: Task;
}

interface Emits {
  (e: 'complete-task', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string): void;
  (e: 'reveal-solution'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const userInput = ref('');

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
  const input = props.task.taskType === 'free-translate' ? userInput.value : undefined;
  emit('complete-task', rating, input);
}

/**
 * Handles user input change for free-translate tasks.
 */
function handleInputChange(value: string) {
  userInput.value = value;
}
</script>

<template>
  <DoTaskRender
    :task="task"
    :user-input="userInput"
    @complete-task="handleCompleteTask"
    @reveal-solution="handleRevealSolution"
    @input-change="handleInputChange"
  />
</template>
