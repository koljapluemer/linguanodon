<template>
  <div>
    <!-- Display Mode -->
    <VocabRowDisplay
      v-if="!isEditing"
      :vocab="vocab"
      :allow-edit-on-click="allowEditOnClick"
      @edit="startEditing"
      @delete="$emit('delete')"
    />
    
    <!-- Edit Mode -->
    <VocabRowEdit
      v-else
      :vocab="vocab"
      :default-language="defaultLanguage"
      @save="handleSave"
      @cancel="cancelEditing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { VocabData } from './vocab/VocabData';
import VocabRowDisplay from './VocabRowDisplay.vue';
import VocabRowEdit from './VocabRowEdit.vue';

const props = defineProps<{
  vocab: VocabData;
  defaultLanguage?: string;
  allowEditOnClick?: boolean;
}>();

const emit = defineEmits<{
  save: [VocabData];
  delete: [];
}>();

// Per-row edit state
const isEditing = ref(false);

function startEditing() {
  if (props.allowEditOnClick) {
    isEditing.value = true;
  }
}

function cancelEditing() {
  isEditing.value = false;
}

function handleSave(updatedVocab: VocabData) {
  isEditing.value = false;
  emit('save', updatedVocab);
}
</script>