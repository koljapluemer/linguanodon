<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold  mb-2">Words & Sentences</h1>
      <p class="">View all downloaded words and sentences.</p>
    </div>
    
    <ListControllAllUnitsOfMeaning />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ListControllAllUnitsOfMeaning from '@/components/lists/control/ListControllAllUnitsOfMeaning.vue'
import { piniaUnitOfMeaningRepository } from '@/repositories/implementations/pinia/useRepoPiniaUnitsOfMeaning'
import { unitOfMeaningRepositoryKey } from '@/types/injectionKeys'

// Provide the unit of meaning repository to child components
provide(unitOfMeaningRepositoryKey, piniaUnitOfMeaningRepository)
</script> 