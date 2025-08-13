<script setup lang="ts">
import { ref, computed } from "vue";
import type { Task } from '@/entities/tasks/Task';
import { useTaskState } from '@/entities/tasks/useTaskState';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import TaskDecideWhetherToDoAgain from '@/entities/tasks/TaskDecideWhetherToDoAgain.vue';
import TaskEvaluateCorrectnessAndConfidence from '@/entities/tasks/TaskEvaluateCorrectnessAndConfidence.vue';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import ElementRevealButton from '@/shared/ui/ElementRevealButton.vue';
import RatingButtons from '@/shared/ui/RatingButtons.vue';

interface Props {
  task: Task;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isRevealed = ref(false);

// Use the task state composable
const {
  currentState,
  enableDone,
  handleDone,
  handleEvaluation,
  handleDoAgainDecision
} = useTaskState(() => props.task, emit);

// Extract task metadata - these will be properly set during task generation
const isReverse = computed(() => {
  return props.task.title.includes('reverse') || props.task.prompt.includes('vocab');
});

const frontContent = computed(() => {
  // This will be properly extracted from task metadata during task generation
  if (isReverse.value) {
    // Show translation, ask for vocab
    return props.task.prompt.split(': ')[1] || props.task.title;
  } else {
    // Show vocab, ask for translation
    return props.task.title;
  }
});

const solution = computed(() => {
  // This will be properly stored in task metadata during task generation
  return props.task.prompt.split('Solution: ')[1] || props.task.title;
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
          <!-- Front Content (vocab or translation) -->
          <div class="mb-4 text-center">
            <ElementBigText :is-extra-big="true">
              {{ frontContent }}
            </ElementBigText>
          </div>

          <!-- Solution (when revealed) -->
          <div v-if="isRevealed">
            <!-- Divider -->
            <div class="border-t-2 border-dotted border-base-300 my-4"></div>

            <!-- Solution -->
            <div class="mb-6 text-center">
              <ElementBigText :is-extra-big="false">
                {{ solution }}
              </ElementBigText>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-2 w-full">
        <!-- Reveal Button -->
        <ElementRevealButton v-if="!isRevealed" @click="isRevealed = true" />

        <!-- Rating (when revealed) -->
        <RatingButtons 
          v-if="isRevealed" 
          prompt="How difficult was this?" 
          @rate="handleRate" 
        />
      </div>
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