<script setup lang="ts">
import { ref, computed } from "vue";
import { inject } from "vue";
import { wordRepoKey, sentenceRepoKey, learningEventRepoKey } from "@/shared/injectionKeys";
import type { ExerciseData } from "@/entities/exercises/ExerciseData";
// Removed unused LearningEventRepository import

// Inject repositories
const wordRepo = inject(wordRepoKey);
const sentenceRepo = inject(sentenceRepoKey);
const learningEventRepo = inject(learningEventRepoKey);
if (!wordRepo || !sentenceRepo || !learningEventRepo) throw new Error("Repositories not provided!");

// State
const exercises = ref<ExerciseData[]>([]);
const currentIndex = ref(0);
const revealed = ref(false);
const lessonDone = ref(false);
const userRatings = ref<Record<string, string>>({});
const userInputs = ref<Record<string, string>>({});

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
    linguisticUnit: { language: word.language, content: word.content },
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
      linguisticUnit: { language: s.language, content: s.content },
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
 * @param rating - The user's self-assessed rating.
 */
async function rate(rating: string) {
  if (currentExercise.value) {
    userRatings.value[currentExercise.value.id] = rating;
    // Persist learning event as a plain object
    const event = {
      userEaseRating: rating as "Impossible" | "Hard" | "Doable" | "Easy",
      timestamp: new Date(),
      exerciseType: currentExercise.value.type,
      taskType: currentExercise.value.type, // For now, use type as taskType
      level: currentExercise.value.level ?? 0,
      linguisticUnit: { ...currentExercise.value.linguisticUnit },
      userInput: currentExercise.value.type === "free-translate" ? userInputs.value[currentExercise.value.id] : undefined
    };
    await learningEventRepo!.add({ ...event });
  }
  next();
}
/**
 * Save the user's input for a free-translate exercise.
 * @param e - The input event.
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