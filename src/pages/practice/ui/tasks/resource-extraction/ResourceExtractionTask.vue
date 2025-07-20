<script setup lang="ts">
import { ref } from 'vue';
import type { ResourceExercise } from '../../../model/Exercise';
import type { WordRepository } from '@/entities/linguisticUnits/words/WordRepository';
import type { SentenceRepository } from '@/entities/linguisticUnits/sentences/SentenceRepository';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';
import WidgetInstruction from '@/shared/ElementInstruction.vue';
import WidgetBigText from '@/shared/ElementBigText.vue';
import ResourceExtractionFormControl from '@/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormControl.vue';

interface Props {
  exercise: ResourceExercise;
  wordRepository: WordRepository;
  sentenceRepository: SentenceRepository;
  languages: LanguageIdentifier[];
}

interface Emits {
  (e: 'skip'): void;
  (e: 'done-for-now'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const showFutureWorkScreen = ref(false);

/**
 * Handle skip action.
 */
const handleSkip = () => {
  emit('skip');
};

/**
 * Handle done for now action.
 */
const handleDoneForNow = () => {
  showFutureWorkScreen.value = true;
};

/**
 * Handle future work response.
 */
const handleFutureWorkResponse = () => {
  // For now, just continue regardless of the answer
  // This is a placeholder for future functionality
  emit('done-for-now');
};
</script>

<template>
  <div v-if="!showFutureWorkScreen">
    <!-- Task Instruction -->
    <WidgetInstruction>
      {{ exercise.prompt }}
    </WidgetInstruction>

    <!-- Resource Information -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h3 class="card-title text-lg font-bold">{{ exercise.resource.title }}</h3>
        
        <div class="space-y-3">
          <!-- Link -->
          <div v-if="exercise.resource.link">
            <a 
              :href="exercise.resource.link" 
              target="_blank" 
              rel="noopener noreferrer"
              class="link link-primary"
            >
              View Resource
            </a>
          </div>

          <!-- Prompt -->
          <div v-if="exercise.resource.prompt">
            <p class="text-sm text-base-content/80">{{ exercise.resource.prompt }}</p>
          </div>

          <!-- Extra Info -->
          <div v-if="exercise.resource.extraInfo">
            <div class="bg-base-200 p-3 rounded-lg">
              <p class="text-sm">{{ exercise.resource.extraInfo }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resource Extraction Form -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h4 class="card-title text-md font-semibold mb-4">Add Words and Sentences</h4>
        
        <ResourceExtractionFormControl
          :extracted-units="exercise.resource.extractedUnits"
          :word-repository="wordRepository"
          :sentence-repository="sentenceRepository"
          :languages="languages"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center gap-4">
      <button 
        class="btn btn-outline"
        @click="handleSkip"
      >
        Skip
      </button>
      <button 
        class="btn btn-primary"
        @click="handleDoneForNow"
      >
        Done For Now
      </button>
    </div>
  </div>

  <!-- Future Work Screen -->
  <div v-else class="text-center space-y-6">
    <WidgetBigText :is-extra-big="false">
      Do you want to work on this resource in the future?
    </WidgetBigText>

    <div class="flex justify-center gap-4">
      <button 
        class="btn btn-primary"
        @click="handleFutureWorkResponse"
      >
        Yes
      </button>
      <button 
        class="btn btn-outline"
        @click="handleFutureWorkResponse"
      >
        No
      </button>
    </div>
  </div>
</template> 