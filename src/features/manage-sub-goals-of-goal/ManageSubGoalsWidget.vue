<template>
  <div class="space-y-4">
    <div v-if="subGoals.length === 0" class="text-center py-8 text-gray-500">
      No sub-goals yet. Add one below to break down this goal into smaller steps.
    </div>
    
    <div v-else class="space-y-2">
      <div
        v-for="subGoal in subGoals"
        :key="subGoal.id"
        class="flex items-center gap-3 p-3 border border-base-200 rounded-lg"
      >
        <input
          v-model="subGoal.title"
          type="text"
          class="input input-sm input-bordered flex-1"
          @blur="updateSubGoal(subGoal)"
          @keydown.enter="updateSubGoal(subGoal)"
        />
        <button
          @click="removeSubGoal(subGoal.id)"
          class="btn btn-sm btn-error btn-outline"
        >
          Remove
        </button>
      </div>
    </div>

    <div class="divider">Add New Sub-Goal</div>

    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600 whitespace-nowrap">To reach the goal defined above, I will learn to</span>
      <input
        v-model="newSubGoalTitle"
        type="text"
        placeholder="enter a smaller, more specific goal..."
        class="input input-bordered flex-1"
        @keydown.enter="addSubGoal"
      />
      <button
        @click="addSubGoal"
        :disabled="!newSubGoalTitle.trim()"
        class="btn btn-primary"
      >
        Add
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const subGoals = ref<GoalData[]>([]);
const newSubGoalTitle = ref('');

async function loadSubGoals() {
  const subGoalPromises = props.goal.subGoals.map(id => goalRepo.getById(id));
  const subGoalResults = await Promise.all(subGoalPromises);
  subGoals.value = subGoalResults.filter(sg => sg !== undefined) as GoalData[];
}

async function addSubGoal() {
  if (!newSubGoalTitle.value.trim()) return;
  
  const newSubGoal = await goalRepo.create({
    title: newSubGoalTitle.value.trim(),
    prompt: newSubGoalTitle.value.trim(),
    taskType: 'complete-goal',
    parentGoal: props.goal.id,
    subGoals: [],
    milestones: [],
    vocab: [],
    examples: [],
    wantToDoAgain: true
  });
  
  // Update parent goal to include this sub-goal
  const updatedGoal = await goalRepo.update(props.goal.id, {
    subGoals: [...props.goal.subGoals, newSubGoal.id]
  });
  
  subGoals.value.push(newSubGoal);
  newSubGoalTitle.value = '';
  emit('goal-updated', updatedGoal);
}

async function updateSubGoal(subGoal: GoalData) {
  if (!subGoal.title.trim()) return;
  
  await goalRepo.update(subGoal.id, {
    title: subGoal.title.trim(),
    prompt: subGoal.title.trim()
  });
}

async function removeSubGoal(subGoalId: string) {
  if (!confirm('Are you sure you want to remove this sub-goal?')) return;
  
  // Remove from parent goal's subGoals array
  const updatedSubGoals = props.goal.subGoals.filter(id => id !== subGoalId);
  const updatedGoal = await goalRepo.update(props.goal.id, {
    subGoals: updatedSubGoals
  });
  
  // Delete the sub-goal itself
  await goalRepo.delete(subGoalId);
  
  // Update local state
  subGoals.value = subGoals.value.filter(sg => sg.id !== subGoalId);
  emit('goal-updated', updatedGoal);
}

onMounted(loadSubGoals);
</script>