<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <h4 class="font-medium text-sm opacity-70">Front</h4>
      <div class="bg-base-200 p-3 rounded" v-html="exercise.front"></div>
    </div>
    <div>
      <h4 class="font-medium text-sm opacity-70">Options</h4>
      <div class="bg-base-200 p-3 rounded space-y-2">
        <div class="flex items-center gap-2">
          <span class="font-mono">A.</span>
          <span class="text-success font-medium">{{ exercise.correctAnswer }}</span>
          <span class="text-xs opacity-70">(correct)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono">B.</span>
          <span class="text-error">{{ exercise.incorrectAnswer }}</span>
          <span class="text-xs opacity-70">(incorrect)</span>
        </div>
        <div v-if="exercise.context" class="mt-3 pt-3 border-t">
          <span class="text-sm opacity-70">Context:</span>
          <div class="mt-1">{{ exercise.context }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExerciseChooseFromTwo } from '@/entities/Exercises'

defineProps<{ exercise: ExerciseChooseFromTwo }>()
</script>
