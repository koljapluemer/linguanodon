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
              :key="task.uid"
              :value="task.uid"
            >
              {{ task.language }}: {{ task.content }}
            </option>
          </select>
        </div>
        
        <div class="card-actions justify-end flex flex-col md:flex-row gap-2 md:gap-4">
          <button 
            @click="() => generateExercises('primary')"
            class="btn btn-primary"
            :disabled="!selectedTaskId || loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            Generate Exercises from Primary Units of Meaning
          </button>
          <button 
            @click="() => generateExercises('secondary')"
            class="btn btn-secondary"
            :disabled="!selectedTaskId || loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            Generate Exercises from Secondary Units of Meaning
          </button>
          <button 
            @click="() => generateExercises('all')"
            class="btn btn-accent"
            :disabled="!selectedTaskId || loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            Generate Exercises from All Units of Meaning
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
        <span class="font-semibold">Secondary Units of Meaning:</span>
        <span v-if="selectedTask.secondaryUnitsOfMeaning.length === 0" class="opacity-60 ml-2">None</span>
        <span v-for="(unit, idx) in selectedTask.secondaryUnitsOfMeaning" :key="'unit-' + idx" class="badge badge-secondary mx-1">
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
            :key="exercise.uid"
            class="border rounded-lg p-4"
          >
            <h3 class="font-semibold mb-2">
              Exercise {{ index + 1 }} ({{ exercise.humanReadableName }})
            </h3>
            
            <AbstractExerciseWidgetControl :exercise="exercise" />
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
import type { Exercise } from '@/entities/Exercises'
import { generateExercisesForTask } from '@/utils/exercise/generateExercisesForTask'
import { useRepoDexieTasks } from '@/repositories/implementations/dexie/useRepoDexieTasks'
import { useRepoDexieUnitsOfMeaning } from '@/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning'
import { useRepoDexieLanguages } from '@/repositories/implementations/dexie/useRepoDexieLanguages'
import { taskRepositoryKey, unitOfMeaningRepositoryKey, languageRepositoryKey } from '@/types/injectionKeys'
import AbstractExerciseWidgetControl from '@/components/practice/exercise/AbstractExerciseWidgetControl.vue'

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
async function loadTasks(): Promise<void> {
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
async function generateExercises(mode: 'primary' | 'secondary' | 'all'): Promise<void> {
  if (!selectedTaskId.value) return
  loading.value = true
  error.value = ''
  exercises.value = []
  try {
    const task = await taskRepository.getTaskByUid(selectedTaskId.value)
    if (!task) {
      error.value = 'Selected task not found'
      return
    }
    // Get user languages
    const targetLanguages = await languageRepository.getUserTargetLanguages()
    const nativeLanguages = await languageRepository.getUserNativeLanguages()
    // Generate exercises using the utility, passing the mode
    const generatedExercises = await generateExercisesForTask(
      task,
      targetLanguages,
      nativeLanguages,
      unitRepository,
      mode,
      false // Do not limit number of exercises in debug
    )
    exercises.value = generatedExercises
  } catch (err) {
    error.value = 'Failed to generate exercises'
    console.error('Error generating exercises:', err)
  } finally {
    loading.value = false
  }
}


// Computed: currently selected task
const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  return tasks.value.find(t => t.uid === selectedTaskId.value) || null
})

onMounted(() => {
  loadTasks()
})
</script>
