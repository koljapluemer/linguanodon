<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-700">
    <InlineSelect
      :model-value="goal.language"
      label="Language"
      placeholder="Select target language"
      required
      :options="languageOptions"
      @update:model-value="updateField('language', $event)"
    />

    <InlineInput
      :model-value="goal.title"
      label="Title"
      placeholder="Goal title"
      required
      size="big"
      @update:model-value="updateField('title', $event)"
    />

    <InlineInput
      :model-value="goal.prio"
      label="Priority"
      placeholder="1-10 (higher = more important)"
      type="number"
      :min="1"
      :max="10"
      @update:model-value="updateField('prio', $event ? Number($event) : undefined)"
    />

    <InlineCheckbox
      :model-value="goal.doNotPractice"
      label="Do not practice"
      @update:model-value="updateField('doNotPractice', $event)"
    />

    <InlineCheckbox
      :model-value="goal.isAchieved"
      label="Goal achieved"
      @update:model-value="updateField('isAchieved', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import { formatLanguageDisplay } from '@/entities/languages';
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineSelect from '@/shared/ui/InlineSelect.vue';
import InlineCheckbox from '@/shared/ui/InlineCheckbox.vue';
const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const availableLanguages = ref<LanguageData[]>([]);

onMounted(async () => {
  try {
    availableLanguages.value = await languageRepo.getActiveTargetLanguages();
  } catch (error) {
    console.error('Failed to load languages:', error);
  }
});

const languageOptions = computed(() => {
  return availableLanguages.value.map(language => ({
    value: language.code,
    label: language.emoji ? `${language.emoji} ${formatLanguageDisplay(language, false)}` : formatLanguageDisplay(language, false)
  }));
});

async function updateField(field: keyof GoalData, value: string | number | boolean | undefined) {
  try {
    const updatedGoal = await goalRepo.update(props.goal.uid, {
      [field]: value
    });
    emit('goal-updated', updatedGoal);
  } catch (error) {
    console.error(`Failed to update goal ${field}:`, error);
  }
}
</script>