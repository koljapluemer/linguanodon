<template>
  <div class="space-y-4">
    <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div class="stat">
        <div class="stat-title">Sub-Goals</div>
        <div class="stat-value text-sm">{{ goal.subGoals.length }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Milestones</div>
        <div class="stat-value text-sm">{{ goal.milestones.length }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Vocabulary</div>
        <div class="stat-value text-sm">{{ goal.vocab.length }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Examples</div>
        <div class="stat-value text-sm">{{ goal.examples.length }}</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="text-center space-y-4">
      <p class="text-lg">Have you completed this goal?</p>
      <p class="text-sm text-gray-600">
        Consider whether you can achieve what you set out to do. This decision is entirely up to you.
      </p>
      
      <div class="flex gap-4 justify-center">
        <button
          @click="markCompleted(true)"
          :class="[
            'btn',
            goal.isActive === false ? 'btn-success' : 'btn-outline btn-success'
          ]"
          :disabled="saving"
        >
          <span v-if="saving && completionValue === true" class="loading loading-spinner loading-sm"></span>
          {{ goal.isActive === false ? 'Completed ✓' : 'Mark as Completed' }}
        </button>
        
        <button
          @click="markCompleted(false)"
          :class="[
            'btn',
            goal.isActive !== false ? 'btn-primary' : 'btn-outline btn-primary'
          ]"
          :disabled="saving"
        >
          <span v-if="saving && completionValue === false" class="loading loading-spinner loading-sm"></span>
          {{ goal.isActive !== false ? 'Still Working On It' : 'Resume Working' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const saving = ref(false);
const completionValue = ref<boolean | null>(null);

async function markCompleted(completed: boolean) {
  saving.value = true;
  completionValue.value = completed;
  
  try {
    const updatedGoal = await goalRepo.update(props.goal.uid, {
      isActive: !completed
    });
    
    emit('goal-updated', updatedGoal);
  } finally {
    saving.value = false;
    completionValue.value = null;
  }
}
</script>