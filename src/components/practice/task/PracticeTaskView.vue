<template>
  <div>
    <!-- Progress bar -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm">Progress</span>
        <span class="text-sm">
          {{ isTaskExecutionPhase ? 'Task Execution' : `${currentExerciseIndex + 1} / ${exercises.length}` }}
        </span>
      </div>
      <progress 
        class="progress progress-primary w-full" 
        :value="isTaskExecutionPhase ? exercises.length + 1 : currentExerciseIndex + 1" 
        :max="exercises.length + 1"
      ></progress>
    </div>
    
    <!-- Exercise phase -->
    <div v-if="!isTaskExecutionPhase && currentExercise">
      <ExerciseRenderer
        :exercise="currentExercise"
        @score="handleExerciseScore"
      />
    </div>
    
    <!-- Task execution phase -->
    <div v-else-if="isTaskExecutionPhase">
      <TaskExecuteControl
        :task="task"
        @task-attempt="handleTaskAttempt"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExerciseRenderer from '@/components/practice/exercise/ExerciseRenderer.vue'
import TaskExecuteControl from './TaskExecuteControl.vue'
import type { Task } from '@/entities/Task'
import type { Exercise } from '@/entities/Exercises'
import type { TaskAttempt } from '@/entities/Task'
import { Rating } from 'ts-fsrs'

interface Props {
  task: Task
  exercises: Exercise[]
  currentExerciseIndex: number
  isTaskExecutionPhase: boolean
}

interface Emits {
  (e: 'exercise-score', exercise: Exercise, score: Rating): void
  (e: 'task-attempt', attempt: TaskAttempt): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Get current exercise
 */
const currentExercise = computed(() => 
  props.exercises[props.currentExerciseIndex]
)

/**
 * Handle exercise scoring
 */
function handleExerciseScore(exercise: Exercise, score: Rating) {
  emit('exercise-score', exercise, score)
}

/**
 * Handle task attempt submission
 */
function handleTaskAttempt(attempt: TaskAttempt) {
  emit('task-attempt', attempt)
}
</script>
