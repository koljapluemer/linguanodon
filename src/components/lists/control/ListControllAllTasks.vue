<template>
  <div>
    <ListRenderTasks
      :tasks="tasks"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { piniaTaskRepository } from '@/repositories/pinia/useRepoPiniaTasks'
import ListRenderTasks from '@/components/lists/render/ListRenderTasks.vue'
import type { Task } from '@/entities/Task'

const tasks = ref<Task[]>([])

/**
 * Load all tasks from the repository
 */
async function loadTasks() {
  try {
    tasks.value = await piniaTaskRepository.getAllTasks()
  } catch (error) {
    console.error('Error loading tasks:', error)
    tasks.value = []
  }
}

onMounted(() => {
  loadTasks()
})
</script> 