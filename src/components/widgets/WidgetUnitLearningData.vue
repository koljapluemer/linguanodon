<template>
  <!-- Retrievability and Due Date -->
  <div class="card bg-base-200 mt-8 p-4">
    <h2 class="text-lg font-semibold mb-2">Memory Stats</h2>
    <div v-if="retrievability">
      <div class="flex flex-col md:flex-row gap-4">
        <div>
          <span class="font-medium">Due Date:</span>
          <span>{{ dueDateString }}</span>
        </div>
        <div>
          <span class="font-medium">Retrievability:</span>
          <ul class="ml-2">
            <li>In 1 day: <span class="badge badge-outline">{{ retrievability.in1Day }}%</span></li>
            <li>In 1 week: <span class="badge badge-outline">{{ retrievability.in1Week }}%</span></li>
            <li>In 1 year: <span class="badge badge-outline">{{ retrievability.in1Year }}%</span></li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="text-base-content/60">No card data available.</div>
  </div>
</template>


<script setup lang="ts">
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning';
import { getRetrievabilityAtKeyPoints } from '@/utils/fsrs/getRetrievabilityAtKeyPoints'
import { computed } from 'vue'

const props = defineProps<{
  unit: UnitOfMeaning
}>()

const retrievability = computed(() => {
  if (!props.unit.card) return null
  try {
    return getRetrievabilityAtKeyPoints(props.unit.card)
  } catch {
    return null
  }
})

const dueDateString = computed(() => {
  const due = props.unit.card?.due
  if (!due) return 'N/A'
  try {
    const date = due instanceof Date ? due : new Date(due)
    return date.toLocaleString()
  } catch {
    return String(due)
  }
})

</script>