<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2">Loading unit...</p>
    </div>
    <div v-else-if="!unit" class="text-center py-8 text-error">
      <p>Unit not found.</p>
    </div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-4">{{ unit.content }}</h1>
      <FormControlUnitOfMeaning :initial-unit="unit" @update="handleUpdate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import FormControlUnitOfMeaning from '@/components/forms/control/FormControlUnitOfMeaning.vue'
import { useRepoDexieUnitsOfMeaning } from '@/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning'
import { useRepoDexieLanguages } from '@/repositories/implementations/dexie/useRepoDexieLanguages'
import { unitOfMeaningRepositoryKey, languageRepositoryKey } from '@/types/injectionKeys'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

const route = useRoute()
const language = route.params.language as string
const content = route.params.content as string

provide(unitOfMeaningRepositoryKey, useRepoDexieUnitsOfMeaning())
provide(languageRepositoryKey, useRepoDexieLanguages())

const unit = ref<UnitOfMeaning | null>(null)
const loading = ref(true)

/**
 * Load the unit of meaning from the database
 */
async function loadUnit() {
  loading.value = true
  const repo = useRepoDexieUnitsOfMeaning()
  unit.value = await repo.findUnitOfMeaning(language, content)
  loading.value = false
}

/**
 * Handle the update of the unit of meaning
 */
function handleUpdate(updated: UnitOfMeaning) {
  unit.value = updated
}

onMounted(() => {
  loadUnit()
})
</script>
