<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import type { Task } from './Task';
import type { TaskRepoContract } from './TaskRepoContract';
import type { TaskEvaluation } from '@/shared/ExerciseTypes';
import EvaluateTaskWidget from './EvaluateTaskWidget.vue';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';

interface Props {
  task: Task;
}

interface Emits {
  (e: 'taskFinished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const taskRepo = inject<TaskRepoContract>('taskRepo');
if (!taskRepo) {
  throw new Error('TaskRepo not provided');
}

type TaskFrameState = 'task' | 'evaluation';
const currentState = ref<TaskFrameState>('task');
const isDoneButtonEnabled = ref(false);

// Listen to task state events from slot content
const handleTaskMayNowBeConsideredDone = () => {
  isDoneButtonEnabled.value = true;
};

const handleTaskMayNowNotBeConsideredDone = () => {
  isDoneButtonEnabled.value = false;
};

const handleTaskDone = () => {
  // Task content has signaled it's complete
  // Check if we need to show evaluation screens
  if (props.task.evaluateCorrectnessAndConfidenceAfterDoing || 
      props.task.decideWhetherToDoAgainAfterDoing) {
    currentState.value = 'evaluation';
  } else {
    // Skip evaluation, task is finished
    emit('taskFinished');
  }
};

const handleSkipAndDeactivate = async () => {
  // Deactivate the task and finish
  const updatedTask = {
    ...props.task,
    isActive: false
  };
  
  try {
    await taskRepo.saveTask(updatedTask);
    emit('taskFinished');
  } catch (error) {
    console.error('Failed to deactivate task:', error);
    // Still emit finished even if save failed
    emit('taskFinished');
  }
};

const handleNotNow = () => {
  // Just skip without deactivating
  emit('taskFinished');
};

const handleEvaluationFinished = async (evaluation: TaskEvaluation) => {
  // Store evaluation results in TaskData
  const updatedTask = {
    ...props.task,
    lastShownAt: new Date(),
    lastDifficultyRating: evaluation.difficultyRating,
    lastCorrectnessRating: evaluation.correctnessRating,
    // Note: wantToDoAgain from evaluation could influence scheduling
  };
  
  try {
    await taskRepo.saveTask(updatedTask);
  } catch (error) {
    console.error('Failed to save task evaluation:', error);
  }
  
  emit('taskFinished');
};

// Determine what evaluation components to show
const showDifficultyRating = computed(() => props.task.evaluateCorrectnessAndConfidenceAfterDoing);
const showDoAgainDecision = computed(() => props.task.decideWhetherToDoAgainAfterDoing);
</script>

<template>
  <div>
    <div v-if="currentState === 'task'" class="space-y-6">
      <!-- Standardized Task Header -->
      <div class="space-y-4">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2">{{ task.title }}</h2>
          <div class="text-base-content/70">
            <MarkdownRenderer :content="task.prompt" />
          </div>
        </div>
      </div>

      <!-- Task Content Slot -->
      <div 
        class="task-content"
        @taskMayNowBeConsideredDone="handleTaskMayNowBeConsideredDone"
        @taskMayNowNotBeConsideredDone="handleTaskMayNowNotBeConsideredDone"
        @taskDone="handleTaskDone"
      >
        <slot />
      </div>

      <!-- Standardized Action Buttons -->
      <div class="flex justify-center gap-4">
        <button 
          class="btn btn-sm btn-error btn-outline" 
          @click="handleSkipAndDeactivate"
        >
          Skip and Deactivate
        </button>
        <button 
          class="btn btn-sm btn-ghost" 
          @click="handleNotNow"
        >
          Not now
        </button>
        <button 
          class="btn btn-primary" 
          :disabled="!isDoneButtonEnabled"
          @click="handleTaskDone"
        >
          Done
        </button>
      </div>
    </div>

    <!-- Evaluation Screen -->
    <div v-else-if="currentState === 'evaluation'" class="space-y-6">
      <!-- Show task name again during evaluation -->
      <div class="text-center">
        <h3 class="text-xl font-bold mb-2">{{ task.title }}</h3>
        <p class="text-base-content/70">Please provide feedback</p>
      </div>

      <EvaluateTaskWidget 
        :show-difficulty-rating="showDifficultyRating"
        :show-do-again-decision="showDoAgainDecision"
        @finished="handleEvaluationFinished"
      />
    </div>
  </div>
</template>