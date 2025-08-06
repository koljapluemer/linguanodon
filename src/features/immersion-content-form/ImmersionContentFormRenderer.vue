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
      <!-- Basic Information -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Basic Information</h3>
          
          <!-- Title -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Title *</span>
              <span class="label-text-alt">{{ formData.title.length }}/2000</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="Content title"
              class="input input-bordered"
              :class="{ 'input-error': formData.title.length > 2000 }"
              required
            />
          </div>

          <!-- Language -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Language *</span>
            </label>
            <LanguageDropdown
              v-model="formData.language"
              placeholder="Select target language"
              required
            />
          </div>

          <!-- Priority -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Priority</span>
            </label>
            <input
              v-model.number="formData.priority"
              type="number"
              min="1"
              max="5"
              placeholder="1"
              class="input input-bordered w-24"
            />
            <div class="label">
              <span class="label-text-alt">1 = lowest, 5 = highest priority</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Content</h3>
          
          <!-- Prompt -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Prompt *</span>
              <span class="label-text-alt">{{ formData.prompt.length }}/2000</span>
            </label>
            <textarea
              v-model="formData.prompt"
              placeholder="Task instructions (supports markdown: **bold**, *italic*, [link](url), - lists)"
              class="textarea textarea-bordered h-24"
              :class="{ 'textarea-error': formData.prompt.length > 2000 }"
              required
              @blur="showPromptPreview = true"
              @focus="showPromptPreview = false"
            ></textarea>
            
            <!-- Prompt Preview -->
            <div v-if="showPromptPreview && formData.prompt" class="mt-2 p-3 bg-base-200 rounded">
              <div class="text-sm text-base-content/70 mb-1">Preview:</div>
              <MarkdownRenderer :content="formData.prompt" />
            </div>
          </div>

          <!-- Extra Info -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Extra Info</span>
              <span class="label-text-alt">{{ (formData.extraInfo || '').length }}/2000</span>
            </label>
            <textarea
              v-model="formData.extraInfo"
              placeholder="Additional information (supports markdown: **bold**, *italic*, [link](url), - lists)"
              class="textarea textarea-bordered h-20"
              :class="{ 'textarea-error': (formData.extraInfo || '').length > 2000 }"
              @blur="showExtraInfoPreview = true"
              @focus="showExtraInfoPreview = false"
            ></textarea>
            
            <!-- Extra Info Preview -->
            <div v-if="showExtraInfoPreview && formData.extraInfo" class="mt-2 p-3 bg-base-200 rounded">
              <div class="text-sm text-base-content/70 mb-1">Preview:</div>
              <MarkdownRenderer :content="formData.extraInfo" />
            </div>
          </div>
        </div>
      </div>

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