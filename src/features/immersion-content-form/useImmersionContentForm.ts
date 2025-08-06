import { ref, computed, inject, watch } from 'vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { ImmersionContentFormState, ImmersionContentFormData } from './types';
import { immersionContentToFormData, formDataToImmersionContent } from './types';

export function useImmersionContentForm(contentUid?: string) {
  const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
  if (!resourceRepo) {
    throw new Error('ResourceRepo not provided');
  }

  const state = ref<ImmersionContentFormState>({
    formData: {
      title: '',
      prompt: '',
      content: '',
      linkUrl: '',
      linkLabel: '',
      extraInfo: '',
      language: '',
      priority: 1
    },
    loading: false,
    saving: false,
    error: null,
    isEditing: !!contentUid
  });

  const loadedContentData = ref<ResourceData | null>(null);

  const isValid = computed(() => {
    const data = state.value.formData;
    return data.title.trim() !== '' && 
           data.prompt.trim() !== '' &&
           data.language.trim() !== '' &&
           data.title.length <= 2000 &&
           data.prompt.length <= 2000 &&
           (!data.extraInfo || data.extraInfo.length <= 2000);
  });

  // Auto-save functionality
  let autoSaveTimeout: number | null = null;

  function scheduleAutoSave() {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Auto-save after 1 second of inactivity
    autoSaveTimeout = window.setTimeout(() => {
      if (state.value.isEditing && isValid.value && !state.value.saving) {
        autoSave();
      }
    }, 1000);
  }

  async function autoSave() {
    if (!state.value.isEditing || !contentUid || !isValid.value) return;

    try {
      state.value.saving = true;
      await saveInternal();
    } catch (error) {
      console.warn('Auto-save failed:', error);
      // Don't show error for auto-save failures
    } finally {
      state.value.saving = false;
    }
  }

  // Watch for form changes to trigger auto-save
  watch(
    () => state.value.formData,
    () => {
      if (state.value.isEditing) {
        scheduleAutoSave();
      }
    },
    { deep: true }
  );

  // Helper function to serialize form data and avoid proxy issues
  function serializeFormData(formData: ImmersionContentFormData): ImmersionContentFormData {
    return JSON.parse(JSON.stringify(formData));
  }

  async function loadContent() {
    if (!contentUid || !resourceRepo) return;

    state.value.loading = true;
    state.value.error = null;

    try {
      const content = await resourceRepo.getResourceById(contentUid);
      if (content && content.isImmersionContent) {
        loadedContentData.value = content;
        state.value.formData = immersionContentToFormData(content);
      } else {
        state.value.error = 'Immersion content not found';
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to load content';
    } finally {
      state.value.loading = false;
    }
  }

  async function saveInternal(): Promise<void> {
    if (!resourceRepo) throw new Error('ResourceRepo not available');

    // Serialize form data to avoid proxy issues
    const serializedFormData = serializeFormData(state.value.formData);

    if (state.value.isEditing && contentUid) {
      // Get existing content for update
      const existingContent = await resourceRepo.getResourceById(contentUid);
      if (!existingContent) {
        throw new Error('Content not found');
      }

      const updatedContent = {
        ...existingContent,
        ...formDataToImmersionContent(serializedFormData, existingContent)
      };
      
      await resourceRepo.updateResource(updatedContent);
    } else {
      // Create new content
      await resourceRepo.saveResource(formDataToImmersionContent(serializedFormData));
    }
  }

  async function save(): Promise<boolean> {
    if (!isValid.value || !resourceRepo) {
      state.value.error = 'Please fill in required fields and check length limits';
      return false;
    }

    state.value.saving = true;
    state.value.error = null;

    try {
      await saveInternal();
      return true;
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to save content';
      return false;
    } finally {
      state.value.saving = false;
    }
  }

  function reset() {
    state.value.formData = {
      title: '',
      prompt: '',
      content: '',
      linkUrl: '',
      linkLabel: '',
      extraInfo: '',
      language: '',
      priority: 1
    };
    state.value.error = null;
  }

  return {
    state: computed(() => state.value),
    loadedContentData: computed(() => loadedContentData.value),
    isValid,
    loadContent,
    save,
    reset
  };
}