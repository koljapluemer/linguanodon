<template>
  <!-- Error State -->
  <div v-if="error" class="alert alert-error mb-6">
    <span>{{ error }}</span>
  </div>

  <!-- Language -->
  <div class="py-4">
    <label class="label">
      <span class="label-text font-medium">Language *</span>
    </label>
    <LanguageDropdown
      v-model="formData.language"
      @update:model-value="$emit('field-change')"
      placeholder="Select target language"
    />
  </div>

  <!-- Front -->
  <div class="py-4">
    <label class="label">
      <span class="label-text font-medium">Front *</span>
    </label>
    <textarea
      v-model="formData.front"
      @input="$emit('field-change')"
      placeholder="Enter the front of the card"
      class="textarea textarea-bordered textarea-lg w-full"
      required
    ></textarea>
  </div>

  <!-- Back -->
  <div class="py-4">
    <label class="label">
      <span class="label-text font-medium">Back *</span>
    </label>
    <textarea
      v-model="formData.back"
      @input="$emit('field-change')"
      placeholder="Enter the back of the card"
      class="textarea textarea-bordered textarea-lg w-full"
      required
    ></textarea>
  </div>

  <!-- Save Button -->
  <div class="py-4">
    <button
      type="button"
      @click="$emit('save')"
      :disabled="saving || !formData.language.trim() || !formData.front.trim() || !formData.back.trim()"
      class="btn btn-primary w-full"
    >
      <span v-if="saving" class="loading loading-spinner loading-sm mr-2"></span>
      {{ saving ? 'Saving...' : 'Save Fact Card' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import LanguageDropdown from '@/entities/languages/LanguageDropdown.vue';

interface FactCardFormData {
  language: string;
  front: string;
  back: string;
}

defineProps<{
  formData: FactCardFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
}>();

defineEmits<{
  'field-change': [];
  'save': [];
}>();
</script>