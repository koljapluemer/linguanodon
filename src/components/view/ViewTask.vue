<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { Card } from 'ts-fsrs'
import type { Task } from '@/entities/Task'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import { getRetrievabilityInMinutes } from '@/utils/fsrs/getRetrievabilityAtKeyPoints'
import { unitOfMeaningRepositoryKey } from '@/types/injectionKeys'

const props = defineProps<{
  task: Task
}>()

const loading = ref(true)
const error = ref('')
const primaryUnits = ref<UnitOfMeaning[]>([])
const secondaryUnits = ref<UnitOfMeaning[]>([])

const unitRepo = inject<UnitOfMeaningRepository>(unitOfMeaningRepositoryKey)

/**
 * Returns the retrievability in 10 minutes for a given card.
 */
function retrievability(card: Card | undefined) {
  if (!card) return null
  return getRetrievabilityInMinutes(card, 10)
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    if (!unitRepo) throw new Error('UnitOfMeaningRepository not provided')
    primaryUnits.value = await unitRepo.getAllUnitsOfMeaningByIdentificationList(props.task.primaryUnitsOfMeaning)
    secondaryUnits.value = await unitRepo.getAllUnitsOfMeaningByIdentificationList(props.task.secondaryUnitsOfMeaning)
  } catch (e) {
    error.value = (e instanceof Error ? e.message : 'Failed to load units')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center min-h-[200px]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else-if="error" class="alert alert-error max-w-md mx-auto my-8">
      <span>{{ error }}</span>
    </div>
    <template v-else>
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2">Task: <span class="font-mono">{{ props.task.language }}</span> / <span class="font-mono">{{ props.task.content }}</span></h1>
      </div>
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-2">Primary Units of Meaning</h2>
        <ul class="space-y-2">
          <li v-for="unit in primaryUnits" :key="unit.language + unit.content" class="p-3 rounded bg-base-100 flex flex-col md:flex-row md:items-center md:gap-4">
            <span class="font-mono">{{ unit.language }} / {{ unit.content }}</span>
            <span class="ml-2">
              <span class="badge badge-primary mr-1">
                Card: <span>{{ retrievability(unit.card) }}%</span>
              </span>
              <span class="badge badge-secondary">
                Secondary: <span>{{ retrievability(unit.secondaryCard) }}%</span>
              </span>
            </span>
          </li>
        </ul>
      </div>
      <div>
        <h2 class="text-lg font-semibold mb-2">Secondary Units of Meaning</h2>
        <ul class="space-y-2">
          <li v-for="unit in secondaryUnits" :key="unit.language + unit.content" class="p-3 rounded bg-base-100 flex flex-col md:flex-row md:items-center md:gap-4">
            <span class="font-mono">{{ unit.language }} / {{ unit.content }}</span>
            <span class="ml-2">
              <span class="badge badge-primary mr-1">
                Card: <span>{{ retrievability(unit.card) }}%</span>
              </span>
              <span class="badge badge-secondary">
                Secondary: <span>{{ retrievability(unit.secondaryCard) }}%</span>
              </span>
            </span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
