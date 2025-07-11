<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2">Loading units...</p>
    </div>
    <div v-else>
      <ListRenderUnitsOfMeaning
        :units="units"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ListRenderUnitsOfMeaning from '@/components/lists/render/ListRenderUnitsOfMeaning.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

interface Props {
  repository: UnitOfMeaningRepository
}

const props = defineProps<Props>()

const units = ref<UnitOfMeaning[]>([])
const loading = ref(true)

/**
 * Load all units from the repository
 */
async function loadUnits() {
  try {
    units.value = await props.repository.getAllUnitsOfMeaning()
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