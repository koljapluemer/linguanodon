<template>
  <div>
    <div v-if="state.loading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="state.error" class="alert alert-error">
      <span>{{ state.error }}</span>
    </div>

    <div v-else class="space-y-6">
      <!-- Basic Information -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Basic Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Language -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Language *</span>
              </label>
              <LanguageDropdown
                v-model="state.formData.language"
                placeholder="Select target language"
                required
              />
            </div>
          </div>

          <!-- Content -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Example Content</span>
            </label>
            <textarea 
              v-model="state.formData.content"
              class="textarea textarea-bordered h-24"
              placeholder="Enter the example sentence or phrase..."
            ></textarea>
          </div>

          <!-- Translation -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Translation</span>
            </label>
            <textarea 
              v-model="state.formData.translation"
              class="textarea textarea-bordered h-24"
              placeholder="Enter the translation..."
            ></textarea>
          </div>

          <!-- Associated Vocab -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Associated Vocabulary IDs</span>
            </label>
            <textarea 
              v-model="associatedVocabText"
              class="textarea textarea-bordered h-20"
              placeholder="Enter vocab IDs separated by commas (e.g., ciao-1, casa-1)"
            ></textarea>
            <div class="label">
              <span class="label-text-alt">Separate multiple IDs with commas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <router-link to="/examples" class="btn btn-outline">
          Cancel
        </router-link>
        <button 
          @click="handleSave"
          :disabled="!isValid || state.saving"
          class="btn btn-primary"
        >
          <span v-if="state.saving" class="loading loading-spinner loading-sm"></span>
          {{ state.saving ? 'Saving...' : (state.isEditing ? 'Update Example' : 'Create Example') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExampleForm } from './useExampleForm';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';

interface Props {
  exampleId?: string;
}

const props = defineProps<Props>();
const router = useRouter();

const { state, isValid, saveExample } = useExampleForm(props.exampleId);

// Convert associatedVocab array to/from comma-separated string for textarea
const associatedVocabText = computed({
  get: () => state.value.formData.associatedVocab.join(', '),
  set: (value: string) => {
    state.value.formData.associatedVocab = value
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
  }
});

async function handleSave() {
  try {
    await saveExample();
    router.push('/examples');
  } catch {
    // Error is already handled in useExampleForm
  }
}
</script>