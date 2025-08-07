<template>
  <div class="space-y-4">
    <div class="text-center">
      <h3 class="text-lg font-semibold mb-2">How did you do?</h3>
      <p class="text-base-content/70 mb-4">Help us understand your performance</p>
    </div>

    <div class="space-y-4">
      <!-- Correctness Rating -->
      <div class="space-y-2">
        <label class="text-sm font-medium">How correct was your performance?</label>
        <div class="flex justify-center gap-2">
          <button
            v-for="rating in [1, 2, 3, 4, 5]"
            :key="rating"
            class="btn btn-sm"
            :class="correctnessRating === rating ? 'btn-primary' : 'btn-outline'"
            @click="correctnessRating = rating"
          >
            {{ rating }}
          </button>
        </div>
        <div class="text-xs text-center text-base-content/60">
          1 = Completely wrong, 5 = Perfect
        </div>
      </div>

      <!-- Difficulty Rating -->
      <div class="space-y-2">
        <label class="text-sm font-medium">How difficult was this task?</label>
        <div class="flex justify-center gap-2">
          <button
            v-for="rating in [1, 2, 3, 4, 5]"
            :key="rating"
            class="btn btn-sm"
            :class="difficultyRating === rating ? 'btn-primary' : 'btn-outline'"
            @click="difficultyRating = rating"
          >
            {{ rating }}
          </button>
        </div>
        <div class="text-xs text-center text-base-content/60">
          1 = Very easy, 5 = Very hard
        </div>
      </div>
    </div>

    <div class="flex justify-center">
      <button 
        class="btn btn-primary" 
        :disabled="!correctnessRating || !difficultyRating"
        @click="handleSubmit"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Emits {
  (e: 'evaluation', evaluation: { correctnessRating: number; difficultyRating: number }): void;
}

const emit = defineEmits<Emits>();

const correctnessRating = ref<number | null>(null);
const difficultyRating = ref<number | null>(null);

const handleSubmit = () => {
  if (correctnessRating.value && difficultyRating.value) {
    emit('evaluation', {
      correctnessRating: correctnessRating.value,
      difficultyRating: difficultyRating.value
    });
  }
};
</script>