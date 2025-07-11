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
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'

const taskRepository = inject<TaskRepository>('taskRepository')
const tasks = ref<Task[]>([])

/**
 * Load all tasks from the repository
 */
async function loadTasks() {
  if (!taskRepository) {
    console.error('Task repository not provided')
    return
  }
  
  try {
    tasks.value = await taskRepository.getAllTasks()
  } catch (error) {
    console.error('Error loading tasks:', error)
    tasks.value = []
  }
}

onMounted(() => {
  loadTasks()
})
</script> 