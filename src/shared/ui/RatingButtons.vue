<script setup lang="ts">
import type { ExerciseRating } from '@/shared/ExerciseTypes';

interface Props {
  prompt?: string;
}

interface Emits {
  (e: 'rate', rating: ExerciseRating): void;
}

const { prompt = 'How difficult was this?' } = withDefaults(defineProps<Props>(), {
  prompt: 'How difficult was this?'
});

const emit = defineEmits<Emits>();

const handleRate = (rating: ExerciseRating) => {
  console.log('RatingButtons: Rating clicked:', rating);
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