<template>
  <div class="space-y-4">
    <div v-if="milestoneEntries.length === 0" class="text-center py-8 ">
      {{ $t('goals.manage.milestones.noMilestones') }}
    </div>
    
    <div v-else class="space-y-2">
      <div
        v-for="[milestone, isAchieved] in milestoneEntries"
        :key="milestone"
        class="flex items-center gap-3 p-3 border border-base-200 rounded-lg"
      >
        <input
          type="checkbox"
          :checked="isAchieved"
          @change="toggleMilestone(milestone, ($event.target as HTMLInputElement).checked)"
          class="checkbox checkbox-primary"
        />
        <input
          :value="milestone"
          type="text"
          class="input input-sm input-bordered flex-1"
          @blur="updateMilestone(milestone, ($event.target as HTMLInputElement).value)"
          @keydown.enter="updateMilestone(milestone, ($event.target as HTMLInputElement).value)"
        />
        <button
          @click="removeMilestone(milestone)"
          class="btn btn-sm btn-error btn-outline"
        >
          {{ $t('goals.manage.milestones.remove') }}
        </button>
      </div>
    </div>

    <div class="divider">{{ $t('goals.manage.milestones.addNew') }}</div>

    <div class="flex items-center gap-2">
      <span class="  whitespace-nowrap">{{ $t('goals.manage.milestones.placeholder') }}</span>
      <input
        v-model="newMilestone"
        type="text"
        placeholder="enter a specific, measurable milestone..."
        class="input input-bordered flex-1"
        @keydown.enter="addMilestone"
      />
      <button
        @click="addMilestone"
        :disabled="!newMilestone.trim()"
        class="btn btn-primary"
      >
        {{ $t('common.add') }}
      </button>
    </div>
    
    <div class="mt-4">
      <InlineCheckbox
        :model-value="goal.finishedAddingMilestones"
        label="Finished adding milestones"
        @update:model-value="updateFinishedAddingMilestones"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import InlineCheckbox from '@/shared/ui/InlineCheckbox.vue';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const newMilestone = ref('');

const milestoneEntries = computed(() => {
  return Object.entries(props.goal.milestones || {});
});

async function addMilestone() {
  if (!newMilestone.value.trim()) return;
  
  const updatedMilestones = {
    ...props.goal.milestones,
    [newMilestone.value.trim()]: false
  };
  
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    milestones: updatedMilestones
  });
  
  newMilestone.value = '';
  emit('goal-updated', updatedGoal);
}

async function updateMilestone(oldMilestone: string, newMilestoneText: string) {
  if (!newMilestoneText.trim()) return;
  
  // If milestone text hasn't changed, do nothing
  if (oldMilestone === newMilestoneText.trim()) return;
  
  const updatedMilestones = { ...props.goal.milestones };
  const wasAchieved = updatedMilestones[oldMilestone];
  
  // Remove old milestone and add new one with same achievement status
  delete updatedMilestones[oldMilestone];
  updatedMilestones[newMilestoneText.trim()] = wasAchieved;
  
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    milestones: updatedMilestones
  });
  
  emit('goal-updated', updatedGoal);
}

async function toggleMilestone(milestone: string, isAchieved: boolean) {
  const updatedMilestones = {
    ...props.goal.milestones,
    [milestone]: isAchieved
  };
  
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    milestones: updatedMilestones
  });
  
  emit('goal-updated', updatedGoal);
}

async function removeMilestone(milestone: string) {
  if (!confirm('Are you sure you want to remove this milestone?')) return;
  
  const updatedMilestones = { ...props.goal.milestones };
  delete updatedMilestones[milestone];
  
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    milestones: updatedMilestones
  });
  
  emit('goal-updated', updatedGoal);
}

async function updateFinishedAddingMilestones(value: boolean | undefined) {
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    finishedAddingMilestones: value
  });
  
  emit('goal-updated', updatedGoal);
}
</script>