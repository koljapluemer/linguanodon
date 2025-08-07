<script setup lang="ts">
export type ExerciseRating = 'Impossible' | 'Hard' | 'Doable' | 'Easy';

interface Props {
  prompt?: string;
}

interface Emits {
  (e: 'rate', rating: ExerciseRating): void;
}

const { prompt = 'How difficult was this?' } = defineProps<Props>();

const emit = defineEmits<Emits>();

const handleRate = (rating: ExerciseRating) => {
  emit('rate', rating);
};
</script>

<template>
  <div class="space-y-4">
    <p class="text-center text-sm text-base-content/70">{{ prompt }}</p>
    <div class="flex flex-wrap justify-center gap-2">
      <button 
        class="btn btn-error btn-sm"
        @click="handleRate('Impossible')"
      >
        Impossible
      </button>
      <button 
        class="btn btn-warning btn-sm"
        @click="handleRate('Hard')"
      >
        Hard
      </button>
      <button 
        class="btn btn-success btn-sm"
        @click="handleRate('Doable')"
      >
        Doable
      </button>
      <button 
        class="btn btn-primary btn-sm"
        @click="handleRate('Easy')"
      >
        Easy
      </button>
    </div>
  </div>
</template>