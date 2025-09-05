<template>
  <div class="flex flex-wrap gap-4">
    <div class="flex flex-col space-y-1 flex-1">
      <label class=" font-medium">{{ $t('vocabulary.translation') }}</label>
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
        {{ $t('common.add') }}
      </button>
      <button
        v-if="!isNew"
        class="btn btn-sm btn-ghost"
        @click="cancel"
      >
        {{ $t('common.cancel') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TranslationData } from './TranslationData';

const props = defineProps<{
  translation?: Pick<TranslationData, 'content' | 'notes'> & { uid?: string };
  isNew?: boolean;
}>();

const emit = defineEmits<{
  'save': [Omit<TranslationData, 'uid' | 'origins'>];
  'cancel': [];
}>();

const editTranslation = ref<Pick<TranslationData, 'content' | 'notes'>>({
  content: '',
  notes: [],
  ...props.translation
});

function save() {
  if (!editTranslation.value.content?.trim()) return;
  
  const translationToSave: Omit<TranslationData, 'uid' | 'origins'> = {
    content: editTranslation.value.content.trim(),
    priority: 1,
    notes: editTranslation.value.notes || []
  };
  
  emit('save', translationToSave);
  
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