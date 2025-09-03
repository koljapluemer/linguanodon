<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue';
import { Settings, Languages, X, Search } from 'lucide-vue-next';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import { useToast } from '@/shared/toasts';
import isoLangs from '@/entities/languages/isoLangs.json';

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;

// State
const userLanguages = ref<LanguageData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Add language state
const addLanguageSearch = ref('');
const addLanguageSelected = ref<{ code: string; name: string; emoji?: string } | null>(null);
const addLanguageSaving = ref(false);
const showDropdown = ref(false);

// Empty sound detection state
const detectingSounds = ref(false);
const emptyAudioResults = ref<{ uid: string; content: string; reason: string }[]>([]);
const analysisCompleted = ref(false);
const deletingEmptyAudio = ref(false);


async function loadLanguages() {
  loading.value = true;
  error.value = null;
  try {
    userLanguages.value = await languageRepo.getAll();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load languages';
  } finally {
    loading.value = false;
  }
}

onMounted(loadLanguages);

const availableLanguages = computed(() => {
  const usedCodes = new Set(userLanguages.value.map(l => l.code));
  return (isoLangs as { code: string; name: string; emoji?: string }[])
    .filter(l => !usedCodes.has(l.code))
    .filter(l =>
      l.name.toLowerCase().includes(addLanguageSearch.value.toLowerCase()) ||
      l.code.toLowerCase().includes(addLanguageSearch.value.toLowerCase())
    )
    .slice(0, 20); // Limit dropdown size
});

async function addLanguage() {
  if (!addLanguageSelected.value) return;

  addLanguageSaving.value = true;
  try {
    const newLanguage: LanguageData = {
      code: addLanguageSelected.value.code,
      name: addLanguageSelected.value.name,
      emoji: addLanguageSelected.value.emoji,
      isActive: true
    };

    await languageRepo.add(newLanguage);
    addLanguageSelected.value = null;
    addLanguageSearch.value = '';
    await loadLanguages();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add language';
  } finally {
    addLanguageSaving.value = false;
  }
}

async function toggleLanguageActive(code: string, isActive: boolean) {
  try {
    await languageRepo.setActive(code, isActive);
    await loadLanguages();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update language';
  }
}

async function removeLanguage(code: string) {
  try {
    await languageRepo.delete(code);
    await loadLanguages();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to remove language';
  }
}

function selectLanguage(lang: { code: string; name: string; emoji?: string }) {
  addLanguageSelected.value = lang;
  addLanguageSearch.value = lang.name;
  showDropdown.value = false;
  addLanguage();
}

function hideDropdown() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

// Empty sound detection utilities
async function getAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(audioBlob);
  });
}

function isLikelyEmptyAudio(audioBlob: Blob): boolean {
  const minSizeThreshold = 1000; // bytes
  return audioBlob.size < minSizeThreshold;
}

async function isAudioTooShort(audioBlob: Blob, minDuration = 0.1): Promise<boolean> {
  const duration = await getAudioDuration(audioBlob);
  return duration < minDuration;
}

async function isAudioSilent(audioBlob: Blob, threshold = 0.001): Promise<boolean> {
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    let rmsSum = 0;
    let sampleCount = 0;
    
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        rmsSum += channelData[i] * channelData[i];
        sampleCount++;
      }
    }
    
    const rms = Math.sqrt(rmsSum / sampleCount);
    return rms < threshold;
  } catch (error) {
    console.warn('Audio analysis failed:', error);
    return false;
  }
}

async function detectEmptyAudio(audioBlob: Blob): Promise<{ isEmpty: boolean; reason: string | null }> {
  // Quick checks first
  if (isLikelyEmptyAudio(audioBlob)) {
    return { isEmpty: true, reason: 'file_too_small' };
  }
  
  if (await isAudioTooShort(audioBlob)) {
    return { isEmpty: true, reason: 'duration_too_short' };
  }
  
  // Deep analysis
  try {
    const isSilent = await isAudioSilent(audioBlob);
    return { isEmpty: isSilent, reason: isSilent ? 'silent_audio' : null };
  } catch {
    return { isEmpty: false, reason: 'analysis_failed' };
  }
}

async function detectEmptySoundFiles() {
  const toast = useToast();
  
  detectingSounds.value = true;
  analysisCompleted.value = false;
  emptyAudioResults.value = [];
  
  try {
    // Get all vocab with sound
    const allVocab = await vocabRepo.getVocab();
    const vocabWithSound = allVocab.filter(v => v.hasSound && v.sound?.blob);
    
    console.log(`Analyzing ${vocabWithSound.length} audio files...`);
    toast.info(`Analyzing ${vocabWithSound.length} audio files...`, { duration: 2000 });
    
    let emptyCount = 0;
    const results: { uid: string; content: string; reason: string }[] = [];
    
    for (const vocab of vocabWithSound) {
      if (vocab.sound?.blob) {
        const detection = await detectEmptyAudio(vocab.sound.blob);
        if (detection.isEmpty) {
          emptyCount++;
          results.push({
            uid: vocab.uid,
            content: vocab.content || '...',
            reason: detection.reason || 'unknown'
          });
        }
      }
    }
    
    console.log(`Found ${emptyCount} empty sound files out of ${vocabWithSound.length} total:`);
    if (results.length > 0) {
      console.table(results);
    }
    
    // Store results for display
    emptyAudioResults.value = results;
    analysisCompleted.value = true;
    
    // Show toast with results
    if (emptyCount === 0) {
      toast.success(`No empty sound files found! All ${vocabWithSound.length} audio files are valid.`);
    } else {
      toast.warning(`Found ${emptyCount} empty sound files out of ${vocabWithSound.length} total.`, 
        { duration: 6000 });
    }
    
  } catch (error) {
    console.error('Error detecting empty sound files:', error);
    toast.error('Error analyzing sound files.');
  } finally {
    detectingSounds.value = false;
  }
}

async function deleteEmptyAudio() {
  if (emptyAudioResults.value.length === 0) return;
  
  const toast = useToast();
  deletingEmptyAudio.value = true;
  
  try {
    let deletedCount = 0;
    
    for (const result of emptyAudioResults.value) {
      await vocabRepo.removeSoundFromVocab(result.uid);
      deletedCount++;
    }
    
    toast.success(`Deleted ${deletedCount} empty sound files.`);
    
    // Clear results after deletion
    emptyAudioResults.value = [];
    analysisCompleted.value = false;
    
  } catch (error) {
    console.error('Error deleting empty sound files:', error);
    toast.error('Error deleting empty sound files.');
  } finally {
    deletingEmptyAudio.value = false;
  }
}
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-2">
      <Settings class="w-8 h-8" />
      <h1 class="text-3xl font-bold">Settings</h1>
    </div>
    <p class="text-base-content/70">
      Configure your languages and manage your learning data.
    </p>
  </div>

  <div v-if="loading" class="text-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="mt-4">Loading...</p>
  </div>

  <div v-else>
    <div v-if="error" class="alert alert-error mb-4">{{ error }}</div>

    <!-- Target Languages Card -->
    <div class="space-y-6">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <Languages class="w-5 h-5" />
        Target Languages
      </h2>
      <p class="text-base-content/70 text-sm mb-4">
        Languages you want to learn. You can temporarily disable languages or remove them completely.
      </p>

      <div v-if="userLanguages.length > 0" class="space-y-2 mb-4">
        <div v-for="language in userLanguages" :key="language.code"
          class="flex items-center justify-between p-3 rounded-lg"
          :class="language.isActive ? 'bg-base-200' : 'bg-base-300 opacity-60'">
          <div class="flex items-center gap-3">
            <input type="checkbox" :checked="language.isActive"
              @change="toggleLanguageActive(language.code, !language.isActive)" class="checkbox checkbox-sm" />
            <div>
              <div class="font-medium flex items-center gap-2">
                <span v-if="language.emoji">{{ language.emoji }}</span>
                {{ language.name }}
              </div>
              <div class="text-sm text-base-content/60">{{ language.code }}</div>
            </div>
          </div>
          <button @click="removeLanguage(language.code)" class="btn btn-error btn-sm"
            title="Remove language completely">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-else class="text-center py-6 text-base-content/60">
        <Languages class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No target languages added yet.</p>
        <p class="text-sm">Add languages you want to learn.</p>
      </div>

      <!-- Add Language Section -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm font-medium">Add Target Language</label>
        <div class="relative">
          <input v-model="addLanguageSearch" class="input input-bordered w-full"
            placeholder="Type to search for a language..." @focus="showDropdown = true" @blur="hideDropdown" />
          <div v-if="showDropdown && addLanguageSearch && availableLanguages.length > 0"
            class="absolute top-full left-0 right-0 z-50 bg-base-100 border border-base-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
            <button v-for="lang in availableLanguages" :key="lang.code"
              class="w-full text-left px-4 py-2 hover:bg-base-200 focus:bg-base-200 border-none bg-transparent"
              @mousedown.prevent="selectLanguage(lang)">
              <div class="flex items-center gap-2">
                <span v-if="lang.emoji">{{ lang.emoji }}</span>
                <span class="font-medium">{{ lang.name }}</span>
                <span class="text-sm text-base-content/60">({{ lang.code }})</span>
              </div>
            </button>
          </div>
          <div v-if="addLanguageSearch && availableLanguages.length === 0" class="text-xs text-warning mt-1">
            No languages found matching your search.
          </div>
        </div>
      </div>

      <!-- Data Management Section -->
      <div class="space-y-6 mt-12">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <Search class="w-5 h-5" />
          Data Management
        </h2>
        <p class="text-base-content/70 text-sm mb-4">
          Tools to analyze and manage your learning data.
        </p>

        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <h3 class="card-title text-base">Audio Analysis</h3>
            <p class="text-sm text-base-content/70 mb-4">
              Detect empty or silent audio files in your vocabulary collection.
            </p>
            
            <div class="flex gap-2">
              <button 
                @click="detectEmptySoundFiles" 
                :disabled="detectingSounds"
                class="btn btn-outline btn-sm w-fit">
                <Search class="w-4 h-4 mr-2" />
                <span v-if="detectingSounds" class="loading loading-spinner loading-xs mr-2"></span>
                {{ detectingSounds ? 'Analyzing Audio Files...' : 'Detect Empty Sound Files' }}
              </button>
              
              <button 
                @click="deleteEmptyAudio" 
                :disabled="!analysisCompleted || emptyAudioResults.length === 0 || deletingEmptyAudio"
                class="btn btn-error btn-sm w-fit">
                <span v-if="deletingEmptyAudio" class="loading loading-spinner loading-xs mr-2"></span>
                {{ deletingEmptyAudio ? 'Deleting...' : `Delete ${emptyAudioResults.length} Empty Audio Files` }}
              </button>
            </div>
            
            <!-- Results Details -->
            <div v-if="analysisCompleted && emptyAudioResults.length > 0" class="mt-4">
              <details class="collapse collapse-plus bg-base-200">
                <summary class="collapse-title text-sm font-medium">
                  View {{ emptyAudioResults.length }} vocabulary items with broken audio
                </summary>
                <div class="collapse-content">
                  <ul class="list-disc list-inside space-y-1 text-sm mt-2">
                    <li v-for="result in emptyAudioResults" :key="result.uid">
                      <router-link 
                        :to="{ name: 'vocab-list', query: { search: result.content !== '...' ? result.content : result.uid } }"
                        class="link link-primary hover:link-hover"
                      >
                        {{ result.content }}
                      </router-link>
                      <span class="text-base-content/60 ml-2 text-xs">({{ result.reason.replace('_', ' ') }})</span>
                    </li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>