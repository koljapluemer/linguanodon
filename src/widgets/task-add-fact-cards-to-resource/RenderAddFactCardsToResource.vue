<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import { useTaskState } from '@/entities/tasks/useTaskState';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import TaskButtonsDisableSkipDone from '@/entities/tasks/TaskButtonsDisableSkipDone.vue';
import TaskDecideWhetherToDoAgain from '@/entities/tasks/TaskDecideWhetherToDoAgain.vue';
import TaskEvaluateCorrectnessAndConfidence from '@/entities/tasks/TaskEvaluateCorrectnessAndConfidence.vue';
import ManageFactsOfResourceWidget from '@/features/resource-manage-its-facts/ManageFactsOfResourceWidget.vue';
import LinkDisplay from '@/shared/ui/LinkDisplay.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';

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
const handleFactsMayBeConsideredDone = enableDone;
const handleFactsMayNotBeConsideredDone = disableDone;

// Get the resource ID from associated units
const resourceUid = computed(() => {
  const resourceAssociation = props.task.associatedUnits.find(unit => unit.type === 'Resource');
  return resourceAssociation?.uid;
});

// Resource data and loading
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const resource = ref<ResourceData | null>(null);

const loadResource = async () => {
  if (!resourceUid.value || !resourceRepo) return;
  
  try {
    const resourceData = await resourceRepo.getResourceById(resourceUid.value);
    resource.value = resourceData || null;
  } catch (error) {
    console.error('Failed to load resource:', error);
  }
};

onMounted(() => {
  loadResource();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Task Screen -->
    <div v-if="currentState === 'task'">
      <!-- Task Header -->
      <TaskInfo :task="task" />
      
      <!-- Resource Link -->
      <div v-if="resource?.link" class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Resource</h3>
          <LinkDisplay :link="resource.link" />
        </div>
      </div>
      
      <!-- Fact Cards Management Widget -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Add Fact Cards</h3>
          <ManageFactsOfResourceWidget 
            v-if="resourceUid"
            :resource-uid="resourceUid"
            @task-may-now-be-considered-done="handleFactsMayBeConsideredDone"
            @task-may-now-not-be-considered-done="handleFactsMayNotBeConsideredDone"
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