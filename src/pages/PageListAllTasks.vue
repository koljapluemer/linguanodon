<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">All Tasks</h1>
    <ListControllAllTasks />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ListControllAllTasks from '@/components/lists/control/ListControllAllTasks.vue'
import { piniaTaskRepository } from '@/repositories/implementations/pinia/useRepoPiniaTasks'
import { taskRepositoryKey } from '@/types/injectionKeys'

// Provide the task repository to child components
provide(taskRepositoryKey, piniaTaskRepository)
</script> 