<template>
  <!-- Show downloads list when not in a sub-route -->
  <div v-if="$route.name === 'downloads'">
    <div class="flex justify-between items-center mb-6">
      <h1>Downloads</h1>
      <select v-model="selectedLanguage" class="select ">
        <option value="">Select Language</option>
        <option v-for="language in availableLanguages" :key="language.code" :value="language.code">
          {{ language.emoji ? `${language.emoji} ` : '' }}{{ language.name }}
        </option>
      </select>
    </div>

    <div v-if="!selectedLanguage" class="text-center py-16 text-base-content/60">
      <h3>Select a Language</h3>
      <p>Choose a language from the dropdown above to view available downloads.</p>
    </div>

    <div v-else class="space-y-6">
      <div class="card shadow">
        <div class="card-body">
          <h2>Available Sets</h2>

          <div v-if="error" class="alert alert-error mb-4">
            {{ error }}
          </div>

          <div v-if="loading" class="flex items-center justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
            <span class="ml-4">Loading sets...</span>
          </div>

          <div v-else-if="availableSets.length === 0" class="text-center py-8 text-base-content/60">
            <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No sets available for {{ selectedLanguage }}</p>
          </div>

          <div v-else class="space-y-3">
            <div class="grid gap-3">
              <div v-for="set in availableSets" :key="set.name"
                class="flex items-center justify-between p-4 rounded-lg border border-base-300 hover:border-primary hover:bg-base-200 transition-colors cursor-pointer"
                @click="goToSetOverview(set.name)">
                <div>
                  <h4>{{ set.title || set.name }}</h4>
                  <p class="text-sm text-base-content/60">
                    <span v-if="set.title">{{ set.name }} • </span>Language: {{ selectedLanguage }}
                  </p>
                </div>

                <div class="flex items-center gap-2" @click.stop>
                  <div v-if="isDownloaded(set.name)" class="flex items-center gap-2 text-success mr-2">
                    <CheckCircle class="w-5 h-5" />
                    <span class="text-sm font-medium">Downloaded</span>
                  </div>
                  <button @click="quickDownload(set.name)" class="btn btn-outline btn-sm" :disabled="loading">
                    <Download class="w-4 h-4 mr-2" />
                    {{ isDownloaded(set.name) ? 'Re-download' : 'Quick Download' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Show child component when viewing a specific set -->
  <router-view v-else />
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Download, CheckCircle } from 'lucide-vue-next';
import { UnifiedRemoteSetService, type RemoteSetInfo } from '@/pages/downloads/UnifiedRemoteSetService';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';

const router = useRouter();

const selectedLanguage = ref('');
const availableLanguages = ref<LanguageData[]>([]);
const availableSets = ref<RemoteSetInfo[]>([]);
const downloadedSets = ref<Set<string>>(new Set());
const loading = ref(false);
const error = ref<string | null>(null);

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
  factCardRepo
);

async function loadLanguages() {
  try {
    const languageCodes = await remoteSetService.getAvailableLanguages();
    ;

    // Convert language codes to LanguageData format by getting from languageRepo
    const allLanguages = await languageRepo.getActiveTargetLanguages();
    ;

    availableLanguages.value = allLanguages.filter(lang => languageCodes.includes(lang.code));
    ;

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
  } catch (error) {
    console.error('Failed to load languages:', error);
  }
}

async function loadSets() {
  if (!selectedLanguage.value) {
    availableSets.value = [];
    downloadedSets.value.clear();
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const sets = await remoteSetService.getAvailableSets(selectedLanguage.value);
    availableSets.value = sets;

    // Load downloaded status for each set
    const downloadedStatuses = await Promise.all(
      sets.map(async (set) => ({
        name: set.name,
        isDownloaded: await remoteSetService.isSetDownloaded(set.name)
      }))
    );

    downloadedSets.value = new Set(
      downloadedStatuses.filter(s => s.isDownloaded).map(s => s.name)
    );
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load sets';
  } finally {
    loading.value = false;
  }
}

async function quickDownload(setName: string) {
  if (!selectedLanguage.value) return;

  loading.value = true;
  error.value = null;

  try {
    await remoteSetService.downloadSet(selectedLanguage.value, setName);
    downloadedSets.value.add(setName);
  } catch (err) {
    console.error('Download error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to download set';
  } finally {
    loading.value = false;
  }
}

function goToSetOverview(setName: string) {
  if (!selectedLanguage.value) return;

  router.push({
    name: 'set-overview',
    params: {
      language: selectedLanguage.value,
      setName: setName
    }
  });
}

function isDownloaded(setName: string): boolean {
  return downloadedSets.value.has(setName);
}

watch(() => selectedLanguage.value, loadSets, { immediate: true });

onMounted(loadLanguages);
</script>