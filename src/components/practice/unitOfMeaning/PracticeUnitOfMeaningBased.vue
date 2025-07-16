<template>
  <div class="container mx-auto p-4">
    <div v-if="error" class="text-center py-8">
      <div class="alert alert-error max-w-md mx-auto">
        <span>{{ error }}</span>
      </div>
    </div>
    <div v-else-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2">Loading due exercises...</p>
    </div>
    <div v-else-if="!exercises.length" class="text-center py-8">
      <div class="alert alert-warning max-w-md mx-auto">
        <span>No due exercises found.</span>
      </div>
    </div>
    <div v-else>
      <!-- Progress bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">Progress</span>
          <span class="text-sm">{{ currentExerciseIndex + 1 }} / {{ exercises.length }}</span>
        </div>
        <progress 
          class="progress progress-primary w-full" 
          :value="currentExerciseIndex + 1" 
          :max="exercises.length"
        ></progress>
      </div>
      <DoExerciseControl
        v-if="currentExercise"
        :key="currentExercise.uid"
        :exercise="currentExercise"
        @exercise-finished="handleExerciseFinished"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import DoExerciseControl from '@/components/practice/exercise/DoExerciseControl.vue'
import { getExercisesBasedOnDueUnitsOfMeaning } from '@/utils/unitOfMeaning/getExercisesBasedOnDueUnitsOfMeaning'
import { unitOfMeaningRepositoryKey, languageRepositoryKey } from '@/types/injectionKeys'
import type { Exercise } from '@/entities/Exercises'

const unitRepo = inject(unitOfMeaningRepositoryKey, null)
const languageRepo = inject(languageRepositoryKey, null)

if (!unitRepo) throw new Error('UnitOfMeaningRepository not provided')
if (!languageRepo) throw new Error('LanguageRepository not provided')

const typedUnitRepo = unitRepo as NonNullable<typeof unitRepo>
const typedLanguageRepo = languageRepo as NonNullable<typeof languageRepo>

const loading = ref(true)
const error = ref<string>('')
const exercises = ref<Exercise[]>([])
const currentExerciseIndex = ref(0)

const currentExercise = computed(() => exercises.value[currentExerciseIndex.value])

/**
 * Loads all exercises based on due units of meaning and user languages.
 */
async function loadExercises() {
  loading.value = true
  error.value = ''
  try {
    const targetLanguages = await typedLanguageRepo.getUserTargetLanguages()
    const nativeLanguages = await typedLanguageRepo.getUserNativeLanguages()
    exercises.value = await getExercisesBasedOnDueUnitsOfMeaning(typedUnitRepo, targetLanguages, nativeLanguages)
  } catch (err) {
    error.value = 'Failed to load due exercises.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * Advances to the next exercise or clears the list when done.
 */
function handleExerciseFinished() {
  if (currentExerciseIndex.value < exercises.value.length - 1) {
    currentExerciseIndex.value++
  } else {
    // All done
    exercises.value = []
  }
}

onMounted(() => {
  loadExercises()
})
</script>
