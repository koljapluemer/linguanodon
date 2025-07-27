<script setup lang="ts">
import type { Exercise, ExerciseEmits } from '@/shared/ExerciseTypes';
import TryToRemember from './exercises/TryToRemember.vue';
import Reveal from './exercises/Reveal.vue';

interface Props {
  exercise: Exercise;
}

defineProps<Props>();
const emit = defineEmits<ExerciseEmits>();

const handleRate = (rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy') => {
  emit('rate', rating);
};
</script>

<template>
  <div>
    <TryToRemember 
      v-if="exercise.type === 'try-to-remember'"
      :exercise="exercise"
      @rate="handleRate"
    />
    
    <Reveal 
      v-else-if="exercise.type === 'reveal'"
      :exercise="exercise"
      @rate="handleRate"
    />
    
    <!-- Fallback for unknown exercise types -->
    <div v-else class="alert alert-error">
      <span>Unknown exercise type: {{ exercise.type }}</span>
    </div>
  </div>
</template>