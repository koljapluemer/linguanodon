<template>
  <div class="border rounded-lg p-4">
    <div class="flex justify-between items-start gap-4">
      <div class="flex-1">
        <textarea
          :value="note.content"
          @input="updateContent(($event.target as HTMLTextAreaElement).value)"
          placeholder="Enter note content..."
          class="textarea textarea-bordered w-full"
          rows="2"
        ></textarea>
        
        <div v-if="showBeforeExerciseOption" class="form-control mt-2">
          <label class="cursor-pointer label justify-start gap-2">
            <input
              :checked="note.showBeforeExercise"
              @change="updateShowBeforeExercise(($event.target as HTMLInputElement).checked)"
              type="checkbox"
              class="checkbox checkbox-sm"
            />
            <span class="label-text">Show before exercise</span>
          </label>
        </div>
      </div>
      
      <button
        type="button"
        @click="$emit('delete')"
        class="btn btn-sm btn-ghost btn-circle text-error"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import type { NoteData } from './NoteData';

const props = defineProps<{
  note: NoteData;
  showBeforeExerciseOption?: boolean;
}>();

const emit = defineEmits<{
  update: [note: NoteData];
  delete: [];
}>();

function updateContent(content: string) {
  emit('update', { ...props.note, content });
}

function updateShowBeforeExercise(showBeforeExercise: boolean) {
  emit('update', { ...props.note, showBeforeExercise });
}
</script>