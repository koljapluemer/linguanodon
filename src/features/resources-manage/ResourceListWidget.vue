<template>
  <div class="flex justify-between items-center mb-6">
    <h1>{{ $t('resources.title') }}</h1>
    <router-link to="/resources/new" class="btn btn-primary">
      {{ $t('resources.addNew') }}
    </router-link>
  </div>

  <!-- Search -->
  <input v-model="searchQuery" @input="debouncedSearch" type="text" :placeholder="$t('resources.search')"
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
      <span class="text-light">{{ totalCount }} {{ $t('common.resources') }}</span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>{{ $t('common.title') }}</th>
            <th>{{ $t('common.language') }}</th>
            <th>{{ $t('resources.content') }}</th>
            <th>{{ $t('common.link') }}</th>
            <th>{{ $t('common.set') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resourceItems" :key="resource.uid">
            <td>
              <router-link :to="`/resources/${resource.uid}/edit`" class="font-bold link link-hover">
                {{ resource.title }}
              </router-link>
            </td>
            <td>
              <span class="flex items-center gap-2">
                <span v-if="getLanguageEmoji(resource.language)">{{ getLanguageEmoji(resource.language) }}</span>
                {{ getLanguageName(resource.language) }}
              </span>
            </td>
            <td class="max-w-xs">
              <div v-if="resource.content" class="text-sm truncate" :title="resource.content">
                {{ resource.content }}
              </div>
              <div v-else class="text-base-content/60 italic text-sm">
                {{ $t('resources.noContent') }}
              </div>
            </td>
            <td class="max-w-sm">
              <LinkDisplayMini v-if="resource.link" :link="resource.link" />
              <div v-else class="text-base-content/60 italic text-sm">
                {{ $t('common.noLink') }}
              </div>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="origin in resource.origins" :key="origin" class="badge badge-outline badge-sm">
                  {{ getOriginDisplayName(origin) }}
                </span>
              </div>
            </td>
            <td>
              <button @click="deleteResource(resource.uid)" class="btn btn-sm btn-ghost">
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

    <div v-if="resourceItems.length === 0" class="text-center py-8">
      <p class="text-light">{{ $t('resources.states.noItems') }}</p>
      <router-link to="/resources/new" class="btn btn-primary mt-4">
        {{ $t('resources.addNew') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import type { ResourceRepoContract, ResourceListFilters } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';
import Pagination from '@/shared/ui/Pagination.vue';
import LinkDisplayMini from '@/shared/links/LinkDisplayMini.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;

// Data
const resourceItems = ref<ResourceData[]>([]);
const totalCount = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);

// URL parameter initialization
function parseArrayParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
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

const languageFilterTitle = computed(() => 
  `${t('common.languages')} (${selectedLanguages.value.length} ${t('common.selected')})`
);

const setFilterTitle = computed(() => 
  `${t('common.sets')} (${selectedSets.value.length} ${t('common.selected')})`
);

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
    loadResources();
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
  loadResources();
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
  loadResources();
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    updateUrlParams();
    loadResources();
  }
}

function handlePageSizeChange(newSize: number) {
  pageSize.value = newSize;
  currentPage.value = 1; // Reset to first page when changing page size
  updateUrlParams();
  loadResources();
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
async function loadResources() {
  loading.value = true;
  error.value = null;

  try {
    const filters: ResourceListFilters = {
      searchQuery: searchQuery.value?.trim() || undefined,
      languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : undefined,
      origins: selectedSets.value.length > 0 ? selectedSets.value : undefined
    };

    const offset = (currentPage.value - 1) * pageSize.value;

    const [result, count] = await Promise.all([
      resourceRepo.getResourcesPaginated(offset, pageSize.value, filters),
      resourceRepo.getTotalResourcesCount(filters)
    ]);

    resourceItems.value = result;
    totalCount.value = count;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load resources';
  } finally {
    loading.value = false;
  }
}

async function deleteResource(uid: string) {
  const resourceToDelete = resourceItems.value.find(r => r.uid === uid);
  if (!resourceToDelete || !confirm(`Are you sure you want to delete "${resourceToDelete.title}"?`)) {
    return;
  }

  try {
    await resourceRepo.deleteResource(uid);
    await loadResources(); // Reload to update pagination
  } catch (err) {
    console.error('Failed to delete resource:', err);
    error.value = 'Failed to delete resource';
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
    loadResources();
  }
);

onMounted(async () => {
  await loadFilterOptions();
  await loadResources();
});
</script>