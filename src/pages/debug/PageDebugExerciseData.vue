<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Debug: Exercise Learning Data</h1>
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>UID</th>
          <th>Due</th>
          <th>Stability</th>
          <th>Difficulty</th>
          <th>Elapsed Days</th>
          <th>Scheduled Days</th>
          <th>Learning Steps</th>
          <th>Reps</th>
          <th>Lapses</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="exercise in exercises" :key="exercise.uid">
          <td>{{ exercise.uid }}</td>
          <td>{{ exercise.card.due }}</td>
          <td>{{ exercise.card.stability }}</td>
          <td>{{ exercise.card.difficulty }}</td>
          <td>{{ exercise.card.elapsed_days }}</td>
          <td>{{ exercise.card.scheduled_days }}</td>
          <td>{{ exercise.card.learning_steps }}</td>
          <td>{{ exercise.card.reps }}</td>
          <td>{{ exercise.card.lapses }}</td>
          <td>{{ exercise.card.state }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import { piniaExerciseRepository } from '@/repositories/pinia/useRepoPiniaExercises'
import { exerciseRepositoryKey } from '@/types/injectionKeys'

// Provide the exercise repository to child components
provide(exerciseRepositoryKey, piniaExerciseRepository)

const exercises = ref<ExerciseFlashcard[]>([])

/**
 * Loads all exercises from the repository for debug display
 */
async function loadExercises() {
  // Convert Exercise[] to ExerciseFlashcard[] by adding front/back properties
  const exerciseData = await piniaExerciseRepository.getAllExercises()
  exercises.value = exerciseData.map(exercise => ({
    ...exercise,
    front: `Exercise ${exercise.uid}`,
    back: `Answer for ${exercise.uid}`
  }))
}

onMounted(() => {
  loadExercises()
})
</script>
