<template>
  <div class="card bg-base-100 border-2 border-dashed border-base-300">
    <div class="card-body p-4">
      <FormFieldset legend="Example Details">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Language -->
          <FormField label="Language" required>
            <template #default="{ inputId }">
              <LanguageDropdown
                :id="inputId"
                v-model="localExample.language"
                placeholder="Select target language"
                required
                size="sm"
                :default-language="defaultLanguage"
              />
            </template>
          </FormField>

          <!-- Content -->
          <FormField label="Content">
            <template #default="{ inputId, inputClassString }">
              <input
                :id="inputId"
                v-model="localExample.content"
                type="text"
                placeholder="Example sentence"
                :class="inputClassString + ' input-sm'"
              />
            </template>
          </FormField>

          <!-- Translation -->
          <FormField label="Translation">
            <template #default="{ inputId, inputClassString }">
              <input
                :id="inputId"
                v-model="localExample.translation"
                type="text"
                placeholder="Translation"
                :class="inputClassString + ' input-sm'"
              />
            </template>
          </FormField>
        </div>
      </FormFieldset>

      <div class="flex justify-end gap-2 mt-4">
        <button
          class="btn btn-sm btn-ghost"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="btn btn-sm btn-primary"
          :disabled="!isValid"
          @click="handleSave"
        >
          {{ isNew ? 'Add' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ExampleData } from './ExampleData';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';

const props = defineProps<{
  example: Partial<ExampleData>;
  isNew?: boolean;
  defaultLanguage?: string;
}>();

const emit = defineEmits<{
  save: [ExampleData];
  cancel: [];
}>();

const localExample = ref({ 
  language: props.example.language || (props.isNew ? props.defaultLanguage : '') || '', 
  ...props.example 
} as ExampleData);

// Watch for changes in example prop
watch(() => props.example, (newExample) => {
  localExample.value = { 
    language: newExample.language || (props.isNew ? props.defaultLanguage : '') || '', 
    ...newExample 
  } as ExampleData;
}, { deep: true });

const isValid = computed(() => {
  return localExample.value.language?.trim() &&
         (localExample.value.content?.trim() || localExample.value.translation?.trim());
});

function handleSave() {
  if (!isValid.value) return;

  const exampleData: ExampleData = {
    uid: localExample.value.uid || crypto.randomUUID(),
    language: localExample.value.language!.trim(),
    content: localExample.value.content?.trim(),
    translation: localExample.value.translation?.trim(),
    associatedVocab: localExample.value.associatedVocab || [],
    tasks: localExample.value.tasks || [],
    notes: localExample.value.notes || [],
    links: localExample.value.links || [],
    progress: localExample.value.progress || {
      due: new Date(),
      stability: 2.5,
      difficulty: 5.0,
      elapsed_days: 0,
      scheduled_days: 1,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      streak: 0,
      level: -1
    },
    isUserCreated: localExample.value.isUserCreated ?? true,
    lastDownloadedAt: localExample.value.lastDownloadedAt || null
  };

  emit('save', exampleData);
}
</script>