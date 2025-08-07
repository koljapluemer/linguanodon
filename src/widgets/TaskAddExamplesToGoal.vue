<template>
  <div class="space-y-6">
    <div v-if="goal && currentTask">
      <div v-if="currentState === 'task'">
        <TaskInfo :task="currentTask" />
        
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <ManageExamplesOfGoalWidget 
              :goal="goal"
              @goal-updated="handleGoalUpdate"
              @task-may-now-be-considered-done="enableDone"
              @task-may-now-not-be-considered-done="disableDone"
            />
          </div>
        </div>
        
        <TaskButtonsDisableSkipDone 
          :is-done-enabled="isDoneEnabled"
          @done="handleDone"
          @skip-and-deactivate="handleSkipAndDeactivate"
          @not-now="handleNotNow"
        />
      </div>
      
      <div v-else-if="currentState === 'evaluation'">
        <TaskEvaluateCorrectnessAndConfidence @evaluation="handleEvaluation" />
      </div>
      
      <div v-else-if="currentState === 'do-again-decision'">
        <TaskDecideWhetherToDoAgain @decision="handleDoAgainDecision" />
      </div>
    </div>

    <div v-else class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2 text-gray-500">Loading goal...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { Task } from '@/entities/tasks/Task';
import { useTaskState } from '@/entities/tasks/useTaskState';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import TaskButtonsDisableSkipDone from '@/entities/tasks/TaskButtonsDisableSkipDone.vue';
import TaskDecideWhetherToDoAgain from '@/entities/tasks/TaskDecideWhetherToDoAgain.vue';
import TaskEvaluateCorrectnessAndConfidence from '@/entities/tasks/TaskEvaluateCorrectnessAndConfidence.vue';
import ManageExamplesOfGoalWidget from '@/features/manage-examples-of-goal/ManageExamplesOfGoalWidget.vue';

const props = defineProps<{
  goalId: string;
}>();

const emit = defineEmits<{
  'task-completed': [];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const goal = ref<GoalData | null>(null);

const currentTask = computed<Task | null>(() => {
  if (!goal.value) return null;
  const coreTask = goal.value.coreTasks.find(t => t.taskType === 'add-examples-to-goal');
  if (!coreTask) return null;
  
  return {
    ...coreTask,
    mayBeConsideredDone: false,
    isDone: false
  } as Task;
});

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
} = useTaskState(() => currentTask.value, () => emit('task-completed'));

async function loadGoal() {
  const loadedGoal = await goalRepo.getById(props.goalId);
  if (!loadedGoal) {
    console.error(`Goal with id ${props.goalId} not found`);
    return;
  }
  goal.value = loadedGoal;
}

function handleGoalUpdate(updatedGoal: GoalData) {
  goal.value = updatedGoal;
}

onMounted(loadGoal);
</script>