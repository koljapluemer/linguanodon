<script setup lang="ts">
import { ref, onMounted, inject, computed } from "vue";
import { Search } from "lucide-vue-next";
import type { WordData } from "@/entities/words/WordData";
import type { LinguisticUnitProgressData } from "@/shared/linguisticUnits/progress/LinguisticUnitProgressData";
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

// State
const words = ref<WordData[]>([]);
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
    const [wordsData, progressDataData, learningEventsData] = await Promise.all([
      wordRepo!.getAll(),
      linguisticUnitProgressRepo!.getAll(),
      learningEventRepo!.getAll()
    ]);

    words.value = wordsData;
    progressData.value = progressDataData;
    learningEvents.value = learningEventsData;
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load data";
  } finally {
    loading.value = false;
  }
}

/**
 * Gets progress data for a specific word.
 */
function getWordProgress(word: WordData): LinguisticUnitProgressData | undefined {
  return progressData.value.find(p => 
    p.language === word.language && 
    p.content === word.content && 
    p.type === 'word'
  );
}

/**
 * Gets the most recent learning event for a word.
 */
function getLastPracticeDate(word: WordData): Date | null {
  const wordEvents = learningEvents.value.filter(event => 
    event.linguisticUnit.language === word.language && 
    event.linguisticUnit.content === word.content &&
    event.linguisticUnit.type === 'word'
  );
  
  if (wordEvents.length === 0) return null;
  
  return new Date(Math.max(...wordEvents.map(e => new Date(e.timestamp).getTime())));
}

/**
 * Gets the level status for a word.
 */
function getLevelStatus(word: WordData, level: number): 'red' | 'yellow' | 'green' {
  const progress = getWordProgress(word);
  
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
const filteredWords = computed(() => {
  if (!searchQuery.value) return words.value;
  
  const query = searchQuery.value.toLowerCase();
  return words.value.filter(word => 
    word.content.toLowerCase().includes(query) ||
    word.translations?.some(t => t.content.toLowerCase().includes(query)) ||
    word.language.toLowerCase().includes(query)
  );
});

const sortedWords = computed(() => {
  return [...filteredWords.value].sort((a, b) => {
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

const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedWords.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedWords.value.length / itemsPerPage);
});

// Load data on mount
onMounted(loadData);
</script>

<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <h1 class="text-3xl font-bold mb-6">Words</h1>
    
    <!-- Search -->
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search words, translations, or language..."
          class="input input-bordered w-full pl-10"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading words...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Results -->
    <div v-else>
      <div class="mb-4 text-sm text-gray-600">
        Showing {{ paginatedWords.length }} of {{ sortedWords.length }} words
      </div>

      <!-- Word list -->
      <div class="space-y-4">
        <div 
          v-for="word in paginatedWords" 
          :key="`${word.language}-${word.content}`"
          class="card bg-base-100 shadow-lg"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-lg font-semibold">
                  <router-link 
                    :to="{ name: 'debug-word', params: { language: word.language, content: word.content } }"
                    class="link link-primary hover:link-primary-focus"
                  >
                    {{ word.content }}
                  </router-link>
                </h3>
                <p class="text-sm text-gray-600">{{ word.language }}</p>
                
                <!-- Translations -->
                <div v-if="word.translations && word.translations.length > 0" class="mt-2">
                  <p class="text-sm">
                    <span class="font-medium">Translations:</span> 
                    {{ word.translations.map(t => t.content).join(', ') }}
                  </p>
                </div>

                <!-- Last practiced -->
                <p class="text-sm text-gray-500 mt-1">
                  Last practiced: {{ formatDate(getLastPracticeDate(word)) }}
                </p>
              </div>

              <!-- Level badges -->
              <div class="flex flex-wrap gap-1 ml-4">
                <div 
                  v-for="level in 10" 
                  :key="level - 1"
                  :class="{
                    'badge badge-sm': true,
                    'badge-error': getLevelStatus(word, level - 1) === 'red',
                    'badge-warning': getLevelStatus(word, level - 1) === 'yellow',
                    'badge-success': getLevelStatus(word, level - 1) === 'green'
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
