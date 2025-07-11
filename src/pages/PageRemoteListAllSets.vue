<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Remote Sets</h1>
    <ListControllRemoteSets />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ListControllRemoteSets from '@/components/lists/control/ListControllRemoteSets.vue'
import { piniaSetRepository } from '@/repositories/implementations/pinia/useRepoPiniaSets'
import { piniaTaskRepository } from '@/repositories/implementations/pinia/useRepoPiniaTasks'
import { piniaUnitOfMeaningRepository } from '@/repositories/implementations/pinia/useRepoPiniaUnitsOfMeaning'
import { setRepositoryKey, taskRepositoryKey, unitOfMeaningRepositoryKey } from '@/types/injectionKeys'

// Provide repositories to child components
provide(setRepositoryKey, piniaSetRepository)
provide(taskRepositoryKey, piniaTaskRepository)
provide(unitOfMeaningRepositoryKey, piniaUnitOfMeaningRepository)
</script>
