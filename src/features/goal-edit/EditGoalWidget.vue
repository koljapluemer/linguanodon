<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Goal Details</h2>
    
    <div class="flex flex-col space-y-1">
      <label class="text-sm font-medium">Language</label>
      <LanguageSelect
        v-model="selectedLanguage"
        class="select select-bordered w-full"
        required
        @update:modelValue="saveGoal"
      />
    </div>

    <div class="flex flex-col space-y-1">
      <label class="text-sm font-medium">Goal Title</label>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">I want to be able to</span>
        <input
          v-model="goalTitle"
          type="text"
          placeholder="describe what you want to achieve..."
          class="input input-bordered w-full flex-1"
          @blur="saveGoal"
          @keydown.enter="saveGoal"
        />
      </div>
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
import LanguageSelect from '@/entities/languages/LanguageSelect.vue';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const goalTitle = ref(props.goal.title);
const selectedLanguage = ref(props.goal.language);
const saving = ref(false);

watch(() => props.goal, (newGoal) => {
  goalTitle.value = newGoal.title;
  selectedLanguage.value = newGoal.language;
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
        language: selectedLanguage.value
      });
    } else {
      // Create new goal
      updatedGoal = await goalRepo.create({
        title: goalTitle.value.trim(),
        language: selectedLanguage.value,
        subGoals: [],
        vocab: [],
        notes: [],
        factCards: [],
        origins: ['user-added'],
        finishedAddingSubGoals: false,
        finishedAddingMilestones: false,
        finishedAddingKnowledge: false,
        milestones: {},
        isAchieved: false
      });
    }
    
    emit('goal-updated', updatedGoal);
  } finally {
    saving.value = false;
  }
}
</script>