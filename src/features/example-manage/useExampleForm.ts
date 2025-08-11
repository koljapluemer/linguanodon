import { ref, computed, inject, watch } from 'vue';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { ExampleData } from '@/entities/examples/ExampleData';
import type { ExampleFormState } from './types';
import { exampleDataToFormData, formDataToExampleData } from './types';

export function useExampleForm(exampleId?: string) {
  const exampleRepo = inject<ExampleRepoContract>('exampleRepo');
  if (!exampleRepo) {
    throw new Error('ExampleRepo not provided');
  }

  const state = ref<ExampleFormState>({
    formData: {
      language: '',
      associatedVocab: []
    },
    loading: false,
    saving: false,
    error: null,
    isEditing: !!exampleId
  });

  const loadedExampleData = ref<ExampleData | null>(null);

  const isValid = computed(() => {
    return state.value.formData.language.trim() !== '';
  });

  async function loadExample() {
    if (!exampleId || exampleId === 'new' || !exampleRepo) return;

    state.value.loading = true;
    state.value.error = null;

    try {
      const example = await exampleRepo.getExampleById(exampleId);
      if (example) {
        loadedExampleData.value = example;
        state.value.formData = exampleDataToFormData(example);
      } else {
        state.value.error = 'Example not found';
      }
    } catch (error) {
      console.error('Error loading example:', error);
      state.value.error = 'Failed to load example';
    } finally {
      state.value.loading = false;
    }
  }

  async function saveExample() {
    if (!isValid.value || !exampleRepo) return;

    state.value.saving = true;
    state.value.error = null;

    try {
      const exampleData = formDataToExampleData(state.value.formData, loadedExampleData.value || undefined);
      
      if (state.value.isEditing && loadedExampleData.value) {
        await exampleRepo.updateExample(exampleData);
      } else {
        await exampleRepo.saveExample(exampleData);
      }
    } catch (error) {
      console.error('Error saving example:', error);
      state.value.error = 'Failed to save example';
      throw error;
    } finally {
      state.value.saving = false;
    }
  }

  // Load example data on mount if editing
  watch(() => exampleId, () => {
    if (exampleId) {
      loadExample();
    }
  }, { immediate: true });

  return {
    state,
    isValid,
    saveExample,
    loadExample
  };
}