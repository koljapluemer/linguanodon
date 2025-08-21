<template>
  <div class="flex items-center gap-2 p-2 border rounded">
    <div v-if="!isEditing" class="flex-1 cursor-pointer" @click="startEditing">
      <div class="text-lg">{{ translation.content }}</div>
    </div>
    
    <div v-else class="flex-1">
      <div class="flex flex-col space-y-1">
        <label class="text-sm font-medium">Translation</label>
        <input
          v-model="editTranslation.content"
          class="input input-bordered input-lg w-full"
          placeholder="Translation content"
          @keyup.enter="save"
          @keyup.escape="cancel"
        />
      </div>
    </div>
    
    <div class="flex gap-2">
      <button
        v-if="isEditing"
        class="btn btn-sm btn-primary"
        @click="save"
      >
        Save
      </button>
      <button
        v-if="isEditing"
        class="btn btn-sm btn-ghost"
        @click="cancel"
      >
        Cancel
      </button>
      <button
        v-if="showDeleteButton && !isEditing"
        class="btn btn-sm btn-error"
        @click="$emit('delete')"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TranslationData } from './TranslationData';

const props = defineProps<{
  translation: TranslationData;
  allowEditOnClick?: boolean;
  showDeleteButton?: boolean;
}>();

const emit = defineEmits<{
  'save': [TranslationData];
  'delete': [];
}>();

const isEditing = ref(false);
const editTranslation = ref<TranslationData>({ ...props.translation });

function startEditing() {
  if (!props.allowEditOnClick) return;
  
  isEditing.value = true;
  editTranslation.value = { ...props.translation };
}

function save() {
  emit('save', { ...editTranslation.value });
  isEditing.value = false;
}

function cancel() {
  isEditing.value = false;
  editTranslation.value = { ...props.translation };
}
</script>