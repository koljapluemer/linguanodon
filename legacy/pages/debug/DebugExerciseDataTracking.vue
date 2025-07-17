<template>
  <div class="container mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold mb-6">Debug: Exercise Data Tracking</h1>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">All Exercise Data</h2>
        <div v-if="loading" class="text-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-2">Loading exercise data...</p>
        </div>
        <div v-else-if="exerciseData.length === 0" class="text-center py-8 text-base-content/60">
          <p>No exercise data found.</p>
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>UID</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ex in exerciseData" :key="ex.uid">
                  <td class="font-mono">{{ ex.uid }}</td>
                  <td>{{ formatDue(ex.card.due) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRepoDexieExerciseData } from '@/repositories/implementations/dexie/useRepoDexieExerciseData'
import type { ExerciseData } from '@/entities/ExerciseData'

const exerciseRepo = useRepoDexieExerciseData()
const exerciseData = ref<ExerciseData[]>([])
const loading = ref(true)

/**
 * Formats a Date for display, or returns 'N/A' if not present.
 */
function formatDue(due: Date | null | undefined): string {
  if (!due) return 'N/A'
  return due instanceof Date ? due.toLocaleString() : String(due)
}


onMounted(async () => {
  loading.value = true
  exerciseData.value = await exerciseRepo.getAllExercises()
  loading.value = false
})
</script>
