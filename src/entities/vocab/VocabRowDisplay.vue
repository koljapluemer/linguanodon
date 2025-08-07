<template>
  <div class="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
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
        v-if="allowEditOnClick"
        class="btn btn-sm btn-ghost"
        @click="$emit('edit')"
      >
        <Edit class="w-4 h-4" />
      </button>
      <button
        v-if="showDisconnectButton"
        class="btn btn-sm btn-ghost text-warning"
        @click="$emit('disconnect')"
        title="Disconnect from resource"
      >
        <Unlink class="w-4 h-4" />
      </button>
      <button
        v-if="showDeleteButton"
        class="btn btn-sm btn-ghost text-error"
        @click="$emit('delete')"
        title="Delete vocabulary"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, Edit, Unlink } from 'lucide-vue-next';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';
import type { VocabData } from './vocab/VocabData';

defineProps<{
  vocab: VocabData;
  allowEditOnClick?: boolean;
  showDeleteButton?: boolean;
  showDisconnectButton?: boolean;
}>();

defineEmits<{
  edit: [];
  delete: [];
  disconnect: [];
}>();
</script>