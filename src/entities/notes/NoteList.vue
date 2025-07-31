<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="card-title">Notes</h3>
      <button
        type="button"
        @click="addNote"
        class="btn btn-sm btn-outline"
      >
        <Plus class="w-4 h-4 mr-1" />
        Add Note
      </button>
    </div>
    
    <div v-if="notes.length === 0" class="text-gray-500 text-center py-4">
      No notes yet. Click "Add Note" to get started.
    </div>
    
    <div v-else class="space-y-4">
      <NoteEditor
        v-for="note in notes"
        :key="note.uid"
        :note="note"
        :show-before-exercise-option="showBeforeExerciseOption"
        @update="updateNote"
        @delete="deleteNote(note.uid)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import NoteEditor from './NoteEditor.vue';
import type { NoteData } from './NoteData';

defineProps<{
  notes: NoteData[];
  showBeforeExerciseOption?: boolean;
}>();

const emit = defineEmits<{
  add: [];
  update: [note: NoteData];
  delete: [uid: string];
}>();

function addNote() {
  emit('add');
}

function updateNote(note: NoteData) {
  emit('update', note);
}

function deleteNote(uid: string) {
  emit('delete', uid);
}
</script>