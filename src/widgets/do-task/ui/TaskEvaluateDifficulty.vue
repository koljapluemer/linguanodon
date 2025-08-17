<template>
  <div class="big-card">
    <div class="card-body items-center text-center">
      <div class="card-title">How difficult was this task?</div>

      <div class="card-actions">

        <button class="btn btn-sm btn-error" :class="difficultyRating === Rating.Again ? 'btn-primary' : 'btn-outline'"
          @click="handleRating(Rating.Again)">
          Impossible
        </button>
        <button class="btn btn-sm btn-warning" :class="difficultyRating === Rating.Hard ? 'btn-primary' : 'btn-outline'"
          @click="handleRating(Rating.Hard)">
          Difficult
        </button>
        <button class="btn btn-sm btn-info" :class="difficultyRating === Rating.Good ? 'btn-primary' : 'btn-outline'"
          @click="handleRating(Rating.Good)">
          Doable
        </button>
        <button class="btn btn-sm btn-success" :class="difficultyRating === Rating.Easy ? 'btn-primary' : 'btn-outline'"
          @click="handleRating(Rating.Easy)">
          Easy
        </button>
      </div>
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