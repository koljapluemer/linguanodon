<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import type { SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { LearningEventData } from "@/entities/learning-events";
import { sentenceService, progressService } from "@/entities/linguisticUnits";
import { learningEventService } from "@/entities/learning-events";

const route = useRoute();

// State
const sentence = ref<SentenceData | null>(null);
const progressData = ref<LinguisticUnitProgressData | null>(null);
const learningEvents = ref<LearningEventData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Get sentence identifier from route params
const sentenceLanguage = computed(() => route.params.language as string);
const sentenceContent = computed(() => route.params.content as string);

/**
 * Loads sentence data and related information.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Get the specific sentence
    const sentenceData = await sentenceService.getById(sentenceLanguage.value, sentenceContent.value);
    if (!sentenceData) {
      error.value = "Sentence not found";
      return;
    }
    sentence.value = sentenceData;

    // Get progress data for this sentence
    const progress = await progressService.get(
      sentenceLanguage.value, 
      sentenceContent.value, 
      'sentence'
    );
    progressData.value = progress || null;

    // Get learning events for this sentence
    const allEvents = await learningEventService.getAll();
    const events = allEvents.filter((event: LearningEventData) => 
      event.linguisticUnit.language === sentenceLanguage.value && 
      event.linguisticUnit.content === sentenceContent.value &&
      event.linguisticUnit.type === 'sentence'
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
      <router-link to="/sentences" class="btn btn-ghost btn-sm mb-4">
        ← Back to Sentences
      </router-link>
      <h1 class="text-3xl font-bold">Debug Sentence</h1>
      <p class="text-lg text-gray-600">{{ sentenceLanguage }}: {{ sentenceContent }}</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading sentence data...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Sentence data -->
    <div v-else-if="sentence" class="space-y-6">
      <!-- Sentence Data -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-header">
          <h2 class="card-title">Sentence Data</h2>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-semibold mb-2">Basic Info</h3>
              <p><strong>Language:</strong> {{ sentence.language }}</p>
              <p><strong>Content:</strong> {{ sentence.content }}</p>
            </div>
            
            <div v-if="sentence.translations && sentence.translations.length > 0">
              <h3 class="font-semibold mb-2">Translations</h3>
              <ul class="list-disc list-inside">
                <li v-for="translation in sentence.translations" :key="`${translation.language}-${translation.content}`">
                  <strong>{{ translation.language }}:</strong> {{ translation.content }}
                </li>
              </ul>
            </div>

            <div v-if="sentence.notes && sentence.notes.length > 0">
              <h3 class="font-semibold mb-2">Notes</h3>
              <ul class="list-disc list-inside">
                <li v-for="(note, index) in sentence.notes" :key="index">
                  {{ note.content }}
                  <span v-if="note.showBeforeExercise" class="badge badge-sm badge-info ml-2">Show before exercise</span>
                </li>
              </ul>
            </div>

            <div v-if="sentence.links && sentence.links.length > 0">
              <h3 class="font-semibold mb-2">Links</h3>
              <ul class="list-disc list-inside">
                <li v-for="link in sentence.links" :key="link.url">
                  <a :href="link.url" target="_blank" class="link link-primary">{{ link.label }}</a>
                </li>
              </ul>
            </div>

            <div v-if="sentence.credits && sentence.credits.length > 0">
              <h3 class="font-semibold mb-2">Credits</h3>
              <ul class="list-disc list-inside">
                <li v-for="credit in sentence.credits" :key="credit.source">
                  <strong>{{ credit.owner }}</strong> - {{ credit.source }}
                  <span class="badge badge-sm badge-outline ml-2">{{ credit.license }}</span>
                </li>
              </ul>
            </div>

            <div v-if="sentence.containsWords && sentence.containsWords.length > 0">
              <h3 class="font-semibold mb-2">Contains Words</h3>
              <ul class="list-disc list-inside">
                <li v-for="word in sentence.containsWords" :key="`${word.language}-${word.content}`">
                  <strong>{{ word.language }}:</strong> {{ word.content }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Raw JSON -->
          <details class="mt-4">
            <summary class="cursor-pointer font-semibold">Raw JSON</summary>
            <pre class="mt-2 p-4 bg-base-200 rounded-lg overflow-x-auto text-sm">{{ formatJson(sentence) }}</pre>
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
            No progress data found for this sentence.
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
            No learning events found for this sentence.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
