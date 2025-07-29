<template>
  <div class="space-y-6">
    <div v-if="goal">
      <DoTaskWidget
        :title="goal.coreTasks.find(t => t.taskType === 'add-milestones')?.title || 'Add Milestones'"
        :prompt="goal.coreTasks.find(t => t.taskType === 'add-milestones')?.prompt || 'Add specific milestones to track your progress toward this goal'"
        @completed="handleTaskCompleted"
        @skipped="handleTaskCompleted"
      />
      
      <div class="divider">Work on Milestones</div>
      
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <ManageMilestonesWidget 
            :goal="goal"
            @goal-updated="handleGoalUpdate"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2 text-gray-500">Loading goal...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import DoTaskWidget from '@/features/do-task/DoTaskWidget.vue';
import ManageMilestonesWidget from '@/features/manage-milestones/ManageMilestonesWidget.vue';

const props = defineProps<{
  goalId: string;
}>();

const emit = defineEmits<{
  'task-completed': [];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const goal = ref<GoalData | null>(null);

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

async function handleTaskCompleted() {
  if (!goal.value) return;
  
  // Mark the core task as completed
  const updatedGoal = await goalRepo.update(goal.value.id, {
    coreTasks: goal.value.coreTasks.map(task => 
      task.taskType === 'add-milestones' 
        ? { ...task, wantToDoAgain: false } 
        : task
    )
  });
  
  goal.value = updatedGoal;
  emit('task-completed');
}

onMounted(loadGoal);
</script>