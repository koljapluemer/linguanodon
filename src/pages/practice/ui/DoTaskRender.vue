<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import type { Exercise } from "../model/Exercise";
import type { LanguageIdentifier } from "@/shared/LanguageIdentifier";
import { TaskRegistry } from "./tasks";
import { wordService, sentenceService } from "@/entities/linguisticUnits";
import { languageService } from "@/entities/languages";
import { resourceService } from "@/entities/resources";

interface Props {
  exercise: Exercise;
}

interface Emits {
  (e: 'complete-exercise', rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const languages = ref<LanguageIdentifier[]>([]);

/**
 * Load languages on component mount.
 */
onMounted(async () => {
  try {
    languages.value = await languageService.getAll();
  } catch (error) {
    console.error('Failed to load languages:', error);
    languages.value = [];
  }
});

/**
 * Get the appropriate task component based on exercise type.
 */
const taskComponent = computed(() => {
  const exerciseType = props.exercise.type;
  const registeredTask = TaskRegistry.get(exerciseType);
  
  if (!registeredTask) {
    console.warn(`No task component registered for type: ${exerciseType}`);
    return null;
  }
  
  return registeredTask.component;
});

/**
 * Get additional props for resource extraction tasks.
 */
const additionalProps = computed(() => {
  if (props.exercise.type === 'resource-extraction') {
    return {
      wordRepository: wordService,
      sentenceRepository: sentenceService,
      languages: languages.value,
      resourceRepository: resourceService
    };
  }
  return {};
});

/**
 * Handles exercise completion with rating.
 */
function handleRate(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string) {
  emit('complete-exercise', rating, userInput);
}

/**
 * Handles resource extraction task completion (skip or done-for-now).
 */
function handleResourceTaskComplete() {
  // For resource tasks, we treat them as "Easy" completion since they don't have ratings
  emit('complete-exercise', 'Easy');
}
</script>

<template>
  <!-- Render the appropriate task component based on exercise type -->
  <component 
    v-if="taskComponent"
    :is="taskComponent" 
    :exercise="exercise"
    v-bind="additionalProps"
    @rate="handleRate"
    v-on="exercise.type === 'resource-extraction' ? {
      'skip': handleResourceTaskComplete,
      'done-for-now': handleResourceTaskComplete
    } : {}"
  />
  
  <!-- Fallback for unknown exercise types -->
  <div v-else class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="alert alert-error">
        <span>Unknown exercise type: {{ exercise.type }}</span>
      </div>
    </div>
  </div>
</template>
