<template>
  <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
    <div class="flex-1 cursor-pointer" @click="$emit('edit')">
      <div class="flex items-center gap-2 mb-1">
        <span class="badge badge-outline">
          <LanguageDisplay :language-code="vocab.language" compact />
        </span>
        <span class="font-medium">{{ vocab.content }}</span>
      </div>
      <div class="text-sm text-base-content/70">
        {{ vocab.translations.join(', ') }}
      </div>
    </div>
    <button
      class="btn btn-sm btn-ghost text-error"
      @click="$emit('delete')"
    >
      <X class="w-4 h-4" />
    </button>
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