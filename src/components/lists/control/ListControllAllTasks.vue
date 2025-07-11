<template>
  <div>
    <ListRenderTasks
      :tasks="tasks"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import ListRenderTasks from '@/components/lists/render/ListRenderTasks.vue'
import type { Task } from '@/entities/Task'
import { taskRepositoryKey } from '@/types/injectionKeys'

// Inject repository using proper injection key
const taskRepository = inject(taskRepositoryKey, null)

if (!taskRepository) {
  throw new Error('TaskRepository not provided in parent context')
}

// Type assertion after null check
const typedTaskRepository = taskRepository as NonNullable<typeof taskRepository>

const tasks = ref<Task[]>([])

/**
 * Load all tasks from the repository
 */
async function loadTasks() {
  try {
    tasks.value = await typedTaskRepository.getAllTasks()
  } catch (error) {
    console.error('Error loading tasks:', error)
    tasks.value = []
  }
}

onMounted(() => {
  loadTasks()
})
</script> 