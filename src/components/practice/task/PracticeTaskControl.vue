<template>
  <div v-if="error" class="text-center py-8">
    <div class="alert alert-error max-w-md mx-auto">
      <span>{{ error }}</span>
    </div>
    <button @click="goBack" class="btn btn-primary mt-4">
      Back to Tasks
    </button>
  </div>
  
  <div v-else-if="!task" class="text-center py-8">
    <div class="alert alert-warning max-w-md mx-auto">
      <span>Task not found.</span>
    </div>
    <button @click="goBack" class="btn btn-primary mt-4">
      Back to Tasks
    </button>
  </div>
  
  <div v-else-if="!exercises.length && !isTaskExecutionPhase" class="text-center py-8">
    <div class="alert alert-warning max-w-md mx-auto">
      <span>No exercises available for this task.</span>
    </div>
    <button @click="goBack" class="btn btn-primary mt-4">
      Back to Tasks
    </button>
  </div>
  
  <div v-else>
    <PracticeTaskView
      :task="task"
      :exercises="exercises"
      :current-exercise-index="currentExerciseIndex"
      :is-task-execution-phase="isTaskExecutionPhase"
      @exercise-score="handleExerciseScore"
      @task-attempt="handleTaskAttempt"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useToastsStore } from '@/components/ui/toasts/useToasts'
import PracticeTaskView from './PracticeTaskView.vue'
import type { ExerciseFlashcard } from '@/utils/exercise/types/ExerciseFlashcard'
import type { TaskAttempt } from '@/entities/Task'
import type { Task } from '@/entities/Task'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'
import { taskRepositoryKey, unitOfMeaningRepositoryKey, exerciseRepositoryKey } from '@/types/injectionKeys'

interface Props {
  taskId: string
}

const props = defineProps<Props>()

const router = useRouter()
const toastsStore = useToastsStore()

// Inject repositories
const taskRepository = inject<TaskRepository>(taskRepositoryKey)
const unitRepository = inject<UnitOfMeaningRepository>(unitOfMeaningRepositoryKey)
const exerciseRepository = inject<ExerciseDataRepository>(exerciseRepositoryKey)

const exercises = ref<ExerciseFlashcard[]>([])
const currentExerciseIndex = ref(0)
const isTaskExecutionPhase = ref(false)
const error = ref<string>('')
const task = ref<Task | null>(null)

/**
 * Parse task ID to get language and content
 */
const taskInfo = computed(() => {
  const [language, content] = props.taskId.split(':')
  return { language, content }
})

/**
 * Load the task from repository
 */
async function loadTask() {
  if (!taskRepository) {
    error.value = 'Task repository not provided'
    return
  }
  
  try {
    const foundTask = await taskRepository.findTask(taskInfo.value.language, taskInfo.value.content)
    if (!foundTask) {
      error.value = 'Task not found'
      return
    }
    task.value = foundTask
  } catch (err) {
    error.value = 'Failed to load task'
    console.error('Error loading task:', err)
  }
}

/**
 * Initialize exercises for the task
 */
async function initializeExercises() {
  if (!task.value || !unitRepository || !exerciseRepository) {
    error.value = 'Required repositories not provided'
    return
  }

  try {
    const generatedExercises: ExerciseFlashcard[] = []
    exercises.value = generatedExercises
  } catch (err) {
    error.value = 'Failed to generate exercises'
    console.error('Exercise generation error:', err)
  }
}

/**
 * Handle exercise scoring and progression
 */
function handleExerciseScore() {
  // Store exercise rating (this will be handled by the exercise store)
  // The exercise store is already set up to handle this via the ExerciseFlashcardControl
    
  // Move to next exercise or complete exercise phase
  if (currentExerciseIndex.value < exercises.value.length - 1) {
    currentExerciseIndex.value++
  } else {
    // Exercise phase completed, move to task execution phase
    isTaskExecutionPhase.value = true
  }
}

/**
 * Handle task attempt submission
 */
async function handleTaskAttempt(attempt: TaskAttempt) {
  if (!task.value || !taskRepository) return

  try {
    // Add attempt to task
    await taskRepository.addTaskAttempt(task.value.language, task.value.content, attempt)
    
    // Update last practiced timestamp
    await taskRepository.updateTaskLastPracticedAt(task.value.language, task.value.content)
    
    // Show success toast
    toastsStore.addToast({
      type: 'success',
      message: 'Practice session completed! Great job!'
    })
    
    // Navigate back to tasks
    goBack()
  } catch (error) {
    console.error('Error saving task attempt:', error)
    toastsStore.addToast({
      type: 'error',
      message: 'Failed to save practice session'
    })
  }
}

/**
 * Navigate back to tasks list
 */
function goBack() {
  router.push('/tasks')
}

onMounted(async () => {
  await loadTask()
  if (task.value) {
    await initializeExercises()
  }
})
</script>
