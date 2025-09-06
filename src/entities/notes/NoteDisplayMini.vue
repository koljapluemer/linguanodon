<template>
  <div v-if="note" class="bg-base-200 rounded-lg px-3 py-2 text-sm border-l-4 border-info">
    <div class="text-xs text-base-content/70 mb-1 font-medium">
      {{ note.noteType || 'Note' }}
    </div>
    <div class="text-base-content whitespace-pre-wrap">
      {{ note.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NoteData } from './NoteData';

interface Props {
  note: NoteData | null | undefined;
}

defineProps<Props>();
</script>