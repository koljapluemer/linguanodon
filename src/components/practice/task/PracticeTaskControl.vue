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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useUnitOfMeaningStore } from '@/stores/unitOfMeaningStore'
import { useToastsStore } from '@/components/ui/toasts/useToasts'
import { generateExercisesForTask } from '@/utils/generateExercises'
import PracticeTaskView from './PracticeTaskView.vue'
import type { ExerciseFlashcard } from '@/entities/ExerciseFlashcard'
import type { TaskAttempt } from '@/entities/Task'

interface Props {
  taskId: string
}

const props = defineProps<Props>()

const router = useRouter()
const taskStore = useTaskStore()
const unitStore = useUnitOfMeaningStore()
const toastsStore = useToastsStore()

const exercises = ref<ExerciseFlashcard[]>([])
const currentExerciseIndex = ref(0)
const isTaskExecutionPhase = ref(false)
const error = ref<string>('')

/**
 * Parse task ID to get language and content
 */
const taskInfo = computed(() => {
  const [language, content] = props.taskId.split(':')
  return { language, content }
})

/**
 * Get the task from store
 */
const task = computed(() => 
  taskStore.getTaskById(taskInfo.value.language, taskInfo.value.content)
)

/**
 * Initialize exercises for the task
 */
function initializeExercises() {
  if (!task.value) {
    error.value = 'Task not found'
    return
  }

  try {
    const generatedExercises = generateExercisesForTask(task.value, unitStore)
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
function handleTaskAttempt(attempt: TaskAttempt) {
  if (!task.value) return

  // Add attempt to task
  taskStore.addTaskAttempt(task.value.language, task.value.content, attempt)
  
  // Update last practiced timestamp
  taskStore.updateTaskLastPracticedAt(task.value.language, task.value.content)
  
  // Show success toast
  toastsStore.addToast({
    type: 'success',
    message: 'Practice session completed! Great job!'
  })
  
  // Navigate back to tasks
  goBack()
}

/**
 * Navigate back to tasks list
 */
function goBack() {
  router.push('/tasks')
}

onMounted(() => {
  initializeExercises()
})
</script>
