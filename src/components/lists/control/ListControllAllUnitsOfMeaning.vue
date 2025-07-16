<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2">Loading units...</p>
    </div>
    <div v-else>
      <ListRenderUnitsOfMeaningLazy
        :units="units"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import { unitOfMeaningRepositoryKey } from '@/types/injectionKeys'
import ListRenderUnitsOfMeaningLazy from '../render/ListRenderUnitsOfMeaningLazy.vue'

// Inject repository using proper injection key
const repository = inject(unitOfMeaningRepositoryKey, null)

if (!repository) {
  throw new Error('UnitOfMeaningRepository not provided in parent context')
}

// Type assertion after null check
const typedRepository = repository as NonNullable<typeof repository>

const units = ref<UnitOfMeaning[]>([])
const loading = ref(true)

/**
 * Load all units from the repository
 */
async function loadUnits() {
  try {
    units.value = await typedRepository.getAllUnitsOfMeaning()
  } catch (error) {
    console.error('Error loading units:', error)
    units.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUnits()
})
</script> 