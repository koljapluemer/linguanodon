<script setup lang="ts">
import { ref } from "vue";
import type { Exercise, ExerciseEmits } from '@/shared/ExerciseTypes';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import ElementInstruction from '@/shared/ui/ElementInstruction.vue';
import ElementRevealButton from '@/shared/ui/ElementRevealButton.vue';
import RatingButtons from '@/shared/ui/RatingButtons.vue';

interface Props {
  exercise: Exercise;
}

defineProps<Props>();
const emit = defineEmits<ExerciseEmits>();

const isRevealed = ref(false);

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

        <!-- Solution (when revealed) -->
        <div v-if="isRevealed">
          <!-- Divider -->
          <div class="border-t-2 border-dotted border-base-300 my-4"></div>

          <!-- Solution -->
          <div class="mb-6 text-center">
            <ElementBigText :is-extra-big="false">
              {{ exercise.solution }}
            </ElementBigText>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center gap-2 w-full">
      <!-- Reveal Button -->
      <ElementRevealButton v-if="!isRevealed" @click="isRevealed = true" />

      <!-- Rating (when revealed) -->
      <RatingButtons 
        v-if="isRevealed" 
        prompt="How difficult was this?" 
        @rate="handleRate" 
      />
    </div>
  </div>
</template>