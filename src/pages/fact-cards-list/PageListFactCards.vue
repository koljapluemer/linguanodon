<template>
  <div class="flex justify-between items-center mb-6">
    <h1>{{ $t('factCards.title') }}</h1>
    <router-link to="/fact-cards/new" class="btn btn-primary">
      {{ $t('factCards.addNew') }}
    </router-link>
  </div>

  <!-- Search -->
  <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Search fact cards..."
    class="input input-bordered w-full" />

  <!-- Filters -->
  <div class="grid gap-2 md:grid-cols-2 mb-2">
    <!-- Language Filter -->
    <details class="collapse collapse-arrow bg-base-200">
      <summary class="collapse-title font-medium">
        {{ $t('common.languages') }} {{ $t('manage.vocab.count') }}{{ selectedLanguages.length }} {{ $t('vocabulary.filters.selected') }}{{ $t('manage.vocab.countEnd') }}
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
      <span class="text-light">{{ totalCount }} {{ $t('factCards.stats.totalItems') }}</span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>{{ $t('factCards.front') }}</th>
            <th>{{ $t('factCards.back') }}</th>
            <th>{{ $t('common.language') }}</th>
            <th>{{ $t('common.set') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="factCard in factCardItems" :key="factCard.uid">
            <td class="max-w-xs">
              <router-link :to="`/fact-cards/${factCard.uid}/edit`" class="font-bold link link-hover">
                <div class="text-sm truncate" :title="factCard.front">
                  {{ factCard.front }}
                </div>
              </router-link>
            </td>
            <td class="max-w-xs">
              <div class="text-sm truncate" :title="factCard.back">
                {{ factCard.back }}
              </div>
            </td>
            <td>
              <span class="flex items-center gap-2">
                <span v-if="getLanguageEmoji(factCard.language)">{{ getLanguageEmoji(factCard.language) }}</span>
                {{ getLanguageName(factCard.language) }}
              </span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="origin in factCard.origins" :key="origin" class="badge badge-outline badge-sm">
                  {{ getOriginDisplayName(origin) }}
                </span>
              </div>
            </td>
            <td>
              <button @click="deleteFactCard(factCard.uid)" class="btn btn-sm btn-ghost">
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

    <div v-if="factCardItems.length === 0" class="text-center py-8">
      <p class="text-light">{{ $t('factCards.states.noItems') }}</p>
      <router-link to="/fact-cards/new" class="btn btn-primary mt-4">
        {{ $t('factCards.addNew') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import type { FactCardRepoContract, FactCardListFilters } from '@/entities/fact-cards/FactCardRepoContract';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';
import Pagination from '@/shared/ui/Pagination.vue';

const factCardRepo = inject<FactCardRepoContract>('factCardRepo')!;
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;

// Data
const factCardItems = ref<FactCardData[]>([]);
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

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadFactCards();
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
  loadFactCards();
}

function toggleSet(setId: string) {
  const index = selectedSets.value.indexOf(setId);
  if (index > -1) {
    selectedSets.value.splice(index, 1);
  } else {
    selectedSets.value.push(setId);
  }
  currentPage.value = 1;
  loadFactCards();
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadFactCards();
  }
}

function handlePageSizeChange(newSize: number) {
  pageSize.value = newSize;
  currentPage.value = 1; // Reset to first page when changing page size
  loadFactCards();
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
async function loadFactCards() {
  loading.value = true;
  error.value = null;

  try {
    const filters: FactCardListFilters = {
      searchQuery: searchQuery.value?.trim() || undefined,
      languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : undefined,
      origins: selectedSets.value.length > 0 ? selectedSets.value : undefined
    };

    const offset = (currentPage.value - 1) * pageSize.value;

    const [result, count] = await Promise.all([
      factCardRepo.getFactCardsPaginated(offset, pageSize.value, filters),
      factCardRepo.getTotalFactCardsCount(filters)
    ]);

    factCardItems.value = result;
    totalCount.value = count;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load fact cards';
  } finally {
    loading.value = false;
  }
}

async function deleteFactCard(uid: string) {
  const factCardToDelete = factCardItems.value.find(f => f.uid === uid);
  if (!factCardToDelete || !confirm(`Are you sure you want to delete this fact card?`)) {
    return;
  }

  try {
    await factCardRepo.deleteFactCard(uid);
    await loadFactCards(); // Reload to update pagination
  } catch (err) {
    console.error('Failed to delete fact card:', err);
    error.value = 'Failed to delete fact card';
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
  await loadFactCards();
});
</script>