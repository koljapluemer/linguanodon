<script setup lang="ts">
import { ref } from 'vue';
import type { ImmersionContentExercise } from '@/pages/practice/model/Exercise';
import WidgetInstruction from '@/shared/ElementInstruction.vue';
import WidgetBigText from '@/shared/ElementBigText.vue';
import ResourceExtractionFormControl from '@/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormControl.vue';
import { WordDexieRepository } from '@/entities/linguisticUnits/words/WordDexieRepository';
import { SentenceDexieRepository } from '@/entities/linguisticUnits/sentences/SentenceDexieRepository';

interface Props {
  exercise: ImmersionContentExercise;
}

interface Emits {
  (e: 'rate', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy'): void;
  (e: 'unit-saved'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const rating = ref<string | null>(null);
const wordRepository = new WordDexieRepository();
const sentenceRepository = new SentenceDexieRepository();

/**
 * Handle user rating for immersion content understanding.
 */
function handleRate(r: 'Impossible' | 'Hard' | 'Doable' | 'Easy') {
  rating.value = r;
  emit('rate', r);
}
/**
 * Emit when a unit is saved.
 */
function handleUnitSaved() {
  emit('unit-saved');
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
          {{ exercise.immersionContent.title }}
        </WidgetBigText>
        <div class="mb-2">
          <a :href="exercise.immersionContent.link" target="_blank" class="link link-primary">
            Open Content
          </a>
        </div>
        <div class="mb-2 text-sm text-gray-600">
          {{ exercise.immersionContent.prompt }}
        </div>
        <div v-if="exercise.immersionContent.extraInfo" class="mb-2 text-xs text-gray-500">
          {{ exercise.immersionContent.extraInfo }}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 items-center mb-6">
      <div class="mb-2 font-semibold">How well did you understand this content?</div>
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
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Extracted Units</h2>
        <p class="text-sm text-gray-600 mb-4">
          Extract words and sentences you found useful from this content.
        </p>
        <ResourceExtractionFormControl
          :extracted-units="exercise.immersionContent.extractedUnits"
          :word-repository="wordRepository"
          :sentence-repository="sentenceRepository"
          :languages="[ { code: exercise.immersionContent.language, name: exercise.immersionContent.language } ]"
          :on-unit-saved="handleUnitSaved"
        />
      </div>
    </div>
  </div>
</template> 