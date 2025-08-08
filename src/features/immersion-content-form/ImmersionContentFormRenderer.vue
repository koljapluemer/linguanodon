<template>
  <div class="max-w-2xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading content...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <div v-else class="space-y-6">
      <FormFieldset legend="Basic Information">
        <FormField label="Title" required>
          <template #default="{ inputId, inputClasses }">
            <div class="flex items-center gap-2">
              <input
                :id="inputId"
                v-model="formData.title"
                type="text"
                placeholder="Content title"
                :class="[inputClasses, { 'input-error': formData.title.length > 2000 }]"
                required
              />
              <span class="text-sm text-base-content/60 whitespace-nowrap">{{ formData.title.length }}/2000</span>
            </div>
          </template>
        </FormField>

        <FormField label="Language" required>
          <template #default="{ inputId }">
            <LanguageDropdown
              :id="inputId"
              v-model="formData.language"
              placeholder="Select target language"
              required
            />
          </template>
        </FormField>

        <FormField label="Priority">
          <template #default="{ inputId, inputClasses }">
            <div class="space-y-1">
              <input
                :id="inputId"
                v-model.number="formData.priority"
                type="number"
                min="1"
                max="5"
                placeholder="1"
                :class="inputClasses"
                style="width: 6rem"
              />
              <div class="text-sm text-base-content/60">1 = lowest, 5 = highest priority</div>
            </div>
          </template>
        </FormField>
      </FormFieldset>

      <FormFieldset legend="Content">
        <FormField label="Prompt" required>
          <template #default="{ inputId }">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <textarea
                  :id="inputId"
                  v-model="formData.prompt"
                  placeholder="Task instructions (supports markdown: **bold**, *italic*, [link](url), - lists)"
                  class="textarea textarea-bordered h-24 flex-1"
                  :class="{ 'textarea-error': formData.prompt.length > 2000 }"
                  required
                  @blur="showPromptPreview = true"
                  @focus="showPromptPreview = false"
                ></textarea>
                <span class="text-sm text-base-content/60 whitespace-nowrap">{{ formData.prompt.length }}/2000</span>
              </div>
              
              <!-- Prompt Preview -->
              <div v-if="showPromptPreview && formData.prompt" class="p-3 bg-base-200 rounded">
                <div class="text-sm text-base-content/70 mb-1">Preview:</div>
                <MarkdownRenderer :content="formData.prompt" />
              </div>
            </div>
          </template>
        </FormField>

        <FormField label="Extra Info">
          <template #default="{ inputId }">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <textarea
                  :id="inputId"
                  v-model="formData.extraInfo"
                  placeholder="Additional information (supports markdown: **bold**, *italic*, [link](url), - lists)"
                  class="textarea textarea-bordered h-20 flex-1"
                  :class="{ 'textarea-error': (formData.extraInfo || '').length > 2000 }"
                  @blur="showExtraInfoPreview = true"
                  @focus="showExtraInfoPreview = false"
                ></textarea>
                <span class="text-sm text-base-content/60 whitespace-nowrap">{{ (formData.extraInfo || '').length }}/2000</span>
              </div>
              
              <!-- Extra Info Preview -->
              <div v-if="showExtraInfoPreview && formData.extraInfo" class="p-3 bg-base-200 rounded">
                <div class="text-sm text-base-content/70 mb-1">Preview:</div>
                <MarkdownRenderer :content="formData.extraInfo" />
              </div>
            </div>
          </template>
        </FormField>
      </FormFieldset>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <router-link to="/immersion-content" class="btn btn-outline">
          ← Back to Content List
        </router-link>
        
        <div class="flex items-center gap-2">
          <span v-if="saving" class="text-sm text-base-content/70 flex items-center gap-1">
            <span class="loading loading-spinner loading-sm"></span>
            Auto-saving...
          </span>
          <span v-else-if="isEditing" class="text-sm text-success flex items-center gap-1">
            <Check class="w-4 h-4" />
            Changes saved automatically
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Check } from 'lucide-vue-next';
import type { ImmersionContentFormData } from './types';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';

defineProps<{
  formData: ImmersionContentFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isValid: boolean;
  isEditing: boolean;
}>();

const showPromptPreview = ref(false);
const showExtraInfoPreview = ref(false);
</script>