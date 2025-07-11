<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Debug: Exercise Generation</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Unit of Meaning Editor -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Edit Unit of Meaning</h2>
          <FormControlUnitOfMeaning
            :initial-unit="currentUnit || undefined"
            @update="handleUnitUpdate"
          />
        </div>
      </div>

      <!-- Generated Exercises -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex justify-between items-center mb-4">
            <h2 class="card-title">Generated Exercises</h2>
            <button 
              @click="generateExercisesFromUnit"
              class="btn btn-primary btn-sm"
              :disabled="!canGenerateExercises"
            >
              Generate
            </button>
          </div>
          
          <div v-if="exercises.length === 0" class="text-center py-8">
            <div class="">
              <p>No exercises generated yet.</p>
              <p class="text-sm mt-2">Fill in the unit of meaning and click "Generate" to see exercises.</p>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <div class="text-sm  mb-4">
              Generated {{ exercises.length }} exercises
            </div>
            
            <div 
              v-for="(exercise, index) in exercises" 
              :key="exercise.uid"
              class="card bg-base-200"
            >
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-2">
                  <span class="badge badge-primary">Exercise {{ index + 1 }}</span>
                  <span class="text-xs ">{{ exercise.uid }}</span>
                </div>
                
                <!-- Front side -->
                <div class="mb-3">
                  <div class="text-sm font-medium  mb-1">Front:</div>
                  <div class="p-3 bg-base-100 rounded border" v-html="exercise.front"></div>
                </div>
                
                <!-- Back side -->
                <div>
                  <div class="text-sm font-medium  mb-1">Back:</div>
                  <div class="p-3 bg-base-100 rounded border" v-html="exercise.back"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import FormControlUnitOfMeaning from '@/components/forms/control/FormControlUnitOfMeaning.vue'
import { generateExercises } from '@/utils/generateExercises'
import { mockUnitOfMeaningRepo } from '@/repositories/mocks/useRepoMockUnitsOfMeaning'
import { mockLanguageRepository } from '@/repositories/mocks/useRepoMockLanguages'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import { mockExerciseRepository } from '@/repositories/mocks/useRepoMockExercises'
import { unitOfMeaningRepositoryKey, languageRepositoryKey, exerciseRepositoryKey } from '@/types/injectionKeys'

// Use the proper mock repositories
const exerciseRepository = mockExerciseRepository()
const unitRepository = mockUnitOfMeaningRepo()
const languageRepository = mockLanguageRepository()

// Provide repositories to child components
provide(unitOfMeaningRepositoryKey, unitRepository)
provide(languageRepositoryKey, languageRepository)
provide(exerciseRepositoryKey, exerciseRepository)

// Get the demo unit from the repository
const currentUnit = ref<UnitOfMeaning | null>(null)
const exercises = ref<ExerciseFlashcard[]>([])

/**
 * Initialize with demo data from repository
 */
async function initializeDemoData() {
  const demoUnit = await unitRepository.findUnitOfMeaning('en', 'Hello world')
  if (demoUnit) {
    currentUnit.value = demoUnit
  }
}

// Initialize on component mount
initializeDemoData()

/**
 * Check if we can generate exercises (unit has content and translations)
 */
const canGenerateExercises = computed(() => 
  currentUnit.value?.content?.trim() !== '' && 
  (currentUnit.value?.translations?.length ?? 0) > 0
)

/**
 * Handle unit updates from the form
 */
function handleUnitUpdate(unit: UnitOfMeaning) {
  currentUnit.value = unit
}

/**
 * Generate exercises from the current unit
 */
async function generateExercisesFromUnit() {
  if (!canGenerateExercises.value) return
  
  try {
    // Get all units from the repository
    const units = await unitRepository.getAllUnitsOfMeaning()
    
    exercises.value = await generateExercises(units, exerciseRepository)
  } catch (error) {
    console.error('Error generating exercises:', error)
    exercises.value = []
  }
}
</script>

<style scoped>
/* Ensure proper styling for mark tags in generated exercises */
:deep(mark) {
  background-color: yellow;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

/* Ensure proper text sizing for the main cloze sentence */
:deep(div[dir]) {
  font-size: 1.125rem; /* text-lg */
  margin-bottom: 0.5rem; /* mb-2 */
}

/* Ensure proper text sizing for the context sentence */
:deep(div[dir] + div[dir]) {
  font-size: 1rem; /* text-base */
}
</style>
