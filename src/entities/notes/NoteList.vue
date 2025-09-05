<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-sm font-medium  ">Notes</h3>
      <button
        type="button"
        @click="addNewNote"
        class="btn btn-sm btn-outline"
      >
        <Plus class="w-4 h-4 mr-1" />
        Add Note
      </button>
    </div>
    
    <div v-if="notes.length === 0" class=" text-center py-4">
      No notes yet. Click "Add Note" to get started.
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="(note, index) in notes"
        :key="note.uid"
      >
        <NoteEdit
          v-if="editingIndex === index"
          :note="note"
          :show-before-exercise-option="showBeforeExerciseOption"
          @update:note="(updatedNote) => updateNote(updatedNote)"
          @close="editingIndex = null"
        />
        <div v-else class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <NoteDisplay :note="note" />
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="editingIndex = index"
              class="btn btn-sm btn-ghost"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click="deleteNote(note.uid)"
              class="btn btn-ghost btn-circle text-error flex-shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- New note creation form -->
    <div v-if="isCreatingNew">
      <NoteEdit
        :note="{ uid: '', content: '', noteType: undefined, showBeforeExercise: false }"
        :show-before-exercise-option="showBeforeExerciseOption"
        @update:note="(newNote) => { $emit('add', newNote); isCreatingNew = false; }"
        @close="isCreatingNew = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Edit, X } from 'lucide-vue-next';
import NoteEdit from './NoteEdit.vue';
import NoteDisplay from './NoteDisplay.vue';
import type { NoteData } from './NoteData';

defineProps<{
  notes: NoteData[];
  showBeforeExerciseOption?: boolean;
}>();

const emit = defineEmits<{
  add: [note: NoteData];
  update: [note: NoteData];
  delete: [uid: string];
}>();

const editingIndex = ref<number | null>(null);
const isCreatingNew = ref(false);

function addNewNote() {
  isCreatingNew.value = true;
}

function updateNote(note: NoteData) {
  emit('update', note);
  editingIndex.value = null;
}

function deleteNote(uid: string) {
  emit('delete', uid);
}
</script>