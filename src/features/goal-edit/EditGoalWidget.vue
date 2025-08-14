<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Goal Details</h2>
    
    <FormField label="Goal Title">
      <template #default="{ inputId, inputClassString }">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">I want to be able to</span>
          <input
            :id="inputId"
            v-model="goalTitle"
            type="text"
            placeholder="describe what you want to achieve..."
            :class="`${inputClassString} flex-1`"
            @blur="saveGoal"
            @keydown.enter="saveGoal"
          />
        </div>
      </template>
    </FormField>

    <div v-if="saving" class="text-sm text-gray-500">
      Saving...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import FormField from '@/shared/ui/FormField.vue';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const goalTitle = ref(props.goal.title);
const saving = ref(false);

watch(() => props.goal, (newGoal) => {
  goalTitle.value = newGoal.title;
}, { immediate: true });

async function saveGoal() {
  if (!goalTitle.value.trim()) return;
  
  saving.value = true;
  
  try {
    let updatedGoal: GoalData;
    
    if (props.goal.uid) {
      // Update existing goal
      updatedGoal = await goalRepo.update(props.goal.uid, {
        title: goalTitle.value.trim()
      });
    } else {
      // Create new goal
      updatedGoal = await goalRepo.create({
        title: goalTitle.value.trim(),
        subGoals: [],
        vocab: [],
        notes: [],
        factCards: []
      });
    }
    
    emit('goal-updated', updatedGoal);
  } finally {
    saving.value = false;
  }
}
</script>