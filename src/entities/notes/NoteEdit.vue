<template>
  <div class="space-y-4">
    <!-- Content and Note Type in one row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 flex flex-col space-y-1">
        <label class=" font-medium">{{ $t('notes.content') }}</label>
        <textarea
          v-model="tempNote.content"
          placeholder="Enter note content..."
          class="textarea textarea-bordered w-full"
          rows="3"
        ></textarea>
      </div>
      
      <div class="flex flex-col space-y-1">
        <label class=" font-medium">{{ $t('notes.noteType') }}</label>
        <input
          v-model="tempNote.noteType"
          type="text"
          placeholder="e.g., definition, example"
          class="input input-bordered w-full"
        />
      </div>
    </div>

    <!-- Show Before Exercise option -->
    <div v-if="showBeforeExerciseOption" class="flex items-center">
      <label class="cursor-pointer label justify-start gap-2">
        <input
          v-model="tempNote.showBeforeExercise"
          type="checkbox"
          class="checkbox checkbox-sm"
        />
        <span class="label-text">{{ $t('notes.showBeforeExercise') }}</span>
      </label>
    </div>

    <!-- Confirm/Cancel buttons -->
    <div class="flex gap-2 justify-end">
      <button
        @click="cancelEdit"
        class="btn btn-sm btn-ghost"
      >
        <X class="w-4 h-4" />
        {{ $t('common.cancel') }}
      </button>
      <button
        @click="saveEdit"
        class="btn btn-sm btn-success"
      >
        <Check class="w-4 h-4" />
        {{ $t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Check, X } from 'lucide-vue-next';
import type { NoteData } from './NoteData';

interface Props {
  note: NoteData;
  showBeforeExerciseOption?: boolean;
}

interface Emits {
  (e: 'update:note', value: NoteData): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tempNote = ref<NoteData>({
  uid: props.note.uid,
  content: props.note.content || '',
  noteType: props.note.noteType || '',
  showBeforeExercise: props.note.showBeforeExercise || false
});

function saveEdit() {
  // Don't save if content is empty
  if (!tempNote.value.content.trim()) {
    alert('Note content is required');
    return;
  }
  
  // Convert empty strings back to undefined for optional fields
  const noteToSave: NoteData = {
    uid: tempNote.value.uid,
    content: tempNote.value.content.trim(),
    noteType: tempNote.value.noteType?.trim() || undefined,
    showBeforeExercise: tempNote.value.showBeforeExercise
  };
  
  emit('update:note', noteToSave);
  emit('close');
}

function cancelEdit() {
  tempNote.value = {
    uid: props.note.uid,
    content: props.note.content || '',
    noteType: props.note.noteType || '',
    showBeforeExercise: props.note.showBeforeExercise || false
  };
  emit('close');
}
</script>