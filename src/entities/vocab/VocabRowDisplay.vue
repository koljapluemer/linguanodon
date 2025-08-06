<template>
  <div class="flex items-center gap-4 p-3 bg-base-200 rounded-lg cursor-pointer" @click="$emit('edit')">
    <!-- Language -->
    <div class="w-32">
      <span class="badge badge-outline">
        <LanguageDisplay :language-code="vocab.language" compact />
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <span class="font-medium">{{ vocab.content || '...' }}</span>
    </div>

    <!-- Translations -->
    <div class="flex-1 font-medium">
      {{ vocab.translations.join(', ') || '(no translations)' }}
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        class="btn btn-sm btn-ghost text-error"
        @click.stop="$emit('delete')"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';
import type { VocabData } from './vocab/VocabData';

defineProps<{
  vocab: VocabData;
}>();

defineEmits<{
  edit: [];
  delete: [];
}>();
</script>