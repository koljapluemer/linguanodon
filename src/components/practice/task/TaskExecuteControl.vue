<template>
  <TaskExecuteView
    :task="task"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import TaskExecuteView from './TaskExecuteView.vue'
import type { Task } from '@/entities/Task'
import type { TaskAttempt } from '@/entities/Task'

interface Props {
  task: Task
}

interface Emits {
  (e: 'task-attempt', attempt: TaskAttempt): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle form submission
 */
function handleSubmit(ease: number, correctness: number) {
  const attempt: TaskAttempt = {
    ease,
    correctness,
    timestamp: new Date()
  }
  
  emit('task-attempt', attempt)
}
</script>
