<script setup lang="ts">
import { ref, onMounted } from "vue";
import { LessonGenerator } from "../model/LessonGenerator";
import type { Lesson } from "../model/Lesson";
import type { Exercise } from "../model/Exercise";
import type { LearningEventData } from "@/entities/learning-events";
import { wordService, sentenceService, progressService } from "@/entities/linguisticUnits";
import { learningEventService } from "@/entities/learning-events";
import { fsrs, createEmptyCard } from "ts-fsrs";
import DoLessonRender from "./DoLessonRender.vue";

// State
const currentLesson = ref<Lesson | null>(null);
const currentExercise = ref<Exercise | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

/**
 * Loads data and generates a new lesson.
 */
async function loadLesson() {
  loading.value = true;
  error.value = null;
  
  try {
    // Load all data
    const [words, sentences, progressData] = await Promise.all([
      wordService.getAll(),
      sentenceService.getAll(),
      progressService.getAll()
    ]);

    // Generate lesson
    currentLesson.value = await LessonGenerator.generateLesson(words, sentences, progressData);
    
    // Set first exercise
    if (currentLesson.value.exercises.length > 0) {
      currentExercise.value = currentLesson.value.exercises[0];
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load lesson";
  } finally {
    loading.value = false;
  }
}

/**
 * Handles exercise completion with rating.
 */
async function completeExercise(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string) {
  if (!currentExercise.value || !currentLesson.value) return;

  // Save learning event
  const exercise = currentExercise.value;
  
  // Extract plain object from Vue Proxy to avoid DataCloneError
  const plainLinguisticUnit = {
    language: exercise.linguisticUnit.language,
    content: exercise.linguisticUnit.content,
    type: exercise.linguisticUnit.type
  };
  
  const learningEvent: LearningEventData = {
    userEaseRating: rating,
    timestamp: new Date(),
    exerciseType: exercise.type,
    taskType: exercise.type, // Use exercise type as task type since we eliminated Task
    level: exercise.level,
    linguisticUnit: plainLinguisticUnit,
    userInput: userInput
  };

  await learningEventService.add(learningEvent);

  // Update progress data for the linguistic unit
  await updateProgressData(exercise, rating);

  // Move to next exercise or complete lesson
  moveToNextExercise();
}

/**
 * Moves to the next exercise in the lesson.
 */
function moveToNextExercise() {
  if (!currentLesson.value) return;

  const nextIndex = currentLesson.value.currentExerciseIndex + 1;
  
  if (nextIndex >= currentLesson.value.exercises.length) {
    // Lesson completed
    currentLesson.value.isCompleted = true;
    currentLesson.value.completedAt = new Date();
    currentExercise.value = null;
  } else {
    // Move to next exercise
    currentLesson.value.currentExerciseIndex = nextIndex;
    currentExercise.value = currentLesson.value.exercises[nextIndex];
  }
}

/**
 * Updates progress data for a linguistic unit after exercise completion.
 */
async function updateProgressData(exercise: Exercise, rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy') {
  const { linguisticUnit, level } = exercise;
  
  // Get existing progress data or create new one
  let progressData = await progressService.get(
    linguisticUnit.language, 
    linguisticUnit.content, 
    linguisticUnit.type
  );

  if (!progressData) {
    // Create new progress data
    progressData = {
      language: linguisticUnit.language,
      content: linguisticUnit.content,
      type: linguisticUnit.type,
      cards: {}
    };
  }

  // Get or create card for this level
  let card = progressData.cards[level];
  if (!card) {
    card = createEmptyCard();
  }

  // Apply FSRS algorithm to update the card
  const scheduler = fsrs();
  const now = new Date();
  
  // Map UI ratings to FSRS ratings
  const fsrsRating = rating === 'Impossible' ? 1 : 
                    rating === 'Hard' ? 2 : 
                    rating === 'Doable' ? 3 : 4; // Easy

  const { card: updatedCard } = scheduler.next(card, now, fsrsRating);
  
  // Update the card in progress data
  progressData.cards[level] = updatedCard;

  // Save the updated progress data
  await progressService.upsert(progressData);
}

/**
 * Starts a new lesson.
 */
function startNewLesson() {
  currentLesson.value = null;
  currentExercise.value = null;
  loadLesson();
}

// Load initial lesson
onMounted(loadLesson);
</script>

<template>
  <DoLessonRender
    :lesson="currentLesson"
    :exercise="currentExercise"
    :loading="loading"
    :error="error"
    @complete-exercise="completeExercise"
    @start-new-lesson="startNewLesson"
  />
</template>
