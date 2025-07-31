<template>
  <div class="card bg-base-100 border-2 border-dashed border-base-300">
    <div class="card-body p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Language -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Language *</span>
          </label>
          <input
            v-model="localExample.language"
            type="text"
            placeholder="e.g., Italian"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Content -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Content</span>
          </label>
          <input
            v-model="localExample.content"
            type="text"
            placeholder="Example sentence"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Translation -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Translation</span>
          </label>
          <input
            v-model="localExample.translation"
            type="text"
            placeholder="Translation"
            class="input input-bordered input-sm"
          />
        </div>
      </div>

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

const props = defineProps<{
  example: Partial<ExampleData>;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  save: [ExampleData];
  cancel: [];
}>();

const localExample = ref<Partial<ExampleData>>({ ...props.example });

// Watch for changes in example prop
watch(() => props.example, (newExample) => {
  localExample.value = { ...newExample };
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
    associatedTasks: localExample.value.associatedTasks || [],
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