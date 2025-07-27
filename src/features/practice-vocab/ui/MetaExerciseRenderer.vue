<script setup lang="ts">
import type { Exercise, ExerciseEmits } from '@/shared/ExerciseTypes';
import TryToRemember from './exercises/TryToRemember.vue';
import Reveal from './exercises/Reveal.vue';
import ChooseFromTwo from './exercises/ChooseFromTwo.vue';
import ChooseFromFour from './exercises/ChooseFromFour.vue';

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
    
    <ChooseFromTwo
      v-else-if="exercise.type === 'choose-from-two-vocab-to-translation' || exercise.type === 'choose-from-two-translation-to-vocab'"
      :exercise="exercise"
      @rate="handleRate"
    />
    
    <ChooseFromFour
      v-else-if="exercise.type === 'choose-from-four-vocab-to-translation' || exercise.type === 'choose-from-four-translation-to-vocab'"
      :exercise="exercise"
      @rate="handleRate"
    />
    
    <!-- Fallback for unknown exercise types -->
    <div v-else class="alert alert-error">
      <span>Unknown exercise type: {{ exercise.type }}</span>
    </div>
  </div>
</template>