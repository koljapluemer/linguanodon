<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <GoalAddFormRenderer 
      :form-data="formData" 
      :is-saving="isSaving"
      @field-change="handleFieldChange"
    />
    
    <div class="flex gap-3 pt-6 border-t">
      <router-link to="/goals" class="btn btn-outline flex-1">
        {{ $t('common.cancel') }}
      </router-link>
      <button
        type="button"
        @click="handleSave('add-another')"
        :disabled="!isFormValid || isSaving"
        class="btn btn-secondary flex-1"
      >
        <span v-if="isSaving" class="loading loading-spinner loading-sm mr-2"></span>
        {{ $t('goals.form.saveAndAddAnother') }}
      </button>
      <button
        type="submit"
        :disabled="!isFormValid || isSaving"
        class="btn btn-primary flex-1"
      >
        <span v-if="isSaving" class="loading loading-spinner loading-sm mr-2"></span>
        {{ $t('goals.form.save') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import GoalAddFormRenderer from './GoalAddFormRenderer.vue';

interface GoalFormData {
  language: string;
  title: string;
}

const emit = defineEmits<{
  'goal-saved': [goalId: string, action: 'edit' | 'add-another'];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const formData = ref<GoalFormData>({
  language: '',
  title: ''
});

const isSaving = ref(false);

const isFormValid = computed(() => {
  return formData.value.language.trim() !== '' && formData.value.title.trim() !== '';
});

function handleFieldChange() {
  // Form reactivity handled by v-model
}

async function handleSave(action: 'edit' | 'add-another') {
  if (!isFormValid.value || isSaving.value) return;
  
  isSaving.value = true;
  
  try {
    const newGoal = await goalRepo.create({
      title: formData.value.title.trim(),
      language: formData.value.language,
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
    
    emit('goal-saved', newGoal.uid, action);
  } catch (error) {
    console.error('Failed to save goal:', error);
    alert('Failed to save goal. Please try again.');
  } finally {
    isSaving.value = false;
  }
}

async function handleSubmit() {
  await handleSave('edit');
}
</script>