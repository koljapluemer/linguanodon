<script setup lang="ts">
import { ref, computed } from "vue";
import { inject } from "vue";
import { wordRepoKey, sentenceRepoKey, learningEventRepoKey, linguisticUnitProgressRepoKey } from "@/shared/injectionKeys";
import type { ExerciseData } from "@/entities/exercises/ExerciseData";
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';

// Inject repositories
const wordRepo = inject(wordRepoKey);
const sentenceRepo = inject(sentenceRepoKey);
const learningEventRepo = inject(learningEventRepoKey);
const linguisticUnitProgressRepo = inject(linguisticUnitProgressRepoKey);
if (!wordRepo || !sentenceRepo || !learningEventRepo || !linguisticUnitProgressRepo) throw new Error("Repositories not provided!");

// State
const exercises = ref<ExerciseData[]>([]);
const currentIndex = ref(0);
const revealed = ref(false);
const lessonDone = ref(false);
const userRatings = ref<Record<string, string>>({});
const userInputs = ref<Record<string, string>>({});

/**
 * Convert user rating to FSRS Grade enum.
 */
function userRatingToFsrsRating(userRating: string): Grade {
  switch (userRating) {
    case "Impossible": return Rating.Again as Grade;
    case "Hard": return Rating.Hard as Grade;
    case "Doable": return Rating.Good as Grade;
    case "Easy": return Rating.Easy as Grade;
    default: return Rating.Good as Grade;
  }
}

/**
 * Update FSRS progress for a linguistic unit.
 */
async function updateLinguisticUnitProgress(linguisticUnit: { language: string; content: string; type: 'word' | 'sentence' }, level: number, fsrsRating: Grade) {
  try {
    console.log('Updating progress for:', linguisticUnit, 'level:', level, 'rating:', fsrsRating);
    
    // Get existing progress or create new
    let progress = await linguisticUnitProgressRepo!.get(linguisticUnit.language, linguisticUnit.content, linguisticUnit.type);
    console.log('Existing progress:', progress);
    
    if (!progress) {
      progress = {
        language: linguisticUnit.language,
        content: linguisticUnit.content,
        type: linguisticUnit.type,
        cards: {}
      };
      console.log('Created new progress:', progress);
    }
    
    // Ensure cards object exists
    if (!progress.cards) {
      progress.cards = {};
    }
    
    // Get or create card for this level
    let card = progress.cards[level];
    if (!card) {
      card = createEmptyCard();
      console.log('Created new card for level', level, ':', card);
    }
    
    // Update card with FSRS algorithm
    const scheduler = fsrs();
    const now = new Date();
    const { card: updatedCard } = scheduler.next(card, now, fsrsRating);
    console.log('Updated card:', updatedCard);
    
    // Update progress
    const updatedProgress = {
      ...progress,
      cards: {
        ...progress.cards,
        [level]: updatedCard
      }
    };
    
    console.log('Saving updated progress:', updatedProgress);
    await linguisticUnitProgressRepo!.upsert(updatedProgress);
    console.log('Progress saved successfully');
  } catch (error) {
    console.error('Error updating linguistic unit progress:', error);
    console.error('Error details:', {
      linguisticUnit,
      level,
      fsrsRating,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    // Continue without failing the exercise
  }
}

// Generate lesson on mount
(async () => {
  // Fetch words and sentences
  const words = await wordRepo.getAll();
  const sentences = await sentenceRepo.getAll();

  // Pick 5 words for "reveal" exercises
  const revealExercises: ExerciseData[] = words.slice(0, 5).map((word, i) => ({
    id: `reveal-${i}`,
    type: "reveal",
    prompt: `${word.language.toUpperCase()}: ${word.content}`,
    solution: word.translations?.map(t => `${t.language.toUpperCase()}: ${t.content}`).join(", ") || "(no translation)",
    linguisticUnit: word,
    level: 0
  }));

  // Pick 1 sentence for free-translate (if available)
  let freeTranslateExercise: ExerciseData | null = null;
  if (sentences.length > 0) {
    const s = sentences[0];
    freeTranslateExercise = {
      id: "free-translate-0",
      type: "free-translate",
      prompt: `${s.language.toUpperCase()}: ${s.content}`,
      solution: s.translations?.map(t => `${t.language.toUpperCase()}: ${t.content}`).join(", ") || "(no translation)",
      linguisticUnit: s,
      level: 0
    };
  }

  // Compose lesson
  exercises.value = freeTranslateExercise
    ? [...revealExercises, freeTranslateExercise]
    : [...revealExercises];
})();

const currentExercise = computed(() => exercises.value[currentIndex.value]);
const progress = computed(() => (exercises.value.length === 0 ? 0 : (currentIndex.value + (lessonDone.value ? 1 : 0)) / exercises.value.length));

/**
 * Reveal the solution for the current exercise.
 */
function reveal() {
  revealed.value = true;
}
/**
 * Move to the next exercise or finish the lesson.
 */
function next() {
  revealed.value = false;
  if (currentIndex.value < exercises.value.length - 1) {
    currentIndex.value++;
  } else {
    lessonDone.value = true;
  }
}
/**
 * Record the user's rating for the current exercise, persist a learning event, and move to the next.
 */
async function rate(rating: string) {
  if (currentExercise.value) {
    userRatings.value[currentExercise.value.id] = rating;
    
    // Convert user rating to FSRS rating
    const fsrsRating = userRatingToFsrsRating(rating);
    
    // Update FSRS progress for the linguistic unit
    console.log('Current exercise linguistic unit:', currentExercise.value.linguisticUnit);
    console.log('Type from linguistic unit:', currentExercise.value.linguisticUnit.type);
    
    await updateLinguisticUnitProgress(
      {
        language: currentExercise.value.linguisticUnit.language,
        content: currentExercise.value.linguisticUnit.content,
        type: currentExercise.value.linguisticUnit.type
      },
      currentExercise.value.level ?? 0,
      fsrsRating
    );
    
    // Persist learning event as a plain object
    const event = {
      userEaseRating: rating as "Impossible" | "Hard" | "Doable" | "Easy",
      timestamp: new Date(),
      exerciseType: currentExercise.value.type,
      taskType: currentExercise.value.type, // For now, use type as taskType
      level: currentExercise.value.level ?? 0,
      linguisticUnit: {
        language: currentExercise.value.linguisticUnit.language,
        content: currentExercise.value.linguisticUnit.content,
        type: currentExercise.value.linguisticUnit.type
      },
      userInput: currentExercise.value.type === "free-translate" ? userInputs.value[currentExercise.value.id] : undefined
    };
    await learningEventRepo!.add({ ...event });
  }
  next();
}
/**
 * Save the user's input for a free-translate exercise.
 */
function saveInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  if (currentExercise.value) {
    userInputs.value[currentExercise.value.id] = val;
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto mt-8 p-4 bg-base-200 rounded shadow">
    <h1 class="text-2xl font-bold mb-4 text-center">Practice Session</h1>
    <div class="mb-4">
      <progress class="progress w-full" :value="progress" max="1"></progress>
      <div class="text-sm text-center mt-1">{{ Math.round(progress * 100) }}% complete</div>
    </div>

    <div v-if="lessonDone" class="text-center">
      <div class="text-xl font-semibold mb-2">Lesson Complete!</div>
      <div class="mb-4">You finished all exercises.</div>
      <ul class="mb-4">
        <li v-for="ex in exercises" :key="ex.id">
          <span class="font-semibold">{{ ex.prompt }}</span>
          <span class="ml-2">→ {{ ex.solution }}</span>
          <span v-if="userRatings[ex.id]" class="ml-2 badge badge-outline">{{ userRatings[ex.id] }}</span>
          <span v-if="ex.type === 'free-translate' && userInputs[ex.id]" class="ml-2 italic">Your answer: {{ userInputs[ex.id] }}</span>
        </li>
      </ul>
      <button class="btn btn-primary" @click="() => { currentIndex = 0; lessonDone = false; userRatings = {}; userInputs = {}; revealed = false; }">Restart</button>
    </div>

    <div v-else-if="currentExercise" class="space-y-6">
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="text-lg font-semibold">{{ currentExercise.prompt }}</div>
          <div v-if="currentExercise.type === 'free-translate'" class="mt-4">
            <input class="input input-bordered w-full" type="text" placeholder="Type your translation..." :value="userInputs[currentExercise.id] || ''" @input="saveInput" :disabled="revealed" />
          </div>
          <div v-if="revealed" class="mt-4">
            <div class="alert alert-info">Solution: <span class="font-mono">{{ currentExercise.solution }}</span></div>
            <div v-if="currentExercise.type === 'free-translate' && userInputs[currentExercise.id]" class="mt-2">
              <span class="italic">Your answer: {{ userInputs[currentExercise.id] }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="btn btn-xs btn-error" @click="rate('Impossible')">Impossible</button>
              <button class="btn btn-xs btn-warning" @click="rate('Hard')">Hard</button>
              <button class="btn btn-xs btn-info" @click="rate('Doable')">Doable</button>
              <button class="btn btn-xs btn-success" @click="rate('Easy')">Easy</button>
            </div>
          </div>
          <div v-else class="mt-4">
            <button class="btn btn-primary w-full" @click="reveal">Reveal Solution</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500">Loading lesson...</div>
  </div>
</template>

<style scoped>
.progress {
  height: 0.75rem;
}
</style> 