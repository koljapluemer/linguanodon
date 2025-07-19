<script setup lang="ts">
import { ref, onMounted } from "vue";
import { LessonGenerator } from "../model/LessonGenerator";
import type { Lesson } from "../model/Lesson";
import type { Exercise } from "../model/Exercise";
import type { Task } from "../model/Task";
import type { LearningEventData } from "@/entities/learning-events";
import { wordService, sentenceService, progressService } from "@/entities/linguisticUnits";
import { learningEventService } from "@/entities/learning-events";
import { fsrs, createEmptyCard } from "ts-fsrs";
import DoLessonRender from "./DoLessonRender.vue";

// State
const currentLesson = ref<Lesson | null>(null);
const currentTask = ref<Task | null>(null);
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
    
    // Create first task
    if (currentLesson.value.exercises.length > 0) {
      currentTask.value = createTaskFromExercise(currentLesson.value.exercises[0]);
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load lesson";
  } finally {
    loading.value = false;
  }
}

/**
 * Creates a task from an exercise.
 */
function createTaskFromExercise(exercise: Exercise): Task {
  return {
    id: exercise.id,
    taskType: exercise.type,
    data: {
      prompt: exercise.prompt,
      solution: exercise.solution,
      linguisticUnit: exercise.linguisticUnit
    },
    canSkip: !exercise.isRepeatable
  };
}

/**
 * Handles task completion with rating.
 */
async function completeTask(rating: 'Impossible' | 'Hard' | 'Doable' | 'Easy', userInput?: string) {
  if (!currentTask.value || !currentLesson.value) return;

  // Update task with rating
  currentTask.value.userRating = rating;
  if (userInput) {
    currentTask.value.userInput = userInput;
  }

  // Save learning event
  const currentExercise = currentLesson.value.exercises[currentLesson.value.currentExerciseIndex];
  
  // Extract plain object from Vue Proxy to avoid DataCloneError
  const plainLinguisticUnit = {
    language: currentExercise.linguisticUnit.language,
    content: currentExercise.linguisticUnit.content,
    type: currentExercise.linguisticUnit.type
  };
  
  const learningEvent: LearningEventData = {
    userEaseRating: rating,
    timestamp: new Date(),
    exerciseType: currentExercise.type,
    taskType: currentTask.value.taskType,
    level: currentExercise.level,
    linguisticUnit: plainLinguisticUnit,
    userInput: userInput
  };

  await learningEventService.add(learningEvent);

  // Update progress data for the linguistic unit
  await updateProgressData(currentExercise, rating);

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
    currentTask.value = null;
  } else {
    // Move to next exercise
    currentLesson.value.currentExerciseIndex = nextIndex;
    const nextExercise = currentLesson.value.exercises[nextIndex];
    currentTask.value = createTaskFromExercise(nextExercise);
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
  currentTask.value = null;
  loadLesson();
}

// Load initial lesson
onMounted(loadLesson);
</script>

<template>
  <DoLessonRender
    :lesson="currentLesson"
    :task="currentTask"
    :loading="loading"
    :error="error"
    @complete-task="completeTask"
    @start-new-lesson="startNewLesson"
  />
</template>
