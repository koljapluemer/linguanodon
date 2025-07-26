<script setup lang="ts">
import { ref } from 'vue';
import type { ResourceExercise } from '../../../model/Exercise';
import type { WordRepository } from '@/entities/linguisticUnits/words/WordRepository';
import type { SentenceRepository } from '@/entities/linguisticUnits/sentences/SentenceRepository';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';
import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';
import type { ResourceRepository } from '@/entities/resources/ResourceRepository';
import type { ResourceData } from '@/entities/resources/ResourceData';
import WidgetInstruction from '@/shared/ElementInstruction.vue';
import WidgetBigText from '@/shared/ElementBigText.vue';
import ResourceExtractionFormControl from '@/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormControl.vue';

interface Props {
  exercise: ResourceExercise;
  wordRepository: WordRepository;
  sentenceRepository: SentenceRepository;
  languages: LanguageIdentifier[];
  resourceRepository: ResourceRepository;
}

interface Emits {
  (e: 'skip'): void;
  (e: 'done-for-now'): void;
}

const emit = defineEmits<Emits>();

const props = defineProps<Props>();

const showFutureWorkScreen = ref(false);

/**
 * Convert a reactive resource object to a plain object for IndexedDB storage.
 */
function convertResourceToPlainObject(resource: ResourceData): ResourceData {
  return {
    uid: resource.uid,
    title: resource.title,
    link: resource.link,
    prompt: resource.prompt,
    extraInfo: resource.extraInfo,
    language: resource.language,
    priority: resource.priority,
    isUserCreated: resource.isUserCreated,
    isExploited: resource.isExploited,
    lastDownloadedAt: resource.lastDownloadedAt,
    lastIteratedAt: resource.lastIteratedAt,
    nextShownEarliestAt: resource.nextShownEarliestAt,
    extractedUnits: resource.extractedUnits.map((unit: LinguisticUnitIdentification) => ({
      type: unit.type,
      language: unit.language,
      content: unit.content
    }))
  };
}

/**
 * Handle when a linguistic unit is saved.
 */
const handleUnitSaved = async (unit: LinguisticUnitIdentification) => {
  try {
    // Add the unit to the resource's extractedUnits if it's not already there
    const existingUnit = props.exercise.resource.extractedUnits.find(
      u => u.type === unit.type && u.language === unit.language && u.content === unit.content
    );
    
    if (!existingUnit) {
      props.exercise.resource.extractedUnits.push(unit);
      
      // Convert reactive object to plain object before saving
      const resourceToSave = convertResourceToPlainObject(props.exercise.resource);
      
      // Save the updated resource
      await props.resourceRepository.update(resourceToSave);
    }
  } catch (error) {
    console.error('Failed to update resource with new unit:', error);
  }
};

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
          :on-unit-saved="handleUnitSaved"
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