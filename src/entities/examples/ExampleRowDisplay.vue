<template>
  <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
    <div class="flex-1 cursor-pointer" @click="$emit('edit')">
      <div class="flex items-center gap-2 mb-1">
        <span class="badge badge-outline">{{ example.language }}</span>
        <span class="font-medium">{{ example.content || 'No content' }}</span>
      </div>
      <div v-if="example.translation" class="text-sm text-base-content/70">
        → {{ example.translation }}
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
import type { ExampleData } from './ExampleData';

defineProps<{
  example: ExampleData;
}>();

defineEmits<{
  edit: [];
  delete: [];
}>();
</script>