<script setup lang="ts">
import { ref } from 'vue';
import type { MilestoneExercise } from '@/pages/practice/model/Exercise';
import WidgetInstruction from '@/shared/ElementInstruction.vue';
import WidgetBigText from '@/shared/ElementBigText.vue';

interface Props {
  exercise: MilestoneExercise;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const rating = ref<string | null>(null);

/**
 * Handle user rating for milestone difficulty.
 */
function handleRate(r: 'Impossible' | 'Hard' | 'Doable' | 'Easy') {
  rating.value = r;
  emit('rate', r);
}
</script>

<template>
  <div>
    <WidgetInstruction>
      {{ exercise.prompt }}
    </WidgetInstruction>
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <WidgetBigText>
          {{ exercise.milestoneContent }}
        </WidgetBigText>
      </div>
    </div>
    <div class="flex flex-col gap-2 items-center">
      <div class="mb-2 font-semibold">How hard was this milestone?</div>
      <div class="flex gap-2 flex-wrap justify-center">
        <button class="btn btn-error" @click="handleRate('Impossible')">Impossible</button>
        <button class="btn btn-warning" @click="handleRate('Hard')">Hard</button>
        <button class="btn btn-info" @click="handleRate('Doable')">Doable</button>
        <button class="btn btn-success" @click="handleRate('Easy')">Easy</button>
      </div>
      <div v-if="rating" class="mt-4 text-success font-bold">
        You rated: {{ rating }}
      </div>
    </div>
  </div>
</template> 