<template>
  <div class="p-3 bg-base-200 rounded-lg">
    <div class="flex items-start gap-2">
      <div class="flex-1">
        <div class="flex items-start gap-2 mb-2">
          <div class="whitespace-pre-wrap  flex-1">
            {{ note.content || '(Empty note)' }}
          </div>
          <div v-if="note.noteType" class="badge badge-outline badge-sm">
            {{ note.noteType }}
          </div>
        </div>
        <div v-if="note.showBeforeExercise" class="text-xs text-blue-600 ">
          {{ $t('notes.types.beforeExercise') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NoteData } from './NoteData';

defineProps<{
  note: NoteData;
}>();
</script>