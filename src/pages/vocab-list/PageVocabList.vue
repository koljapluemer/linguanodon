<template>
  <div class="flex justify-between items-center mb-6">
    <h1>Vocabulary</h1>
    <router-link to="/vocab/new" class="btn btn-primary">
      Add New Vocab
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
        Languages ({{ selectedLanguages.length }} selected)
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
        Sets ({{ selectedSets.length }} selected)
      </summary>
      <div class="collapse-content">
        <ul class="flex flex-col gap-2">
          <li>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="selectedSets.includes('user-added')" @change="toggleSet('user-added')"
                class="checkbox checkbox-sm" />
              User Added
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
    <p class="mt-4">Loading vocabulary...</p>
  </div>

  <div v-else-if="error" class="alert alert-error mb-6">
    <span>{{ error }}</span>
  </div>

  <div v-else>
    <!-- Results Summary -->
    <div class="flex justify-between items-center mb-4">
      <span class="text-light">{{ totalCount }} vocabulary items</span>
      <div class="flex gap-2">
        <select v-model="pageSize" @change="loadVocab" class="select select-bordered select-sm">
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Content</th>
            <th>Language</th>
            <th>Translations</th>
            <th>Set</th>
            <th>Actions</th>
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
            <td>{{ vocab.translations?.length || 0 }}</td>
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
    <div v-if="totalCount > pageSize" class="flex justify-center mt-6">
      <div class="join">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="join-item btn">
          Previous
        </button>

        <template v-for="page in visiblePages" :key="page">
          <button @click="goToPage(page)" :class="['join-item btn', { 'btn-active': page === currentPage }]">
            {{ page }}
          </button>
        </template>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="join-item btn">
          Next
        </button>
      </div>
    </div>

    <div v-if="vocabItems.length === 0" class="text-center py-8">
      <p class="text-light">No vocabulary items found.</p>
      <router-link to="/vocab/new" class="btn btn-primary mt-4">
        Add New Vocab
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import type { VocabRepoContract, VocabListFilters } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;

// Data
const vocabItems = ref<VocabData[]>([]);
const totalCount = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);

// Filters and search
const searchQuery = ref('');
const selectedLanguages = ref<string[]>([]);
const selectedSets = ref<string[]>([]);

// Pagination
const currentPage = ref(1);
const pageSize = ref(25);

// Available options for filters
const availableLanguages = ref<LanguageData[]>([]);
const availableSets = ref<LocalSetData[]>([]);

// Computed
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
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
  loadVocab();
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadVocab();
  }
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
    const filters: VocabListFilters = {
      searchQuery: searchQuery.value?.trim() || undefined,
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
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load vocabulary';
  } finally {
    loading.value = false;
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

    // Initialize with all languages selected
    selectedLanguages.value = availableLanguages.value.map(l => l.code);
    selectedSets.value = ['user-added', ...availableSets.value.map(s => s.uid)];
  } catch (err) {
    console.error('Failed to load filter options:', err);
  }
}

onMounted(async () => {
  await loadFilterOptions();
  await loadVocab();
});
</script>