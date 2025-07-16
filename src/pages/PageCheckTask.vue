<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="flex justify-center items-center min-h-[200px]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else-if="error" class="alert alert-error max-w-md mx-auto my-8">
      <span>{{ error }}</span>
    </div>
    <ViewTask v-else-if="task" :task="task" />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRepoDexieTasks } from '@/repositories/implementations/dexie/useRepoDexieTasks'
import { useRepoDexieUnitsOfMeaning } from '@/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning'
import { taskRepositoryKey, unitOfMeaningRepositoryKey } from '@/types/injectionKeys'
import type { Task } from '@/entities/Task'
import ViewTask from '@/components/view/ViewTask.vue'

const route = useRoute()
const taskId = route.params.taskId as string

const taskRepo = useRepoDexieTasks()
const unitRepo = useRepoDexieUnitsOfMeaning()

provide(taskRepositoryKey, taskRepo)
provide(unitOfMeaningRepositoryKey, unitRepo)

const loading = ref(true)
const error = ref('')
const task = ref<Task | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const found = await taskRepo.getTaskByUid(taskId)
    if (!found) {
      error.value = 'Task not found'
      task.value = null
      return
    }
    task.value = found
  } catch {
    error.value = 'Failed to load task'
  } finally {
    loading.value = false
  }
})
</script>
