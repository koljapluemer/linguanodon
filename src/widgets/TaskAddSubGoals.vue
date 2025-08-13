<template>
  <div class="space-y-6">
    <div v-if="goal">
      <!-- Goal Display -->
      <div class="card bg-primary/10 border border-primary/20">
        <div class="card-body">
          <h2 class="card-title text-primary">{{ goal.title }}</h2>
          <div class="card-actions justify-end mt-4">
            <button class="btn btn-primary btn-sm" @click="handleTaskCompleted">
              Done Adding Sub-Goals
            </button>
          </div>
        </div>
      </div>
      
      <div class="divider">Sub-Goals</div>
      
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <ManageSubGoalsWidget 
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
import ManageSubGoalsWidget from '@/features/goal-manage-its-sub-goals/ManageSubGoalsWidget.vue';

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
  
  // In the new structure, task completion should be handled by a feature layer
  // that coordinates between TaskRepo and GoalRepo
  // For now, just emit completion - the task management will be handled elsewhere
  emit('task-completed');
}

onMounted(loadGoal);
</script>