<template>
  <div class="space-y-6">
    <div v-if="goal">
      
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <ManageVocabOfGoalWidget 
            :goal="goal"
            @goal-updated="handleGoalUpdate"
          />
        </div>
      </div>
      
      <div class="flex gap-2 mt-4">
        <button class="btn btn-primary" @click="emit('finished')">
          Done
        </button>
        <button class="btn btn-ghost" @click="emit('finished')">
          Skip
        </button>
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
import type { TaskData } from '@/entities/tasks/TaskData';
import ManageVocabOfGoalWidget from '@/features/goal-manage-its-vocab/ManageVocabOfGoalWidget.vue';

interface Props {
  task: TaskData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  finished: [];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const goal = ref<GoalData | null>(null);

async function loadGoal() {
  // Extract goal ID from task's associated goals
  const goalUid = props.task.associatedGoals?.[0];
  if (!goalUid) {
    console.error('No goal association found in task');
    return;
  }
  
  const loadedGoal = await goalRepo.getById(goalUid);
  if (!loadedGoal) {
    console.error(`Goal with id ${goalUid} not found`);
    return;
  }
  goal.value = loadedGoal;
}

function handleGoalUpdate(updatedGoal: GoalData) {
  goal.value = updatedGoal;
}

onMounted(loadGoal);
</script>