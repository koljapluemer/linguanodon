<template>
  <div class="container mx-auto p-4">
    <div v-if="error" class="text-center py-8">
      <div class="alert alert-error max-w-md mx-auto">
        <span>{{ error }}</span>
      </div>
    </div>
    <div v-else-if="initialLoading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2">Loading due exercises...</p>
    </div>
    <div v-else-if="allDone" class="text-center py-8">
      <div class="alert alert-success max-w-md mx-auto">
        <span>All due exercises completed!</span>
      </div>
    </div>
    <div v-else>
      <!-- Progress bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">Progress</span>
          <span class="text-sm">{{ currentExerciseIndex + 1 }} / {{ totalExercises }}</span>
        </div>
        <progress 
          class="progress progress-primary w-full" 
          :value="currentExerciseIndex + 1" 
          :max="totalExercises"
        ></progress>
      </div>
      <DoExerciseControl
        v-if="currentExercise"
        :key="currentExercise.uid"
        :exercise="currentExercise"
        @exercise-finished="handleExerciseFinished"
      />
      <div v-if="backgroundLoading" class="flex justify-center mt-4">
        <span class="loading loading-dots loading-md"></span>
        <span class="ml-2 text-sm opacity-70">Loading more exercises...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import DoExerciseControl from '@/components/practice/exercise/DoExerciseControl.vue'
import { getDueUnitsOfMeaning } from '@/utils/unitOfMeaning/getDueUnitsOfMeaning'
import { getExercisesForDueUnitsBatch } from '@/utils/unitOfMeaning/getExercisesBasedOnDueUnitsOfMeaning'
import { unitOfMeaningRepositoryKey, languageRepositoryKey } from '@/types/injectionKeys'
import type { Exercise } from '@/entities/Exercises'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

const QUEUE_THRESHOLD = 3

const unitRepo = inject(unitOfMeaningRepositoryKey, null)
const languageRepo = inject(languageRepositoryKey, null)

if (!unitRepo) throw new Error('UnitOfMeaningRepository not provided')
if (!languageRepo) throw new Error('LanguageRepository not provided')

const typedUnitRepo = unitRepo as NonNullable<typeof unitRepo>
const typedLanguageRepo = languageRepo as NonNullable<typeof languageRepo>

const initialLoading = ref(true)
const backgroundLoading = ref(false)
const error = ref<string>('')
const exerciseQueue = ref<Exercise[]>([])
const currentExerciseIndex = ref(0)
const totalExercises = ref(0)
const allDone = ref(false)

let dueUnits: UnitOfMeaning[] = []
let nextDueUnitIndex = 0
let targetLanguages: Awaited<ReturnType<typeof typedLanguageRepo.getUserTargetLanguages>> = []
let nativeLanguages: Awaited<ReturnType<typeof typedLanguageRepo.getUserNativeLanguages>> = []

const currentExercise = computed(() => exerciseQueue.value[currentExerciseIndex.value] ?? null)

/**
 * Fisher-Yates shuffle for an array (in-place)
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Loads the next batch of exercises for due units and appends to the queue.
 * Ensures at least 1 exercise and at least 5 units (with exercises) per batch, if possible.
 * Shuffles the exercises within the batch.
 */
async function loadNextBatch() {
  if (backgroundLoading.value) return
  backgroundLoading.value = true
  try {
    let batchExercises: Exercise[] = []
    let unitsWithExercises = 0
    let unitsProcessed = 0
    let skippedUnits: UnitOfMeaning[] = []
    while (
      (batchExercises.length < 1 || unitsWithExercises < 5) &&
      nextDueUnitIndex < dueUnits.length
    ) {
      const unit = dueUnits[nextDueUnitIndex]
      nextDueUnitIndex++
      unitsProcessed++
      const unitExercises = await getExercisesForDueUnitsBatch([unit], targetLanguages, nativeLanguages, typedUnitRepo)
      if (unitExercises.length > 0) {
        batchExercises.push(...unitExercises)
        unitsWithExercises++
      } else {
        skippedUnits.push(unit)
        console.debug('[Batching] Skipped unit (no exercises):', { lang: unit.language, content: unit.content, due: unit.card?.due, priority: unit.priority })
      }
      // Always process at least one unit per batch, but try for 5 units with exercises
      if (unitsProcessed >= 1 && batchExercises.length >= 1 && unitsWithExercises >= 5) break
    }
    // Shuffle the batch for variety
    shuffleArray(batchExercises)
    // Limit batch to max 20 exercises
    if (batchExercises.length > 7) {
      batchExercises = batchExercises.slice(0, 7)
      console.debug('[Batching] batchExercises truncated to 7:', batchExercises.length)
    }
    console.debug('[Batching] batchExercises generated (shuffled):', batchExercises.length, batchExercises.map(e => e.uid))
    if (skippedUnits.length > 0) {
      console.debug('[Batching] Skipped units in this batch:', skippedUnits.map(u => ({ lang: u.language, content: u.content })))
    }
    if (batchExercises.length > 0) {
      exerciseQueue.value.push(...batchExercises)
      totalExercises.value += batchExercises.length
    }
    console.debug('[Batching] exerciseQueue after push:', exerciseQueue.value.length)
    console.debug('[Batching] nextDueUnitIndex:', nextDueUnitIndex)
  } catch (err) {
    error.value = 'Failed to load more exercises.'
    console.error('[Batching] Error in loadNextBatch:', err)
  } finally {
    backgroundLoading.value = false
  }
}

/**
 * Loads initial due units and the first batch of exercises.
 */
async function loadInitial() {
  initialLoading.value = true
  error.value = ''
  allDone.value = false
  try {
    targetLanguages = await typedLanguageRepo.getUserTargetLanguages()
    nativeLanguages = await typedLanguageRepo.getUserNativeLanguages()
    dueUnits = await getDueUnitsOfMeaning(typedUnitRepo)
    console.debug('[Batching] dueUnits loaded:', dueUnits.length, dueUnits.map(u => ({ lang: u.language, content: u.content, due: u.card?.due, priority: u.priority })))
    nextDueUnitIndex = 0
    exerciseQueue.value = []
    totalExercises.value = 0
    currentExerciseIndex.value = 0
    await loadNextBatch()
    if (exerciseQueue.value.length === 0) {
      allDone.value = true
      console.debug('[Batching] allDone set to true after initial load')
    }
  } catch (err) {
    error.value = 'Failed to load due exercises.'
    console.error('[Batching] Error in loadInitial:', err)
  } finally {
    initialLoading.value = false
  }
}

/**
 * Advances to the next exercise, and triggers background loading if needed.
 */
function handleExerciseFinished() {
  currentExerciseIndex.value++
  console.debug('[Batching] handleExerciseFinished: currentExerciseIndex', currentExerciseIndex.value, 'queueLen', exerciseQueue.value.length, 'nextDueUnitIndex', nextDueUnitIndex)
  // If we've finished all loaded exercises and no more due units, mark as done
  if (currentExerciseIndex.value >= exerciseQueue.value.length && nextDueUnitIndex >= dueUnits.length) {
    allDone.value = true
    console.debug('[Batching] allDone set to true after finishing all exercises')
  }
  // If queue is running low, load next batch in background
  if (
    exerciseQueue.value.length - currentExerciseIndex.value < QUEUE_THRESHOLD &&
    nextDueUnitIndex < dueUnits.length &&
    !backgroundLoading.value
  ) {
    console.debug('[Batching] Queue running low, loading next batch...')
    loadNextBatch()
  }
}

onMounted(() => {
  loadInitial()
})
</script>
