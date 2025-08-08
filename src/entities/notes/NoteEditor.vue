<template>
  <FormFieldset legend="Note" layout="horizontal">
    <FormField label="Content" full-width>
      <template #default="{ inputId }">
        <textarea
          :id="inputId"
          :value="note.content"
          @input="updateContent(($event.target as HTMLTextAreaElement).value)"
          placeholder="Enter note content..."
          class="textarea textarea-bordered w-full"
          rows="2"
        ></textarea>
      </template>
    </FormField>
    
    <div v-if="showBeforeExerciseOption" class="items-end">
      <FormField label="">
        <template #default="{ inputId }">
          <label :for="inputId" class="cursor-pointer label justify-start gap-2">
            <input
              :id="inputId"
              :checked="note.showBeforeExercise"
              @change="updateShowBeforeExercise(($event.target as HTMLInputElement).checked)"
              type="checkbox"
              class="checkbox checkbox-sm"
            />
            <span class="label-text">Show before exercise</span>
          </label>
        </template>
      </FormField>
    </div>
    
    <div class="flex items-end">
      <button
        type="button"
        @click="$emit('delete')"
        class="btn btn-sm btn-ghost btn-circle text-error"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </FormFieldset>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import type { NoteData } from './NoteData';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';

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