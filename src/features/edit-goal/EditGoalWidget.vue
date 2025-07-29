<template>
  <div class="space-y-4">
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Goal Title</span>
      </label>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">I want to be able to</span>
        <input
          v-model="goalTitle"
          type="text"
          placeholder="describe what you want to achieve..."
          class="input input-bordered flex-1"
          @blur="saveGoal"
          @keydown.enter="saveGoal"
        />
      </div>
    </div>

    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Additional Details (Optional)</span>
      </label>
      <textarea
        v-model="goalPrompt"
        placeholder="Add any additional context or details about your goal..."
        class="textarea textarea-bordered"
        rows="3"
        @blur="saveGoal"
      />
    </div>

    <div v-if="saving" class="text-sm text-gray-500">
      Saving...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const goalTitle = ref(props.goal.title);
const goalPrompt = ref(props.goal.prompt || '');
const saving = ref(false);

watch(() => props.goal, (newGoal) => {
  goalTitle.value = newGoal.title;
  goalPrompt.value = newGoal.prompt || '';
}, { immediate: true });

async function saveGoal() {
  if (!goalTitle.value.trim()) return;
  
  saving.value = true;
  
  try {
    let updatedGoal: GoalData;
    
    if (props.goal.id) {
      // Update existing goal
      updatedGoal = await goalRepo.update(props.goal.id, {
        title: goalTitle.value.trim(),
        prompt: goalPrompt.value.trim() || goalTitle.value.trim()
      });
    } else {
      // Create new goal
      updatedGoal = await goalRepo.create({
        title: goalTitle.value.trim(),
        prompt: goalPrompt.value.trim() || goalTitle.value.trim(),
        taskType: 'complete-goal',
        subGoals: [],
        milestones: [],
        vocab: [],
        examples: [],
        wantToDoAgain: true
      });
    }
    
    emit('goal-updated', updatedGoal);
  } finally {
    saving.value = false;
  }
}
</script>