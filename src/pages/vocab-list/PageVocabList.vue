<template>
  <div class="flex justify-between items-center mb-6">
    <h1>{{ $t('vocabulary.title') }}</h1>
    <router-link to="/vocab/new" class="btn btn-primary">
      {{ $t('vocabulary.addNew') }}
    </router-link>
  </div>

  <!-- Search -->
  <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Search vocabulary..."
    class="input input-bordered w-full" />

  <!-- Filters -->
  <div class="grid gap-2 md:grid-cols-2 mb-2">
    <!-- Language Filter -->
    <details class="collapse collapse-arrow bg-base-200">
      <summary class="collapse-title font-medium">
        {{ $t('vocabulary.filters.languages') }} {{ $t('manage.vocab.count') }}{{ selectedLanguages.length }} {{ $t('vocabulary.filters.selected') }}{{ $t('manage.vocab.countEnd') }}
      </summary>
      <div class="collapse-content">
        <ul class="flex flex-col gap-2">
          <li v-for="language in availableLanguages" :key="language.code">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="selectedLanguages.includes(language.code)"
                @change="toggleLanguage(language.code)" class="checkbox checkbox-sm" />
              <span class="flex items-center gap-2">
                <span v-if="language.emoji">{{ language.emoji }}</span>
                {{ language.name }}
              </span>
            </label>
          </li>
        </ul>
      </div>
    </details>

    <!-- Set Filter -->
    <details class="collapse collapse-arrow bg-base-200">
      <summary class="collapse-title font-medium">
        {{ $t('vocabulary.filters.sets') }} {{ $t('manage.vocab.count') }}{{ selectedSets.length }} {{ $t('vocabulary.filters.selected') }}{{ $t('manage.vocab.countEnd') }}
      </summary>
      <div class="collapse-content">
        <ul class="flex flex-col gap-2">
          <li>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="selectedSets.includes('user-added')" @change="toggleSet('user-added')"
                class="checkbox checkbox-sm" />
              {{ $t('common.userAdded') }}
            </label>
          </li>
          <li v-for="set in availableSets" :key="set.uid">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="selectedSets.includes(set.uid)" @change="toggleSet(set.uid)"
                class="checkbox checkbox-sm" />
              {{ set.name }}
            </label>
          </li>
        </ul>
      </div>
    </details>
  </div>

  <div v-if="loading" class="text-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="mt-4">{{ $t('common.loading') }}</p>
  </div>

  <div v-else-if="error" class="alert alert-error mb-6">
    <span>{{ error }}</span>
  </div>

  <div v-else>
    <!-- Results Summary -->
    <div class="flex justify-center items-center mb-4">
      <span class="text-light">{{ totalCount }} {{ $t('vocabulary.stats.totalItems') }}</span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>{{ $t('vocabulary.content') }}</th>
            <th>{{ $t('vocabulary.language') }}</th>
            <th>{{ $t('vocabulary.translations') }}</th>
            <th>{{ $t('vocabulary.set') }}</th>
            <th>{{ $t('vocabulary.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vocab in vocabItems" :key="vocab.uid">
            <td>
              <router-link :to="`/vocab/${vocab.uid}/edit`" class="font-bold link link-hover">
                {{ vocab.content }}
              </router-link>
            </td>
            <td>
              <span class="flex items-center gap-2">
                <span v-if="getLanguageEmoji(vocab.language)">{{ getLanguageEmoji(vocab.language) }}</span>
                {{ getLanguageName(vocab.language) }}
              </span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="translation in vocabTranslations[vocab.uid] || []" 
                  :key="translation"
                  class="badge badge-sm"
                >
                  {{ translation }}
                </span>
                <span 
                  v-if="!vocabTranslations[vocab.uid] || vocabTranslations[vocab.uid].length === 0"
                  class="text-light"
                >
                  {{ $t('vocabulary.noTranslations') }}
                </span>
              </div>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="origin in vocab.origins" :key="origin" class="badge badge-outline badge-sm">
                  {{ getOriginDisplayName(origin) }}
                </span>
              </div>
            </td>
            <td>
              <button @click="deleteVocab(vocab.uid)" class="btn btn-sm btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > 0" class="mt-6">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        v-model:page-size="pageSize"
        @go-to-page="goToPage"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <div v-if="vocabItems.length === 0" class="text-center py-8">
      <p class="text-light">{{ $t('vocabulary.states.noItems') }}</p>
      <router-link to="/vocab/new" class="btn btn-primary mt-4">
        {{ $t('vocabulary.addNew') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed, watch } from 'vue';
import type { VocabRepoContract, VocabListFilters } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import Pagination from '@/shared/ui/Pagination.vue';
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router';

const route = useRoute();
const router = useRouter();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;

// Data
const vocabItems = ref<VocabData[]>([]);
const totalCount = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);

// Translation data for current page
const vocabTranslations = ref<Record<string, string[]>>({});

// URL parameter initialization
function parseArrayParam(value: LocationQueryValue | LocationQueryValue[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => v !== null);
  }
  return value.split(',').filter(v => v.length > 0);
}

// Filters and search - initialized from URL parameters
const searchQuery = ref(route.query.search as string || '');
const selectedLanguages = ref<string[]>(parseArrayParam(route.query.languages));
const selectedSets = ref<string[]>(parseArrayParam(route.query.sets));

// Pagination - initialized from URL parameters
const currentPage = ref(parseInt(route.query.page as string) || 1);
const pageSize = ref(parseInt(route.query.pageSize as string) || 25);

// Available options for filters
const availableLanguages = ref<LanguageData[]>([]);
const availableSets = ref<LocalSetData[]>([]);

// Computed
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

// URL parameter synchronization
function updateUrlParams() {
  const query: Record<string, string | undefined> = {};
  
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim();
  }
  if (selectedLanguages.value.length > 0) {
    query.languages = selectedLanguages.value.join(',');
  }
  if (selectedSets.value.length > 0) {
    query.sets = selectedSets.value.join(',');
  }
  if (currentPage.value > 1) {
    query.page = currentPage.value.toString();
  }
  if (pageSize.value !== 25) {
    query.pageSize = pageSize.value.toString();
  }

  router.replace({ query });
}


// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    updateUrlParams();
    loadVocab();
  }, 300);
}

// Filter methods
function toggleLanguage(languageCode: string) {
  const index = selectedLanguages.value.indexOf(languageCode);
  if (index > -1) {
    selectedLanguages.value.splice(index, 1);
  } else {
    selectedLanguages.value.push(languageCode);
  }
  currentPage.value = 1;
  updateUrlParams();
  loadVocab();
}

function toggleSet(setId: string) {
  const index = selectedSets.value.indexOf(setId);
  if (index > -1) {
    selectedSets.value.splice(index, 1);
  } else {
    selectedSets.value.push(setId);
  }
  currentPage.value = 1;
  updateUrlParams();
  loadVocab();
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    updateUrlParams();
    loadVocab();
  }
}

function handlePageSizeChange(newSize: number) {
  pageSize.value = newSize;
  currentPage.value = 1; // Reset to first page when changing page size
  updateUrlParams();
  loadVocab();
}

// Helper methods
function getLanguageName(code: string): string {
  const language = availableLanguages.value.find(l => l.code === code);
  return language?.name || code.toUpperCase();
}

function getLanguageEmoji(code: string): string | undefined {
  const language = availableLanguages.value.find(l => l.code === code);
  return language?.emoji;
}

function getOriginDisplayName(origin: string): string {
  if (origin === 'user-added') return 'User Added';
  const set = availableSets.value.find(s => s.uid === origin);
  return set?.name || origin;
}

// Main load function
async function loadVocab() {
  loading.value = true;
  error.value = null;

  try {
    let translationIds: string[] | undefined;
    
    // If there's a search query, also search translations
    if (searchQuery.value?.trim()) {
      const matchingTranslations = await translationRepo.searchTranslationsByContent(searchQuery.value.trim());
      translationIds = matchingTranslations.map(t => t.uid);
    }

    const filters: VocabListFilters = {
      searchQuery: searchQuery.value?.trim() || undefined,
      translationIds: translationIds && translationIds.length > 0 ? translationIds : undefined,
      languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : undefined,
      origins: selectedSets.value.length > 0 ? selectedSets.value : undefined
    };

    const offset = (currentPage.value - 1) * pageSize.value;

    const [result, count] = await Promise.all([
      vocabRepo.getVocabPaginated(offset.toString(), pageSize.value, filters),
      vocabRepo.getTotalVocabCount(filters)
    ]);

    vocabItems.value = result.vocab;
    totalCount.value = count;
    
    // Load translations for current page items
    await loadTranslationsForCurrentPage();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load vocabulary';
  } finally {
    loading.value = false;
  }
}

async function loadTranslationsForCurrentPage() {
  try {
    const translationData: Record<string, string[]> = {};
    
    // Get all translation IDs for current page vocab items
    const allTranslationIds = vocabItems.value.flatMap(vocab => vocab.translations);
    const uniqueTranslationIds = [...new Set(allTranslationIds)];
    
    if (uniqueTranslationIds.length > 0) {
      // Load all translations at once
      const translations = await translationRepo.getTranslationsByIds(uniqueTranslationIds);
      const translationMap = new Map(translations.map(t => [t.uid, t.content]));
      
      // Map translations back to vocab items
      for (const vocab of vocabItems.value) {
        translationData[vocab.uid] = vocab.translations
          .map(id => translationMap.get(id))
          .filter((content): content is string => content !== undefined);
      }
    }
    
    vocabTranslations.value = translationData;
  } catch (err) {
    console.error('Failed to load translations:', err);
  }
}

async function deleteVocab(uid: string) {
  const vocabToDelete = vocabItems.value.find(v => v.uid === uid);
  if (!vocabToDelete || !confirm(`Are you sure you want to delete "${vocabToDelete.content}"?`)) {
    return;
  }

  try {
    await vocabRepo.deleteVocab(uid);
    await loadVocab(); // Reload to update pagination
  } catch (err) {
    console.error('Failed to delete vocab:', err);
    error.value = 'Failed to delete vocabulary item';
  }
}

async function loadFilterOptions() {
  try {
    [availableLanguages.value, availableSets.value] = await Promise.all([
      languageRepo.getAll(),
      localSetRepo.getAllLocalSets()
    ]);

    // If no URL filters are set, initialize with all languages and sets selected
    if (selectedLanguages.value.length === 0 && selectedSets.value.length === 0) {
      selectedLanguages.value = availableLanguages.value.map(l => l.code);
      selectedSets.value = ['user-added', ...availableSets.value.map(s => s.uid)];
    }
  } catch (err) {
    console.error('Failed to load filter options:', err);
  }
}

// Watch for URL parameter changes from browser navigation
watch(
  () => route.query,
  (newQuery) => {
    searchQuery.value = newQuery.search as string || '';
    selectedLanguages.value = parseArrayParam(newQuery.languages);
    selectedSets.value = parseArrayParam(newQuery.sets);
    currentPage.value = parseInt(newQuery.page as string) || 1;
    pageSize.value = parseInt(newQuery.pageSize as string) || 25;
    loadVocab();
  }
);

onMounted(async () => {
  await loadFilterOptions();
  await loadVocab();
});
</script>