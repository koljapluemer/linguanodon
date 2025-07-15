<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <h4 class="font-medium text-sm opacity-70">Front</h4>
      <div class="bg-base-200 p-3 rounded" v-html="exercise.front"></div>
    </div>
    <div>
      <h4 class="font-medium text-sm opacity-70">Reference Translation</h4>
      <div class="bg-base-200 p-3 rounded" v-html="exercise.back"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExerciseFreeTranslation } from '@/entities/Exercises'

defineProps<{ exercise: ExerciseFreeTranslation }>()
</script>
