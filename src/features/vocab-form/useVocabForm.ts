import { ref, computed, inject } from 'vue';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { VocabFormState } from './types';
import { vocabDataToFormData, formDataToVocabData } from './types';

export function useVocabForm(vocabId?: string) {
  const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
  if (!vocabRepo) {
    throw new Error('VocabRepo not provided');
  }

  const state = ref<VocabFormState>({
    formData: {
      language: '',
      content: '',
      pronunciation: '',
      notes: [],
      links: []
    },
    loading: false,
    saving: false,
    error: null,
    isEditing: !!vocabId
  });

  const isValid = computed(() => {
    return state.value.formData.language.trim() !== '' && 
           state.value.formData.content.trim() !== '';
  });

  async function loadVocab() {
    if (!vocabId || !vocabRepo) return;

    state.value.loading = true;
    state.value.error = null;

    try {
      const vocab = await vocabRepo.getVocabByUID(vocabId);
      if (vocab) {
        state.value.formData = vocabDataToFormData(vocab);
      } else {
        state.value.error = 'Vocab not found';
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to load vocab';
    } finally {
      state.value.loading = false;
    }
  }

  async function save(): Promise<boolean> {
    if (!isValid.value || !vocabRepo) {
      state.value.error = 'Please fill in required fields';
      return false;
    }

    state.value.saving = true;
    state.value.error = null;

    try {
      if (state.value.isEditing && vocabId) {
        // Get existing vocab for update
        const existingVocab = await vocabRepo.getVocabByUID(vocabId);
        if (!existingVocab) {
          state.value.error = 'Vocab not found';
          return false;
        }

        const updatedVocab = {
          ...existingVocab,
          ...formDataToVocabData(state.value.formData, existingVocab)
        };
        
        await vocabRepo.updateVocab(updatedVocab);
      } else {
        // Create new vocab
        await vocabRepo.saveVocab(formDataToVocabData(state.value.formData));
      }
      
      return true;
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to save vocab';
      return false;
    } finally {
      state.value.saving = false;
    }
  }

  function addNote() {
    state.value.formData.notes.push({
      content: '',
      showBeforeExercise: false
    });
  }

  function removeNote(index: number) {
    state.value.formData.notes.splice(index, 1);
  }

  function addLink() {
    state.value.formData.links.push({
      label: '',
      url: ''
    });
  }

  function removeLink(index: number) {
    state.value.formData.links.splice(index, 1);
  }

  function reset() {
    state.value.formData = {
      language: '',
      content: '',
      pronunciation: '',
      notes: [],
      links: []
    };
    state.value.error = null;
  }

  return {
    state: computed(() => state.value),
    isValid,
    loadVocab,
    save,
    addNote,
    removeNote,
    addLink,
    removeLink,
    reset
  };
}