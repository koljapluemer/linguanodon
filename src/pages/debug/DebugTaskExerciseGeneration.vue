<template>
  <div class="container mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold">Debug Task Exercise Generation</h1>
    
    <!-- Task Selection -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Select Task</h2>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Task</span>
          </label>
          <select 
            v-model="selectedTaskId" 
            class="select select-bordered w-full"
            :disabled="loading"
          >
            <option value="">Select a task...</option>
            <option 
              v-for="task in tasks" 
              :key="`${task.language}:${task.content}`"
              :value="`${task.language}:${task.content}`"
            >
              {{ task.language }}: {{ task.content }}
            </option>
          </select>
        </div>
        
        <div class="card-actions justify-end">
          <button 
            @click="generateExercises"
            class="btn btn-primary"
            :disabled="!selectedTaskId || loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            Generate Exercises
          </button>
        </div>
      </div>
    </div>

    <!-- Task Details: Primary and Units of Meaning -->
    <div v-if="selectedTask" class="space-y-2">
      <div>
        <span class="font-semibold">Primary Units of Meaning:</span>
        <span v-if="selectedTask.primaryUnitsOfMeaning.length === 0" class="opacity-60 ml-2">None</span>
        <span v-for="(unit, idx) in selectedTask.primaryUnitsOfMeaning" :key="'primary-' + idx" class="badge badge-primary mx-1">
          {{ unit.content }}
        </span>
      </div>
      <div>
        <span class="font-semibold">Units of Meaning:</span>
        <span v-if="selectedTask.unitsOfMeaning.length === 0" class="opacity-60 ml-2">None</span>
        <span v-for="(unit, idx) in selectedTask.unitsOfMeaning" :key="'unit-' + idx" class="badge badge-secondary mx-1">
          {{ unit.content }}
        </span>
      </div>
    </div>
    
    <!-- Results -->
    <div v-if="exercises.length > 0" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Generated Exercises ({{ exercises.length }})</h2>
        
        <div class="space-y-4">
          <div 
            v-for="(exercise, index) in exercises" 
            :key="generateExerciseDataUidFromExercise(exercise)"
            class="border rounded-lg p-4"
          >
            <h3 class="font-semibold mb-2">
              Exercise {{ index + 1 }} ({{ generateExerciseDataUidFromExercise(exercise) }}) - {{ exercise.type }}
            </h3>
            
            <!-- Exercise direction info -->
            <div class="text-sm opacity-70 mb-3">
              <span v-if="generateExerciseDataUidFromExercise(exercise).includes('cloze_') || generateExerciseDataUidFromExercise(exercise).includes('choose_')">
                {{ getExerciseDirection(generateExerciseDataUidFromExercise(exercise)) }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-medium text-sm opacity-70">Front</h4>
                <div class="bg-base-200 p-3 rounded" v-html="exercise.front"></div>
              </div>
              
              <!-- Flashcard exercise -->
              <div v-if="exercise.type === 'flashcard'">
                <h4 class="font-medium text-sm opacity-70">Back</h4>
                <div class="bg-base-200 p-3 rounded" v-html="exercise.back"></div>
              </div>
              
              <!-- Choose from two exercise -->
              <div v-else-if="exercise.type === 'choose-from-two'">
                <h4 class="font-medium text-sm opacity-70">Options</h4>
                <div class="bg-base-200 p-3 rounded space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="font-mono">A.</span>
                    <span class="text-success font-medium">{{ exercise.correctAnswer }}</span>
                    <span class="text-xs opacity-70">(correct)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono">B.</span>
                    <span class="text-error">{{ exercise.incorrectAnswer }}</span>
                    <span class="text-xs opacity-70">(incorrect)</span>
                  </div>
                  <div v-if="exercise.context" class="mt-3 pt-3 border-t">
                    <span class="text-sm opacity-70">Context:</span>
                    <div class="mt-1">{{ exercise.context }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Free-translation exercise -->
              <div v-else-if="exercise.type === 'free-translation'">
                <h4 class="font-medium text-sm opacity-70">Reference Translation</h4>
                <div class="bg-base-200 p-3 rounded" v-html="exercise.back"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Display -->
    <div v-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue'
import type { Task } from '@/entities/Task'
import type { Exercise } from '@/utils/exercise/types/exerciseTypes'
import { generateExercisesForTask } from '@/utils/exercise/generateExercisesForTask'
import { generateExerciseDataUidFromExercise } from '@/utils/exercise/generateExerciseDataUidFromExercise'
import { useRepoDexieTasks } from '@/repositories/implementations/dexie/useRepoDexieTasks'
import { useRepoDexieUnitsOfMeaning } from '@/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning'
import { useRepoDexieLanguages } from '@/repositories/implementations/dexie/useRepoDexieLanguages'
import { taskRepositoryKey, unitOfMeaningRepositoryKey, languageRepositoryKey } from '@/types/injectionKeys'

// Provide repositories to child components
provide(taskRepositoryKey, useRepoDexieTasks())
provide(unitOfMeaningRepositoryKey, useRepoDexieUnitsOfMeaning())
provide(languageRepositoryKey, useRepoDexieLanguages())

// Get repository instances for this component
const taskRepository = useRepoDexieTasks()
const unitRepository = useRepoDexieUnitsOfMeaning()
const languageRepository = useRepoDexieLanguages()

// Reactive state
const tasks = ref<Task[]>([])
const selectedTaskId = ref('')
const exercises = ref<Exercise[]>([])
const loading = ref(false)
const error = ref('')

/**
 * Load all tasks from the repository
 */
async function loadTasks() {
  try {
    tasks.value = await taskRepository.getAllTasks()
  } catch (err) {
    error.value = 'Failed to load tasks'
    console.error('Error loading tasks:', err)
  }
}

/**
 * Generate exercises for the selected task
 */
async function generateExercises() {
  if (!selectedTaskId.value) return
  
  loading.value = true
  error.value = ''
  exercises.value = []
  
  try {
    // Parse task ID
    const [language, content] = selectedTaskId.value.split(':')
    const task = await taskRepository.findTask(language, content)
    
    if (!task) {
      error.value = 'Selected task not found'
      return
    }
    
    // Get user languages
    const targetLanguages = await languageRepository.getUserTargetLanguages()
    const nativeLanguages = await languageRepository.getUserNativeLanguages()
    
    // Generate exercises
    const generatedExercises = await generateExercisesForTask(
      task,
      targetLanguages,
      nativeLanguages,
      unitRepository
    )
    
    exercises.value = generatedExercises
  } catch (err) {
    error.value = 'Failed to generate exercises'
    console.error('Error generating exercises:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Helper to get exercise direction from UID
 */
function getExerciseDirection(uid: string): string {
  // Parse the UID to determine direction
  // Format: type_language_content_wordIdx_targetLanguage
  const parts = uid.split('_')
  if (parts.length >= 5) {
    const sourceLanguage = parts[1]
    const targetLanguage = parts[parts.length - 1]
    return `Clozing ${sourceLanguage} → Hint: ${targetLanguage}`
  }
  return 'Unknown direction'
}

// Computed: currently selected task
const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  const [language, content] = selectedTaskId.value.split(':')
  return tasks.value.find(t => t.language === language && t.content === content) || null
})

onMounted(() => {
  loadTasks()
})
</script>
