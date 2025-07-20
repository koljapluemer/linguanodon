<script setup lang="ts">
interface Props {
  prompt: string;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div class="space-y-4">
    <!-- Prompt -->
    <div class="text-center">
      <p class="text-lg font-medium">{{ prompt }}</p>
    </div>

    <!-- Rating Buttons -->
    <div class="flex gap-2 justify-center">
      <button
        class="btn btn-error"
        @click="emit('rate', 'Impossible')"
      >
        Impossible
      </button>
      <button
        class="btn btn-warning"
        @click="emit('rate', 'Hard')"
      >
        Hard
      </button>
      <button
        class="btn btn-info"
        @click="emit('rate', 'Doable')"
      >
        Doable
      </button>
      <button
        class="btn btn-success"
        @click="emit('rate', 'Easy')"
      >
        Easy
      </button>
    </div>
  </div>
</template>
