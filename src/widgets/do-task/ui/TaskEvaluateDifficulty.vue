<template>
  <div class="space-y-4">
    <div class="text-center">
      <h3 class="text-lg font-semibold mb-2">How difficult was this task?</h3>
    </div>

    <div class="flex justify-center gap-2">
      <button
        class="btn btn-sm btn-success"
        :class="difficultyRating === Rating.Easy ? 'btn-primary' : 'btn-outline'"
        @click="handleRating(Rating.Easy)"
      >
        Easy
      </button>
      <button
        class="btn btn-sm btn-info"
        :class="difficultyRating === Rating.Good ? 'btn-primary' : 'btn-outline'"
        @click="handleRating(Rating.Good)"
      >
        Doable
      </button>
      <button
        class="btn btn-sm btn-warning"
        :class="difficultyRating === Rating.Hard ? 'btn-primary' : 'btn-outline'"
        @click="handleRating(Rating.Hard)"
      >
        Difficult
      </button>
      <button
        class="btn btn-sm btn-error"
        :class="difficultyRating === Rating.Again ? 'btn-primary' : 'btn-outline'"
        @click="handleRating(Rating.Again)"
      >
        Impossible
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Rating } from 'ts-fsrs';

interface Emits {
  (e: 'rating', rating: Rating): void;
}

const emit = defineEmits<Emits>();

const difficultyRating = ref<Rating | null>(null);

const handleRating = (rating: Rating) => {
  difficultyRating.value = rating;
  emit('rating', rating);
};
</script>