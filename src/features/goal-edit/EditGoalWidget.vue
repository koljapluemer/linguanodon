<template>
  <FormFieldset legend="Goal Details">
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

    <FormField label="Additional Details (Optional)">
      <template #default="{ inputId }">
        <textarea
          :id="inputId"
          v-model="goalPrompt"
          placeholder="Add any additional context or details about your goal..."
          class="textarea textarea-bordered w-full"
          rows="3"
          @blur="saveGoal"
        />
      </template>
    </FormField>

    <div v-if="saving" class="text-sm text-gray-500">
      Saving...
    </div>
  </FormFieldset>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';

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
    
    if (props.goal.uid) {
      // Update existing goal
      updatedGoal = await goalRepo.update(props.goal.uid, {
        title: goalTitle.value.trim(),
        prompt: goalPrompt.value.trim() || goalTitle.value.trim()
      });
    } else {
      // Create new goal
      updatedGoal = await goalRepo.create({
        uid: crypto.randomUUID(),
        title: goalTitle.value.trim(),
        prompt: goalPrompt.value.trim() || goalTitle.value.trim(),
        taskType: 'complete-goal',
        subGoals: [],
        milestones: [],
        vocab: [],
        examples: [],
        notes: [],
        factCards: [],
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: true,
        isActive: true,
        taskSize: 'big',
        associatedUnits: []
      });
    }
    
    emit('goal-updated', updatedGoal);
  } finally {
    saving.value = false;
  }
}
</script>