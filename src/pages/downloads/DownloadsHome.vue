<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1>{{ $t('downloads.title') }}</h1>
    </div>

    <!-- Search -->
    <input v-model="searchQuery" @input="debouncedSearch" type="text" :placeholder="$t('downloads.search')"
      class="input input-bordered w-full mb-2" />

    <!-- Filters -->
    <div class="grid gap-2 md:grid-cols-1 mb-2">
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
        <span class="text-light">{{ filteredSets.length }} {{ $t('downloads.stats.totalItems') }}</span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>{{ $t('downloads.setName') }}</th>
              <th>{{ $t('common.language') }}</th>
              <th>{{ $t('downloads.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="set in filteredSets" :key="`${set.language}-${set.name}`">
              <td>
                <button @click="goToSetOverview(set.name, set.language)" class="font-bold link link-hover text-left">
                  {{ set.title || set.name }}
                </button>
              </td>
              <td>
                <span class="flex items-center gap-2">
                  <span v-if="getLanguageEmoji(set.language)">{{ getLanguageEmoji(set.language) }}</span>
                  {{ getLanguageName(set.language) }}
                </span>
              </td>
              <td>
                <div v-if="isDownloaded(`${set.language}-${set.name}`)" class="flex items-center gap-2 text-success">
                  <CheckCircle class="w-4 h-4" />
                  <span class="badge badge-success badge-sm">{{ $t('downloads.downloaded') }}</span>
                </div>
                <span v-else class="badge badge-outline badge-sm">{{ $t('downloads.available') }}</span>
              </td>
              <td>
                <div v-if="isDownloading(`${set.language}-${set.name}`)" class="flex flex-col gap-1">
                  <div class="text-xs text-base-content/70">{{ getDownloadProgress(`${set.language}-${set.name}`)?.phase || 'Downloading...' }}</div>
                  <div class="flex items-center gap-2">
                    <progress 
                      class="progress progress-primary w-24" 
                      :value="getDownloadProgress(`${set.language}-${set.name}`)?.percentage || 0" 
                      max="100"
                    ></progress>
                    <span class="text-xs font-mono">{{ (getDownloadProgress(`${set.language}-${set.name}`)?.percentage || 0) + '%' }}</span>
                  </div>
                </div>
                <div v-else class="flex items-center gap-1">
                  <button @click="goToSetOverview(set.name, set.language)" class="btn btn-sm btn-ghost" :title="$t('downloads.viewDetails')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </button>
                  <button @click="quickDownload(set.name, set.language)" class="btn btn-sm btn-outline" :disabled="isDownloading(`${set.language}-${set.name}`)" :title="$t('downloads.quickDownload')">
                    <Download class="w-4 h-4" />
                  </button>
                  <button @click="downloadAndStart(set.name, set.language)" class="btn btn-sm btn-primary" :disabled="isDownloading(`${set.language}-${set.name}`)" :title="$t('downloads.downloadAndStart')">
                    <Play class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredSets.length === 0" class="text-center py-8">
        <p class="text-light">{{ $t('downloads.states.noItems') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute, type LocationQueryValue } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Download, CheckCircle, Play } from 'lucide-vue-next';
import { UnifiedRemoteSetService, type RemoteSetInfo, type DownloadProgress } from '@/pages/downloads/UnifiedRemoteSetService';
import { DownloadAndPracticeService } from '@/pages/downloads/DownloadAndPracticeService';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;
const noteRepo = inject<NoteRepoContract>('noteRepo')!;
const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;
const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const factCardRepo = inject<FactCardRepoContract>('factCardRepo')!;

const remoteSetService = new UnifiedRemoteSetService(
  localSetRepo,
  vocabRepo,
  translationRepo,
  noteRepo,
  resourceRepo,
  goalRepo,
  factCardRepo,
  languageRepo
);

const downloadAndPracticeService = new DownloadAndPracticeService(remoteSetService, router);

// URL parameter initialization
function parseArrayParam(value: LocationQueryValue | LocationQueryValue[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => v !== null);
  }
  return value.split(',').filter(v => v.length > 0);
}

// Extended set info to include language for the table view
interface ExtendedSetInfo extends RemoteSetInfo {
  language: string;
}

// Data
const allSets = ref<ExtendedSetInfo[]>([]);
const availableLanguages = ref<LanguageData[]>([]);
const downloadedSets = ref<Set<string>>(new Set());
const loading = ref(false);
const error = ref<string | null>(null);

// Progress tracking per set
const downloadProgress = ref<Map<string, DownloadProgress>>(new Map());
const downloadingSets = ref<Set<string>>(new Set());

// Filters and search - initialized from URL parameters
const searchQuery = ref(route.query.search as string || '');
const selectedLanguages = ref<string[]>(parseArrayParam(route.query.languages));

// Computed
const languageFilterTitle = computed(() => 
  `${t('common.languages')} (${selectedLanguages.value.length} ${t('common.selected')})`
);

const filteredSets = computed(() => {
  let filtered = allSets.value;

  // Filter by selected languages
  if (selectedLanguages.value.length > 0) {
    filtered = filtered.filter(set => selectedLanguages.value.includes(set.language));
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(set => 
      set.name.toLowerCase().includes(query) ||
      (set.title && set.title.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// URL parameter synchronization
function updateUrlParams() {
  const query: Record<string, string | undefined> = {};
  
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim();
  }
  if (selectedLanguages.value.length > 0) {
    query.languages = selectedLanguages.value.join(',');
  }

  router.replace({ query });
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    updateUrlParams();
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
  updateUrlParams();
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

async function loadLanguagesAndSets() {
  loading.value = true;
  error.value = null;

  try {
    // Load available language codes from remote service
    const languageCodes = await remoteSetService.getAvailableLanguages();

    // Convert language codes to LanguageData format by getting from languageRepo
    const allLanguages = await languageRepo.getActiveTargetLanguages();
    availableLanguages.value = allLanguages.filter(lang => languageCodes.includes(lang.code));

    // For missing codes, create proper LanguageData objects using the language repo
    const missingCodes = languageCodes.filter(code =>
      !availableLanguages.value.some(lang => lang.code === code)
    );

    if (missingCodes.length > 0) {
      const missingLanguages = await Promise.all(
        missingCodes.map(code => languageRepo.createLanguageFromCode(code))
      );
      availableLanguages.value.push(...missingLanguages);
    }

    // If no URL filters are set, initialize with all languages selected
    if (selectedLanguages.value.length === 0) {
      selectedLanguages.value = availableLanguages.value.map(l => l.code);
    }

    // Load sets for all available languages
    const allSetsData: ExtendedSetInfo[] = [];
    const downloadedStatuses: Array<{ key: string, isDownloaded: boolean }> = [];

    for (const language of availableLanguages.value) {
      try {
        const sets = await remoteSetService.getAvailableSets(language.code);
        const extendedSets = sets.map(set => ({
          ...set,
          language: language.code
        }));
        allSetsData.push(...extendedSets);

        // Check download status for each set
        const statuses = await Promise.all(
          sets.map(async (set) => ({
            key: `${language.code}-${set.name}`,
            isDownloaded: await remoteSetService.isSetDownloaded(set.name)
          }))
        );
        downloadedStatuses.push(...statuses);
      } catch (err) {
        console.error(`Failed to load sets for ${language.code}:`, err);
      }
    }

    allSets.value = allSetsData;
    downloadedSets.value = new Set(
      downloadedStatuses.filter(s => s.isDownloaded).map(s => s.key)
    );
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data';
  } finally {
    loading.value = false;
  }
}

async function quickDownload(setName: string, language: string) {
  const key = `${language}-${setName}`;
  
  await downloadAndPracticeService.downloadOnly({
    language,
    setName,
    onDownloadStart: () => {
      downloadingSets.value.add(key);
      error.value = null;
    },
    onDownloadProgress: (progress) => {
      downloadProgress.value.set(key, progress);
    },
    onDownloadComplete: () => {
      downloadedSets.value.add(key);
      downloadingSets.value.delete(key);
      downloadProgress.value.delete(key);
    },
    onError: (errorMessage) => {
      error.value = errorMessage;
      downloadingSets.value.delete(key);
      downloadProgress.value.delete(key);
    }
  });
}

async function downloadAndStart(setName: string, language: string) {
  const key = `${language}-${setName}`;
  
  await downloadAndPracticeService.downloadAndStartPractice({
    language,
    setName,
    onDownloadStart: () => {
      downloadingSets.value.add(key);
      error.value = null;
    },
    onDownloadProgress: (progress) => {
      downloadProgress.value.set(key, progress);
    },
    onDownloadComplete: () => {
      downloadedSets.value.add(key);
      downloadingSets.value.delete(key);
      downloadProgress.value.delete(key);
    },
    onError: (errorMessage) => {
      error.value = errorMessage;
      downloadingSets.value.delete(key);
      downloadProgress.value.delete(key);
    }
  });
}

function goToSetOverview(setName: string, language: string) {
  router.push({
    name: 'set-overview',
    params: {
      language: language,
      setName: setName
    }
  });
}

function isDownloaded(key: string): boolean {
  return downloadedSets.value.has(key);
}

function isDownloading(key: string): boolean {
  return downloadingSets.value.has(key);
}

function getDownloadProgress(key: string): DownloadProgress | undefined {
  return downloadProgress.value.get(key);
}

// Watch for URL parameter changes from browser navigation
watch(
  () => route.query,
  (newQuery) => {
    searchQuery.value = newQuery.search as string || '';
    selectedLanguages.value = parseArrayParam(newQuery.languages);
  }
);

onMounted(loadLanguagesAndSets);
</script>