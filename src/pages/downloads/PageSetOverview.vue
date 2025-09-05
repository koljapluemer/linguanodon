<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <router-link to="/downloads" class="btn btn-ghost btn-sm mb-4">
        ← Back to Downloads
      </router-link>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-4">Loading set information...</span>
    </div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h1 class="card-title text-3xl mb-2">{{ metadata?.title || setName }}</h1>
          <p class="text-base-content/60 mb-6">
            <span class="badge badge-outline">{{ language.toUpperCase() }}</span>
            <span v-if="metadata?.title" class="ml-2">{{ setName }}</span>
          </p>

          <div class="divider"></div>

          <div v-if="isDownloaded" class="alert alert-success mb-6">
            <CheckCircle class="w-5 h-5" />
            <span>This set is already downloaded and ready to use!</span>
          </div>

          <div class="card-actions justify-center">
            <div v-if="metadata?.preferredMode">
              <button 
                @click="downloadAndStart" 
                class="btn btn-primary btn-lg"
                :disabled="downloading"
              >
                <Download v-if="!downloading" class="w-5 h-5 mr-2" />
                <span v-if="downloading" class="loading loading-spinner loading-sm mr-2"></span>
                {{ isDownloaded ? 'Start' : 'Download and Start' }}
              </button>
              <p class="text-sm text-base-content/60 mt-2 text-center">
                Will start in {{ getPracticeModeName(metadata.preferredMode) }} mode
              </p>
            </div>
            
            <button 
              v-else
              @click="downloadOnly" 
              class="btn btn-primary btn-lg"
              :disabled="downloading"
            >
              <Download v-if="!downloading" class="w-5 h-5 mr-2" />
              <span v-if="downloading" class="loading loading-spinner loading-sm mr-2"></span>
              {{ isDownloaded ? 'Re-download' : 'Download' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Download, CheckCircle } from 'lucide-vue-next';
import { UnifiedRemoteSetService } from '@/pages/downloads/UnifiedRemoteSetService';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import { remoteSetMetaDataSchema } from '@/entities/remote-sets/remoteSetMetaData';
import { z } from 'zod';

const route = useRoute();
const router = useRouter();

const language = computed(() => route.params.language as string);
const setName = computed(() => route.params.setName as string);

const metadata = ref<z.infer<typeof remoteSetMetaDataSchema> | null>(null);
const loading = ref(true);
const downloading = ref(false);
const error = ref<string | null>(null);
const isDownloaded = ref(false);

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

function getPracticeModeName(mode: string): string {
  const modeNames: { [key: string]: string } = {
    'practice-mode-fact-card-grind': 'Fact Card Grind',
    'practice-mode-goal-getter': 'Goal Getter',
    'practice-mode-sisyphos': 'Sisyphos',
    'practice-mode-insert-images': 'Insert Images',
    'practice-mode-eyes-and-ears': 'Eyes and Ears',
    'practice-mode-ultrarandom': 'Ultrarandom',
    'practice-mode-illegal-immersion': 'Illegal Immersion',
    'practice-mode-sentence-slide': 'Sentence Slide'
  };
  return modeNames[mode] || mode;
}

async function loadSetInfo() {
  loading.value = true;
  error.value = null;

  try {
    // Load metadata
    metadata.value = await remoteSetService.getSetMetadata(language.value, setName.value);
    
    // Check if downloaded
    isDownloaded.value = await remoteSetService.isSetDownloaded(setName.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load set information';
  } finally {
    loading.value = false;
  }
}

async function downloadAndStart() {
  if (!metadata.value?.preferredMode) return;
  
  downloading.value = true;
  
  try {
    if (!isDownloaded.value) {
      await remoteSetService.downloadSet(language.value, setName.value);
      isDownloaded.value = true;
    }
    
    // Redirect to the preferred practice mode
    router.push({ name: metadata.value.preferredMode });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to download set';
  } finally {
    downloading.value = false;
  }
}

async function downloadOnly() {
  downloading.value = true;
  
  try {
    await remoteSetService.downloadSet(language.value, setName.value);
    isDownloaded.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to download set';
  } finally {
    downloading.value = false;
  }
}

onMounted(loadSetInfo);
</script>