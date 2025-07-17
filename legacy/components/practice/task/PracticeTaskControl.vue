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
      @exercise-finished="handleExerciseFinished"
      @task-attempt="handleTaskAttempt"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useToastsStore } from '@/components/ui/toasts/useToasts'
import PracticeTaskView from './PracticeTaskView.vue'
import type { Exercise } from '@/entities/Exercises'
import type { TaskAttempt } from '@/entities/Task'
import type { Task } from '@/entities/Task'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { ExerciseDataRepository } from '@/repositories/interfaces/ExerciseDataRepository'
import { taskRepositoryKey, unitOfMeaningRepositoryKey, exerciseRepositoryKey, languageRepositoryKey } from '@/types/injectionKeys'
import { generateExercisesForTask } from '@/utils/exercise/generateExercisesForTask'

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
const languageRepository = inject(languageRepositoryKey, null)

const exercises = ref<Exercise[]>([])
const currentExerciseIndex = ref(0)
const isTaskExecutionPhase = ref(false)
const error = ref<string>('')
const task = ref<Task | null>(null)

/**
 * Load the task from repository by uid
 */
async function loadTask() {
  if (!taskRepository) {
    error.value = 'Task repository not provided'
    return
  }
  try {
    console.log('PracticeTaskControl: Looking up task by uid:', props.taskId)
    const foundTask = await taskRepository.getTaskByUid(props.taskId)
    console.log('PracticeTaskControl: Result of getTaskByUid:', foundTask)
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
  if (!task.value || !unitRepository || !exerciseRepository || !languageRepository) {
    error.value = 'Required repositories not provided'
    return
  }

  try {
    // Fetch user languages
    const targetLanguages = await languageRepository.getUserTargetLanguages()
    const nativeLanguages = await languageRepository.getUserNativeLanguages()
    // Generate exercises using the utility
    const generatedExercises = await generateExercisesForTask(
      task.value,
      targetLanguages,
      nativeLanguages,
      unitRepository,
      'all',
      true // limitNumberOfExercises: set to false for testing
    )
    exercises.value = generatedExercises
  } catch (err) {
    error.value = 'Failed to generate exercises'
    console.error('Exercise generation error:', err)
  }
}

/**
 * Handle exercise finished event: advance to next exercise or phase
 */
function handleExerciseFinished() {
  console.debug('[PracticeTaskControl] handleExerciseFinished called');
  console.debug('[PracticeTaskControl] currentExerciseIndex before:', currentExerciseIndex.value, 'exercises.length:', exercises.value.length);
  if (currentExerciseIndex.value < exercises.value.length - 1) {
    currentExerciseIndex.value++;
    console.debug('[PracticeTaskControl] currentExerciseIndex incremented to:', currentExerciseIndex.value);
  } else {
    isTaskExecutionPhase.value = true;
    console.debug('[PracticeTaskControl] All exercises done, switching to task execution phase');
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
