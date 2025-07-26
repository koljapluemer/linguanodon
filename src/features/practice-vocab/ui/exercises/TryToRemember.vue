<script setup lang="ts">
import type { Exercise, ExerciseEmits } from '@/shared/ExerciseTypes';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import ElementInstruction from '@/shared/ui/ElementInstruction.vue';
import RatingButtons from '@/shared/ui/RatingButtons.vue';

interface Props {
  exercise: Exercise;
}

const props = defineProps<Props>();
const emit = defineEmits<ExerciseEmits>();

const handleRate = (rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy') => {
  emit('rate', rating);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Instruction -->
    <ElementInstruction>
      {{ exercise.prompt }}
    </ElementInstruction>

    <!-- Exercise Card -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Vocab Content -->
        <div class="mb-4 text-center">
          <ElementBigText :is-extra-big="true">
            {{ exercise.vocab.content }}
          </ElementBigText>
        </div>

        <!-- Divider -->
        <div class="border-t-2 border-dotted border-base-300 my-4"></div>

        <!-- Solution -->
        <div class="mb-6 text-center">
          <ElementBigText :is-extra-big="true">
            {{ exercise.solution }}
          </ElementBigText>
        </div>
      </div>
    </div>

    <!-- Rating -->
    <RatingButtons 
      prompt="How difficult to remember is this word?" 
      @rate="handleRate" 
    />
  </div>
</template>
