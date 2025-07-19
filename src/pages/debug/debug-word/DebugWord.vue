<script setup lang="ts">
import { ref, onMounted, inject, computed } from "vue";
import { useRoute } from "vue-router";
import type { WordData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { LearningEventData } from "@/entities/learning-events/LearningEventData";
import { 
  wordRepoKey, 
  linguisticUnitProgressRepoKey,
  learningEventRepoKey 
} from "@/shared/injectionKeys";

// Inject repositories
const wordRepo = inject(wordRepoKey);
const linguisticUnitProgressRepo = inject(linguisticUnitProgressRepoKey);
const learningEventRepo = inject(learningEventRepoKey);

if (!wordRepo || !linguisticUnitProgressRepo || !learningEventRepo) {
  throw new Error("Required repositories not provided!");
}

const route = useRoute();

// State
const word = ref<WordData | null>(null);
const progressData = ref<LinguisticUnitProgressData | null>(null);
const learningEvents = ref<LearningEventData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Get word identifier from route params
const wordLanguage = computed(() => route.params.language as string);
const wordContent = computed(() => route.params.content as string);

/**
 * Loads word data and related information.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Get the specific word
    const wordData = await wordRepo!.getById(wordLanguage.value, wordContent.value);
    if (!wordData) {
      error.value = "Word not found";
      return;
    }
    word.value = wordData;

    // Get progress data for this word
    const progress = await linguisticUnitProgressRepo!.get(
      wordLanguage.value, 
      wordContent.value, 
      'word'
    );
    progressData.value = progress || null;

    // Get learning events for this word
    const allEvents = await learningEventRepo!.getAll();
    const events = allEvents.filter(event => 
      event.linguisticUnit.language === wordLanguage.value && 
      event.linguisticUnit.content === wordContent.value &&
      event.linguisticUnit.type === 'word'
    );
    learningEvents.value = events;
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load data";
  } finally {
    loading.value = false;
  }
}

/**
 * Formats a date for display.
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats JSON for display.
 */
function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

// Load data on mount
onMounted(loadData);
</script>

<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="mb-6">
      <router-link to="/words" class="btn btn-ghost btn-sm mb-4">
        ← Back to Words
      </router-link>
      <h1 class="text-3xl font-bold">Debug Word</h1>
      <p class="text-lg text-gray-600">{{ wordLanguage }}: {{ wordContent }}</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading word data...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Word data -->
    <div v-else-if="word" class="space-y-6">
      <!-- Word Data -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-header">
          <h2 class="card-title">Word Data</h2>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-semibold mb-2">Basic Info</h3>
              <p><strong>Language:</strong> {{ word.language }}</p>
              <p><strong>Content:</strong> {{ word.content }}</p>
            </div>
            
            <div v-if="word.translations && word.translations.length > 0">
              <h3 class="font-semibold mb-2">Translations</h3>
              <ul class="list-disc list-inside">
                <li v-for="translation in word.translations" :key="`${translation.language}-${translation.content}`">
                  <strong>{{ translation.language }}:</strong> {{ translation.content }}
                </li>
              </ul>
            </div>

            <div v-if="word.notes && word.notes.length > 0">
              <h3 class="font-semibold mb-2">Notes</h3>
              <ul class="list-disc list-inside">
                <li v-for="(note, index) in word.notes" :key="index">
                  {{ note.content }}
                  <span v-if="note.showBeforeExercise" class="badge badge-sm badge-info ml-2">Show before exercise</span>
                </li>
              </ul>
            </div>

            <div v-if="word.links && word.links.length > 0">
              <h3 class="font-semibold mb-2">Links</h3>
              <ul class="list-disc list-inside">
                <li v-for="link in word.links" :key="link.url">
                  <a :href="link.url" target="_blank" class="link link-primary">{{ link.label }}</a>
                </li>
              </ul>
            </div>

            <div v-if="word.otherForms && word.otherForms.length > 0">
              <h3 class="font-semibold mb-2">Other Forms</h3>
              <ul class="list-disc list-inside">
                <li v-for="form in word.otherForms" :key="form.content">
                  {{ form.content }}
                </li>
              </ul>
            </div>

            <div v-if="word.synonyms && word.synonyms.length > 0">
              <h3 class="font-semibold mb-2">Synonyms</h3>
              <ul class="list-disc list-inside">
                <li v-for="synonym in word.synonyms" :key="synonym.content">
                  {{ synonym.content }}
                </li>
              </ul>
            </div>

            <div v-if="word.appearsIn && word.appearsIn.length > 0">
              <h3 class="font-semibold mb-2">Appears In</h3>
              <ul class="list-disc list-inside">
                <li v-for="sentence in word.appearsIn" :key="`${sentence.language}-${sentence.content}`">
                  <strong>{{ sentence.language }}:</strong> {{ sentence.content }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Raw JSON -->
          <details class="mt-4">
            <summary class="cursor-pointer font-semibold">Raw JSON</summary>
            <pre class="mt-2 p-4 bg-base-200 rounded-lg overflow-x-auto text-sm">{{ formatJson(word) }}</pre>
          </details>
        </div>
      </div>

      <!-- Progress Data -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-header">
          <h2 class="card-title">Progress Data</h2>
        </div>
        <div class="card-body">
          <div v-if="progressData">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 class="font-semibold mb-2">Basic Info</h3>
                <p><strong>Language:</strong> {{ progressData.language }}</p>
                <p><strong>Content:</strong> {{ progressData.content }}</p>
                <p><strong>Type:</strong> {{ progressData.type }}</p>
              </div>
              
              <div>
                <h3 class="font-semibold mb-2">Cards</h3>
                <div class="flex flex-wrap gap-1">
                  <div 
                    v-for="level in 10" 
                    :key="level - 1"
                    class="badge badge-sm"
                    :class="{
                      'badge-error': !progressData.cards[level - 1],
                      'badge-warning': progressData.cards[level - 1] && new Date(progressData.cards[level - 1].due) <= new Date(),
                      'badge-success': progressData.cards[level - 1] && new Date(progressData.cards[level - 1].due) > new Date()
                    }"
                  >
                    {{ level - 1 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Details -->
            <div v-if="Object.keys(progressData.cards).length > 0">
              <h3 class="font-semibold mb-2">Card Details</h3>
              <div class="space-y-2">
                <div 
                  v-for="(card, level) in progressData.cards" 
                  :key="level"
                  class="p-3 bg-base-200 rounded-lg"
                >
                  <h4 class="font-medium">Level {{ level }}</h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <p><strong>Due:</strong> {{ formatDate(card.due) }}</p>
                    <p><strong>Stability:</strong> {{ card.stability.toFixed(2) }}</p>
                    <p><strong>Difficulty:</strong> {{ card.difficulty.toFixed(2) }}</p>
                    <p><strong>Elapsed Days:</strong> {{ card.elapsed_days }}</p>
                    <p><strong>Scheduled Days:</strong> {{ card.scheduled_days }}</p>
                    <p><strong>Reps:</strong> {{ card.reps }}</p>
                    <p><strong>Lapses:</strong> {{ card.lapses }}</p>
                    <p><strong>State:</strong> {{ card.state }}</p>
                    <p v-if="card.last_review"><strong>Last Review:</strong> {{ formatDate(card.last_review) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Raw JSON -->
            <details class="mt-4">
              <summary class="cursor-pointer font-semibold">Raw JSON</summary>
              <pre class="mt-2 p-4 bg-base-200 rounded-lg overflow-x-auto text-sm">{{ formatJson(progressData) }}</pre>
            </details>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            No progress data found for this word.
          </div>
        </div>
      </div>

      <!-- Learning Events -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-header">
          <h2 class="card-title">Learning Events ({{ learningEvents.length }})</h2>
        </div>
        <div class="card-body">
          <div v-if="learningEvents.length > 0" class="space-y-2">
            <div 
              v-for="(event, index) in learningEvents" 
              :key="index"
              class="p-3 bg-base-200 rounded-lg"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <p><strong>Timestamp:</strong> {{ formatDate(event.timestamp) }}</p>
                <p><strong>Rating:</strong> {{ event.userEaseRating }}</p>
                <p><strong>Level:</strong> {{ event.level }}</p>
                <p><strong>Exercise Type:</strong> {{ event.exerciseType }}</p>
                <p><strong>Task Type:</strong> {{ event.taskType }}</p>
                <p v-if="event.userInput"><strong>User Input:</strong> {{ event.userInput }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            No learning events found for this word.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
