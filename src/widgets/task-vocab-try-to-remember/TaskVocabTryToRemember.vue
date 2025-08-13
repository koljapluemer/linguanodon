<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import { useTaskState } from '@/entities/tasks/useTaskState';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import TaskDecideWhetherToDoAgain from '@/entities/tasks/TaskDecideWhetherToDoAgain.vue';
import TaskEvaluateCorrectnessAndConfidence from '@/entities/tasks/TaskEvaluateCorrectnessAndConfidence.vue';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import RatingButtons from '@/shared/ui/RatingButtons.vue';

interface Props {
  task: Task;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Use the task state composable
const {
  currentState,
  enableDone,
  handleDone,
  handleEvaluation,
  handleDoAgainDecision
} = useTaskState(() => props.task, emit);

// Extracted vocab and translation data from task
const vocabContent = computed(() => {
  // Extract from task metadata or associatedUnits
  return props.task.title; // Assuming title contains the vocab content
});

const translations = computed(() => {
  // Extract from task metadata - this would be set when task is created
  return props.task.prompt.split(': ')[1] || ''; // Simple extraction, will be improved in task generation
});

const handleRate = () => {
  // Auto-enable done after rating
  enableDone();
  // Proceed to task completion flow
  handleDone();
};
</script>

<template>
  <div class="space-y-6">
    <!-- Task Screen -->
    <div v-if="currentState === 'task'">
      <!-- Task Header -->
      <TaskInfo :task="task" />
      
      <!-- Exercise Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Vocab Content -->
          <div class="mb-4 text-center">
            <ElementBigText :is-extra-big="true">
              {{ vocabContent }}
            </ElementBigText>
          </div>

          <!-- Divider -->
          <div class="border-t-2 border-dotted border-base-300 my-4"></div>

          <!-- Solution -->
          <div class="mb-6 text-center">
            <ElementBigText :is-extra-big="true">
              {{ translations }}
            </ElementBigText>
          </div>
        </div>
      </div>

      <!-- Rating -->
      <RatingButtons 
        prompt="How hard is this word to remember?" 
        @rate="handleRate" 
      />
    </div>
    
    <!-- Evaluation Screen -->
    <div v-else-if="currentState === 'evaluation'">
      <TaskEvaluateCorrectnessAndConfidence @evaluation="handleEvaluation" />
    </div>
    
    <!-- Do Again Decision Screen -->
    <div v-else-if="currentState === 'do-again-decision'">
      <TaskDecideWhetherToDoAgain @decision="handleDoAgainDecision" />
    </div>
  </div>
</template>