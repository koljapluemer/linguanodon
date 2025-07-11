<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Remote Sets</h1>
    <ListControllRemoteSets />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ListControllRemoteSets from '@/components/lists/control/ListControllRemoteSets.vue'
import { piniaSetRepository } from '@/repositories/pinia/useRepoPiniaSets'
import { piniaTaskRepository } from '@/repositories/pinia/useRepoPiniaTasks'
import { piniaUnitOfMeaningRepository } from '@/repositories/pinia/useRepoPiniaUnitsOfMeaning'
import type { SetRepository } from '@/repositories/interfaces/SetRepository'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

// Provide repositories to child components
provide<SetRepository>('setRepository', piniaSetRepository)
provide<TaskRepository>('taskRepository', piniaTaskRepository)
provide<UnitOfMeaningRepository>('unitOfMeaningRepository', piniaUnitOfMeaningRepository)
</script>
