<script setup lang="ts">
import { Eye } from 'lucide-vue-next';

interface Emits {
  (e: 'click'): void;
}

const emit = defineEmits<Emits>();
</script>

<template>
  <button
    class="btn btn-secondary"
    @click="emit('click')"
  >
    <Eye class="w-4 h-4 mr-2" />
    Reveal
  </button>
</template>
