<template>
  <!-- Retrievability and Due Date for Primary Card -->
  <div class="card bg-base-200 mt-8 p-4">
    <h2 class="text-lg font-semibold mb-2">Memory Stats</h2>
    <div>
      <div class="mb-6">
        <h3 class="font-semibold mb-1">Primary Card</h3>
        <div v-if="primaryRetrievability">
          <div class="flex flex-col md:flex-row gap-4">
            <div>
              <span class="font-medium">Due Date:</span>
              <span>{{ primaryDueDateString }}</span>
            </div>
            <div>
              <span class="font-medium">Retrievability:</span>
              <ul class="ml-2">
                <li>In 1 day: <span class="badge badge-outline">{{ primaryRetrievability.in1Day }}%</span></li>
                <li>In 1 week: <span class="badge badge-outline">{{ primaryRetrievability.in1Week }}%</span></li>
                <li>In 1 year: <span class="badge badge-outline">{{ primaryRetrievability.in1Year }}%</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div v-else class="text-base-content/60">No primary card data available.</div>
      </div>
      <div>
        <h3 class="font-semibold mb-1">Secondary Card</h3>
        <div v-if="secondaryRetrievability">
          <div class="flex flex-col md:flex-row gap-4">
            <div>
              <span class="font-medium">Due Date:</span>
              <span>{{ secondaryDueDateString }}</span>
            </div>
            <div>
              <span class="font-medium">Retrievability:</span>
              <ul class="ml-2">
                <li>In 1 day: <span class="badge badge-outline">{{ secondaryRetrievability.in1Day }}%</span></li>
                <li>In 1 week: <span class="badge badge-outline">{{ secondaryRetrievability.in1Week }}%</span></li>
                <li>In 1 year: <span class="badge badge-outline">{{ secondaryRetrievability.in1Year }}%</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div v-else class="text-base-content/60">No secondary card data available.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning';
import { getRetrievabilityAtKeyPoints } from '@/utils/fsrs/getRetrievabilityAtKeyPoints'
import { computed } from 'vue'

const props = defineProps<{
  unit: UnitOfMeaning
}>()

const primaryRetrievability = computed(() => {
  if (!props.unit.card) return null
  try {
    return getRetrievabilityAtKeyPoints(props.unit.card)
  } catch {
    return null
  }
})

const primaryDueDateString = computed(() => {
  const due = props.unit.card?.due
  if (!due) return 'N/A'
  try {
    const date = due instanceof Date ? due : new Date(due)
    return date.toLocaleString()
  } catch {
    return String(due)
  }
})

const secondaryRetrievability = computed(() => {
  if (!props.unit.secondaryCard) return null
  try {
    return getRetrievabilityAtKeyPoints(props.unit.secondaryCard)
  } catch {
    return null
  }
})

const secondaryDueDateString = computed(() => {
  const due = props.unit.secondaryCard?.due
  if (!due) return 'N/A'
  try {
    const date = due instanceof Date ? due : new Date(due)
    return date.toLocaleString()
  } catch {
    return String(due)
  }
})

</script>