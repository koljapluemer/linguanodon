<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search } from "lucide-vue-next";
import type { SentenceData, LinguisticUnitProgressData } from "@/entities/linguisticUnits";
import type { LearningEventData } from "@/entities/learning-events";
import { sentenceService, progressService } from "@/entities/linguisticUnits";
import { learningEventService } from "@/entities/learning-events";

// State
const sentences = ref<SentenceData[]>([]);
const progressData = ref<LinguisticUnitProgressData[]>([]);
const learningEvents = ref<LearningEventData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Search and pagination
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 50;

/**
 * Loads all data from repositories.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    const [sentencesData, progressDataData, learningEventsData] = await Promise.all([
      sentenceService.getAll(),
      progressService.getAll(),
      learningEventService.getAll()
    ]);

    sentences.value = sentencesData;
    progressData.value = progressDataData;
    learningEvents.value = learningEventsData;
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load data";
  } finally {
    loading.value = false;
  }
}

/**
 * Gets progress data for a specific sentence.
 */
function getSentenceProgress(sentence: SentenceData): LinguisticUnitProgressData | undefined {
  return progressData.value.find(p => 
    p.language === sentence.language && 
    p.content === sentence.content && 
    p.type === 'sentence'
  );
}

/**
 * Gets the most recent learning event for a sentence.
 */
function getLastPracticeDate(sentence: SentenceData): Date | null {
  const sentenceEvents = learningEvents.value.filter(event => 
    event.linguisticUnit.language === sentence.language && 
    event.linguisticUnit.content === sentence.content &&
    event.linguisticUnit.type === 'sentence'
  );
  
  if (sentenceEvents.length === 0) return null;
  
  return new Date(Math.max(...sentenceEvents.map(e => new Date(e.timestamp).getTime())));
}

/**
 * Gets the level status for a sentence.
 */
function getLevelStatus(sentence: SentenceData, level: number): 'red' | 'yellow' | 'green' {
  const progress = getSentenceProgress(sentence);
  
  if (!progress || !progress.cards[level]) {
    return 'red'; // Never done
  }
  
  const card = progress.cards[level];
  const now = new Date();
  const dueDate = new Date(card.due);
  
  if (dueDate <= now) {
    return 'yellow'; // Due
  } else {
    return 'green'; // Not due
  }
}

/**
 * Formats a date for display.
 */
function formatDate(date: Date | null): string {
  if (!date) return 'Never';
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Computed properties
const filteredSentences = computed(() => {
  if (!searchQuery.value) return sentences.value;
  
  const query = searchQuery.value.toLowerCase();
  return sentences.value.filter(sentence => 
    sentence.content.toLowerCase().includes(query) ||
    sentence.translations?.some(t => t.content.toLowerCase().includes(query)) ||
    sentence.language.toLowerCase().includes(query)
  );
});

const sortedSentences = computed(() => {
  return [...filteredSentences.value].sort((a, b) => {
    const aDate = getLastPracticeDate(a);
    const bDate = getLastPracticeDate(b);
    
    // If both have dates, sort by most recent first
    if (aDate && bDate) {
      return bDate.getTime() - aDate.getTime();
    }
    
    // If only one has a date, put the one with date first
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    
    // If neither has a date, sort alphabetically
    return a.content.localeCompare(b.content);
  });
});

const paginatedSentences = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedSentences.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedSentences.value.length / itemsPerPage);
});

// Load data on mount
onMounted(loadData);
</script>

<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Sentences</h1>
      <router-link to="/sentences/manage" class="btn btn-primary">
        Add New Sentence
      </router-link>
    </div>
    
    <!-- Search -->
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search sentences, translations, or language..."
          class="input input-bordered w-full pl-10"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading sentences...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Results -->
    <div v-else>
      <div class="mb-4 text-sm text-gray-600">
        Showing {{ paginatedSentences.length }} of {{ sortedSentences.length }} sentences
      </div>

      <!-- Sentence list -->
      <div class="space-y-4">
        <div 
          v-for="sentence in paginatedSentences" 
          :key="`${sentence.language}-${sentence.content}`"
          class="card bg-base-100 shadow-lg"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-lg font-semibold">
                  <router-link 
                    :to="{ name: 'debug-sentence', params: { language: sentence.language, content: sentence.content } }"
                    class="link link-primary hover:link-primary-focus"
                  >
                    {{ sentence.content }}
                  </router-link>
                </h3>
                <div class="flex gap-2 mt-2">
                  <router-link 
                    :to="{ name: 'edit-sentence', params: { language: sentence.language, content: sentence.content } }"
                    class="btn btn-sm btn-outline"
                  >
                    Edit
                  </router-link>
                </div>
                <p class="text-sm text-gray-600">{{ sentence.language }}</p>
                
                <!-- Translations -->
                <div v-if="sentence.translations && sentence.translations.length > 0" class="mt-2">
                  <p class="text-sm">
                    <span class="font-medium">Translations:</span> 
                    {{ sentence.translations.map(t => t.content).join(', ') }}
                  </p>
                </div>

                <!-- Contains words -->
                <div v-if="sentence.containsWords && sentence.containsWords.length > 0" class="mt-2">
                  <p class="text-sm">
                    <span class="font-medium">Contains words:</span> 
                    {{ sentence.containsWords.map(w => w.content).join(', ') }}
                  </p>
                </div>

                <!-- Last practiced -->
                <p class="text-sm text-gray-500 mt-1">
                  Last practiced: {{ formatDate(getLastPracticeDate(sentence)) }}
                </p>
              </div>

              <!-- Level badges -->
              <div class="flex flex-wrap gap-1 ml-4">
                <div 
                  v-for="level in 10" 
                  :key="level - 1"
                  :class="{
                    'badge badge-sm': true,
                    'badge-error': getLevelStatus(sentence, level - 1) === 'red',
                    'badge-warning': getLevelStatus(sentence, level - 1) === 'yellow',
                    'badge-success': getLevelStatus(sentence, level - 1) === 'green'
                  }"
                >
                  {{ level - 1 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <div class="join">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="join-item btn btn-sm"
          >
            «
          </button>
          <button 
            v-for="page in Math.min(5, totalPages)" 
            :key="page"
            @click="currentPage = page"
            :class="{
              'join-item btn btn-sm': true,
              'btn-active': currentPage === page
            }"
          >
            {{ page }}
          </button>
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="join-item btn btn-sm"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
