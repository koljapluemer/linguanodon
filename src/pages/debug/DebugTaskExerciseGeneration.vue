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
    
    <!-- Results -->
    <div v-if="exercises.length > 0" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Generated Exercises ({{ exercises.length }})</h2>
        
        <div class="space-y-4">
          <div 
            v-for="(exercise, index) in exercises" 
            :key="exercise.uid"
            class="border rounded-lg p-4"
          >
            <h3 class="font-semibold mb-2">Exercise {{ index + 1 }} ({{ exercise.uid }})</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-medium text-sm opacity-70">Front</h4>
                <div class="bg-base-200 p-3 rounded" v-html="exercise.front"></div>
              </div>
              
              <div>
                <h4 class="font-medium text-sm opacity-70">Back</h4>
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
import { ref, onMounted, provide } from 'vue'
import type { Task } from '@/entities/Task'
import type { ExerciseFlashcard } from '@/utils/exercise/types/ExerciseFlashcard'
import { generateExercisesForTask } from '@/utils/exercise/generateExercisesForTask'
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
const exercises = ref<ExerciseFlashcard[]>([])
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

onMounted(() => {
  loadTasks()
})
</script>
