<template>
  <div class="flex justify-center gap-4">
    <button 
      class="btn btn-sm btn-error btn-outline" 
      @click="$emit('skipAndDeactivate')"
    >
      Skip and Deactivate
    </button>
    <button 
      class="btn btn-sm btn-ghost" 
      @click="$emit('notNow')"
    >
      Not now
    </button>
    <button 
      class="btn btn-primary" 
      :disabled="!isDoneEnabled"
      @click="$emit('done')"
    >
      Done
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isDoneEnabled: boolean;
}

interface Emits {
  (e: 'skipAndDeactivate'): void;
  (e: 'notNow'): void;
  (e: 'done'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>