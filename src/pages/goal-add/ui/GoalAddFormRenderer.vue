<template>
  <div class="space-y-6">
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Language *</span>
      </label>
      <LanguageDropdown
        v-model="formData.language"
        @update:model-value="$emit('field-change')"
      />
    </div>

    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Goal Title *</span>
      </label>
      <input
        v-model="formData.title"
        type="text"
        placeholder="What do you want to achieve?"
        class="input input-bordered input-lg w-full"
        required
        @input="$emit('field-change')"
      />
      <div class="label">
        <span class="label-text-alt ">
          Be specific about what you want to learn or accomplish
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LanguageDropdown from '@/entities/languages/LanguageDropdown.vue';

interface GoalFormData {
  language: string;
  title: string;
}

defineProps<{
  formData: GoalFormData;
  isSaving: boolean;
}>();

defineEmits<{
  'field-change': [];
}>();

</script>