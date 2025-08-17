<template>
  <div class="flex flex-wrap gap-4">
    <div class="flex flex-col space-y-1 flex-1">
      <label class="text-sm font-medium">Translation</label>
      <input
        v-model="editTranslation.content"
        class="input input-bordered input-lg w-full"
        placeholder="Add new translation..."
        @keyup.enter="save"
        @keyup.escape="cancel"
      />
    </div>
    
    <div class="flex gap-2 items-end">
      <button
        class="btn btn-sm btn-primary"
        :disabled="!editTranslation.content?.trim()"
        @click="save"
      >
        Add
      </button>
      <button
        v-if="!isNew"
        class="btn btn-sm btn-ghost"
        @click="cancel"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TranslationData } from './TranslationData';

const props = defineProps<{
  translation?: Partial<TranslationData>;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  'save': [TranslationData];
  'cancel': [];
}>();

const editTranslation = ref<Partial<TranslationData>>({
  content: '',
  notes: [],
  ...props.translation
});

function save() {
  if (!editTranslation.value.content?.trim()) return;
  
  const newTranslation: TranslationData = {
    uid: editTranslation.value.uid || crypto.randomUUID(),
    content: editTranslation.value.content.trim(),
    notes: editTranslation.value.notes || []
  };
  
  emit('save', newTranslation);
  
  // Reset for new translations
  if (props.isNew) {
    editTranslation.value = {
      content: '',
      notes: []
    };
  }
}

function cancel() {
  if (props.isNew) {
    editTranslation.value = {
      content: '',
      notes: []
    };
  }
  emit('cancel');
}
</script>