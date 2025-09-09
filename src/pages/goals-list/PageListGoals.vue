<template>
  <div class="flex justify-between items-center mb-6">
    <h1>{{ $t('goals.title') }}</h1>
    <router-link to="/goals/add" class="btn btn-primary">
      {{ $t('goals.addNew') }}
    </router-link>
  </div>

  <!-- Search -->
  <input v-model="searchQuery" @input="debouncedSearch" type="text" :placeholder="$t('goals.search')"
    class="input input-bordered w-full" />

  <!-- Filters -->
  <div class="grid gap-2 md:grid-cols-2 mb-2">
    <!-- Language Filter -->
    <details class="collapse collapse-arrow bg-base-200">
      <summary class="collapse-title font-medium">
        {{ languageFilterTitle }}
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
        {{ setFilterTitle }}
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
      <span class="text-light">{{ totalCount }} {{ $t('goals.stats.totalItems') }}</span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>{{ $t('goals.title') }}</th>
            <th>{{ $t('common.language') }}</th>
            <th>{{ $t('goals.milestones') }}</th>
            <th>{{ $t('goals.stats.subGoals') }}</th>
            <th>{{ $t('goals.stats.vocab') }}</th>
            <th>{{ $t('common.set') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goal in goalItems" :key="goal.uid">
            <td>
              <router-link :to="`/goals/${goal.uid}/edit`" class="font-bold link link-hover">
                {{ goal.title }}
              </router-link>
            </td>
            <td>
              <span class="flex items-center gap-2">
                <span v-if="getLanguageEmoji(goal.language)">{{ getLanguageEmoji(goal.language) }}</span>
                {{ getLanguageName(goal.language) }}
              </span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(completed, milestone) in goal.milestones" 
                  :key="milestone"
                  :class="['badge badge-sm', completed ? 'badge-success' : 'badge-outline']"
                >
                  {{ milestone }}
                </span>
                <span 
                  v-if="!goal.milestones || Object.keys(goal.milestones).length === 0"
                  class="text-light"
                >
                  {{ $t('goals.noMilestones') }}
                </span>
              </div>
            </td>
            <td>
              <span class="badge badge-outline">{{ goal.subGoals.length }}</span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="badge badge-outline">{{ goal.vocab.length }}</span>
                <span v-if="vocabStats[goal.uid]" class="badge badge-success">
                  {{ Math.round(vocabStats[goal.uid].topOfMindPercentage) }}{{ $t('goals.stats.vocabMastered') }}
                </span>
              </div>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="origin in goal.origins" :key="origin" class="badge badge-outline badge-sm">
                  {{ getOriginDisplayName(origin) }}
                </span>
              </div>
            </td>
            <td>
              <button @click="deleteGoal(goal.uid)" class="btn btn-sm btn-ghost">
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

    <div v-if="goalItems.length === 0" class="text-center py-8">
      <p class="text-light">{{ $t('goals.states.noItems') }}</p>
      <router-link to="/goals/add" class="btn btn-primary mt-4">
        {{ $t('goals.addNew') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GoalRepoContract, GoalListFilters } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';
import Pagination from '@/shared/ui/Pagination.vue';

const { t } = useI18n();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;

// Data
const goalItems = ref<GoalData[]>([]);
const totalCount = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);
const vocabStats = ref<Record<string, { topOfMindPercentage: number }>>({});

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

const languageFilterTitle = computed(() => 
  `${t('common.languages')} (${selectedLanguages.value.length} ${t('common.selected')})`
);

const setFilterTitle = computed(() => 
  `${t('common.sets')} (${selectedSets.value.length} ${t('common.selected')})`
);

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadGoals();
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
  loadGoals();
}

function toggleSet(setId: string) {
  const index = selectedSets.value.indexOf(setId);
  if (index > -1) {
    selectedSets.value.splice(index, 1);
  } else {
    selectedSets.value.push(setId);
  }
  currentPage.value = 1;
  loadGoals();
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadGoals();
  }
}

function handlePageSizeChange(newSize: number) {
  pageSize.value = newSize;
  currentPage.value = 1; // Reset to first page when changing page size
  loadGoals();
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
async function loadGoals() {
  loading.value = true;
  error.value = null;

  try {
    const filters: GoalListFilters = {
      searchQuery: searchQuery.value?.trim() || undefined,
      languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : undefined,
      origins: selectedSets.value.length > 0 ? selectedSets.value : undefined
    };

    const offset = (currentPage.value - 1) * pageSize.value;

    const [result, count] = await Promise.all([
      goalRepo.getGoalsPaginated(offset, pageSize.value, filters),
      goalRepo.getTotalGoalsCount(filters)
    ]);

    goalItems.value = result;
    totalCount.value = count;
    
    // Calculate vocab stats for current page goals
    await loadVocabStatsForCurrentPage();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load goals';
  } finally {
    loading.value = false;
  }
}

async function loadVocabStatsForCurrentPage() {
  try {
    const stats: Record<string, { topOfMindPercentage: number }> = {};
    
    // Calculate vocab stats for each goal on current page
    for (const goal of goalItems.value) {
      if (goal.vocab.length > 0) {
        const vocabItems = await Promise.all(
          goal.vocab.map(id => vocabRepo.getVocabByUID(id))
        );

        const validVocab = vocabItems.filter((v): v is VocabData => v !== undefined);
        const topOfMindCount = validVocab.filter(vocab =>
          vocab && isCurrentlyTopOfMind(vocab)
        ).length;

        stats[goal.uid] = {
          topOfMindPercentage: validVocab.length > 0
            ? (topOfMindCount / validVocab.length) * 100
            : 0
        };
      }
    }
    
    vocabStats.value = stats;
  } catch (err) {
    console.error('Failed to load vocab stats:', err);
  }
}

async function deleteGoal(uid: string) {
  const goalToDelete = goalItems.value.find(g => g.uid === uid);
  if (!goalToDelete || !confirm(`Are you sure you want to delete "${goalToDelete.title}"?`)) {
    return;
  }

  try {
    await goalRepo.delete(uid);
    await loadGoals(); // Reload to update pagination
  } catch (err) {
    console.error('Failed to delete goal:', err);
    error.value = 'Failed to delete goal';
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
  await loadGoals();
});
</script>