<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import { useTaskState } from '@/entities/tasks/useTaskState';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import TaskButtonsDisableSkipDone from '@/entities/tasks/TaskButtonsDisableSkipDone.vue';
import TaskDecideWhetherToDoAgain from '@/entities/tasks/TaskDecideWhetherToDoAgain.vue';
import TaskEvaluateCorrectnessAndConfidence from '@/entities/tasks/TaskEvaluateCorrectnessAndConfidence.vue';
import ManageVocabOfResourceWidget from '@/features/resource-manage-its-vocab/ManageVocabOfResourceWidget.vue';

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
  isDoneEnabled,
  enableDone,
  disableDone,
  handleDone,
  handleSkipAndDeactivate,
  handleNotNow,
  handleEvaluation,
  handleDoAgainDecision
} = useTaskState(() => props.task, emit);

// Widget-specific handlers
const handleVocabMayBeConsideredDone = enableDone;
const handleVocabMayNotBeConsideredDone = disableDone;

// Get the resource ID from associated units
const resourceUid = computed(() => {
  const resourceAssociation = props.task.associatedUnits.find(unit => unit.type === 'Resource');
  return resourceAssociation?.uid;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Task Screen -->
    <div v-if="currentState === 'task'">
      <!-- Task Header -->
      <TaskInfo :task="task" />
      
      <!-- Vocab Management Widget -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Add Vocabulary</h3>
          <ManageVocabOfResourceWidget 
            v-if="resourceUid"
            :resource-uid="resourceUid"
            :show-delete-button="true"
            :show-disconnect-button="true"
            :allow-jumping-to-vocab-page="false"
            :allow-connecting-existing="true"
            :allow-adding-new="true"
            @task-may-now-be-considered-done="handleVocabMayBeConsideredDone"
            @task-may-now-not-be-considered-done="handleVocabMayNotBeConsideredDone"
          />
        </div>
      </div>
      
      <!-- Action Buttons -->
      <TaskButtonsDisableSkipDone 
        :is-done-enabled="isDoneEnabled"
        @done="handleDone"
        @skip-and-deactivate="handleSkipAndDeactivate"
        @not-now="handleNotNow"
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