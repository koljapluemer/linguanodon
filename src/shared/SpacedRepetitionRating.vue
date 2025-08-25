<template>
  <div class="flex gap-2 justify-center">
    <button @click="emit('rating', 1)" class="btn btn-error">Again</button>
    <button @click="emit('rating', 2)" class="btn btn-warning">Hard</button>
    <button @click="emit('rating', 3)" class="btn btn-info">Good</button>
    <button @click="emit('rating', 4)" class="btn btn-success">Easy</button>
  </div>
</template>

<script setup lang="ts">
import type { Rating } from 'ts-fsrs';

const emit = defineEmits<{
  rating: [rating: Rating];
}>();
</script>