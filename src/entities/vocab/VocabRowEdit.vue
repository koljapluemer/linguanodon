<template>
  <div class="card bg-base-100 border-2 border-dashed border-base-300">
    <div class="card-body p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Content -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Content *</span>
          </label>
          <input
            v-model="localVocab.content"
            type="text"
            placeholder="Vocabulary word or phrase"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Language -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Language *</span>
          </label>
          <input
            v-model="localVocab.language"
            type="text"
            placeholder="e.g., Italian"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Pronunciation -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Pronunciation</span>
          </label>
          <input
            v-model="localVocab.pronunciation"
            type="text"
            placeholder="Phonetic pronunciation"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Translations -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Translations *</span>
          </label>
          <input
            v-model="translationsText"
            type="text"
            placeholder="Comma-separated translations"
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
import type { VocabData } from './vocab/VocabData';
import { createEmptyCard } from 'ts-fsrs';

const props = defineProps<{
  vocab: Partial<VocabData>;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  save: [VocabData];
  cancel: [];
}>();

const localVocab = ref<Partial<VocabData>>({ ...props.vocab });
const translationsText = ref(Array.isArray(props.vocab.translations) ? props.vocab.translations.join(', ') : '');

// Watch for changes in vocab prop
watch(() => props.vocab, (newVocab) => {
  localVocab.value = { ...newVocab };
  translationsText.value = Array.isArray(newVocab.translations) ? newVocab.translations.join(', ') : '';
}, { deep: true });

const isValid = computed(() => {
  return localVocab.value.content?.trim() &&
         localVocab.value.language?.trim() &&
         translationsText.value.trim();
});

function handleSave() {
  if (!isValid.value) return;

  const translations = translationsText.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  const vocabData: VocabData = {
    id: localVocab.value.id || crypto.randomUUID(),
    content: localVocab.value.content!.trim(),
    language: localVocab.value.language!.trim(),
    pronunciation: localVocab.value.pronunciation?.trim() || '',
    translations,
    notes: localVocab.value.notes || [],
    links: localVocab.value.links || [],
    associatedTasks: localVocab.value.associatedTasks || [],
    progress: localVocab.value.progress || {
      ...createEmptyCard(),
      streak: 0,
      level: -1
    }
  };

  emit('save', vocabData);
}
</script>