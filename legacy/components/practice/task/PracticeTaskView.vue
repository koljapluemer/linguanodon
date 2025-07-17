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
      <DoExerciseControl
        :key="currentExercise.uid"
        :exercise="currentExercise"
        @exercise-finished="() => { console.debug('[PracticeTaskView] exercise-finished event received'); $emit('exercise-finished') }"
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
import TaskExecuteControl from './TaskExecuteControl.vue'
import type { Task } from '@/entities/Task'
import type { Exercise } from '@/entities/Exercises'
import type { TaskAttempt } from '@/entities/Task'
import { Rating } from 'ts-fsrs'
import DoExerciseControl from '@/components/practice/exercise/DoExerciseControl.vue'

interface Props {
  task: Task
  exercises: Exercise[]
  currentExerciseIndex: number
  isTaskExecutionPhase: boolean
}

interface Emits {
  (e: 'exercise-score', exercise: Exercise, score: Rating): void
  (e: 'task-attempt', attempt: TaskAttempt): void
  (e: 'exercise-finished'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Get current exercise
 */
const currentExercise = computed(() => {
  const ex = props.exercises[props.currentExerciseIndex]
  console.debug('[PracticeTaskView] currentExerciseIndex:', props.currentExerciseIndex, 'currentExercise.uid:', ex?.uid)
  return ex
})

/**
 * Handle task attempt submission
 */
function handleTaskAttempt(attempt: TaskAttempt) {
  emit('task-attempt', attempt)
}
</script>
