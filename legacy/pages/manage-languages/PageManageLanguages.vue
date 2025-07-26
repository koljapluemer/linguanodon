<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Languages, Target, X, Plus } from 'lucide-vue-next';
import { languageService } from '@/entities/languages';
import type { Language } from '@/entities/languages';
import isoLangs from './isoLangs.json';

// State
const allLanguages = ref<Language[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const nativeLanguages = computed(() => allLanguages.value.filter(l => l.isNative));
const targetLanguages = computed(() => allLanguages.value.filter(l => l.isTarget));

// Add/search state
const addNativeSearch = ref('');
const addTargetSearch = ref('');
const addNativeSelected = ref<{ code: string; name: string } | null>(null);
const addTargetSelected = ref<{ code: string; name: string } | null>(null);
const addNativeSaving = ref(false);
const addTargetSaving = ref(false);

/**
 * Load all languages from the repository.
 */
async function loadLanguages() {
  loading.value = true;
  error.value = null;
  try {
    allLanguages.value = await languageService.getAll();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load languages';
  } finally {
    loading.value = false;
  }
}
onMounted(loadLanguages);

/**
 * Compute available native languages for selection.
 */
const availableNative = computed(() => {
  const used = new Set(nativeLanguages.value.map(l => l.code));
  return (isoLangs as { code: string; name: string }[])
    .filter(l => !used.has(l.code))
    .filter(l => l.name.toLowerCase().includes(addNativeSearch.value.toLowerCase()) || l.code.toLowerCase().includes(addNativeSearch.value.toLowerCase()));
});

/**
 * Add a language to native languages.
 */
async function addNativeLanguage() {
  if (!addNativeSelected.value) return;
  addNativeSaving.value = true;
  try {
    // If language exists, update; else, add
    const existing = allLanguages.value.find(l => l.code === addNativeSelected.value!.code);
    if (existing) {
      await languageService.update({ ...existing, isNative: true });
    } else {
      await languageService.add({
        code: addNativeSelected.value.code,
        name: addNativeSelected.value.name,
        isAddedByUser: true,
        isNative: true,
        isTarget: false
      });
    }
    addNativeSelected.value = null;
    addNativeSearch.value = '';
    await loadLanguages();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add native language';
  } finally {
    addNativeSaving.value = false;
  }
}

/**
 * Compute available target languages for selection.
 */
const availableTarget = computed(() => {
  const used = new Set(targetLanguages.value.map(l => l.code));
  return (isoLangs as { code: string; name: string }[])
    .filter(l => !used.has(l.code))
    .filter(l => l.name.toLowerCase().includes(addTargetSearch.value.toLowerCase()) || l.code.toLowerCase().includes(addTargetSearch.value.toLowerCase()));
});

/**
 * Add a language to target languages.
 */
async function addTargetLanguage() {
  if (!addTargetSelected.value) return;
  addTargetSaving.value = true;
  try {
    const existing = allLanguages.value.find(l => l.code === addTargetSelected.value!.code);
    if (existing) {
      await languageService.update({ ...existing, isTarget: true });
    } else {
      await languageService.add({
        code: addTargetSelected.value.code,
        name: addTargetSelected.value.name,
        isAddedByUser: true,
        isNative: false,
        isTarget: true
      });
    }
    addTargetSelected.value = null;
    addTargetSearch.value = '';
    await loadLanguages();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add target language';
  } finally {
    addTargetSaving.value = false;
  }
}

/**
 * Remove a language from native languages.
 */
async function removeNativeLanguage(code: string) {
  try {
    const lang = allLanguages.value.find(l => l.code === code);
    if (lang) {
      await languageService.update({ ...lang, isNative: false });
      await loadLanguages();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to remove native language';
  }
}

/**
 * Remove a language from target languages.
 */
async function removeTargetLanguage(code: string) {
  try {
    const lang = allLanguages.value.find(l => l.code === code);
    if (lang) {
      await languageService.update({ ...lang, isTarget: false });
      await loadLanguages();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to remove target language';
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl font-bold">Manage Languages</h1>
      </div>
      <p class="text-base-content/70">
        Configure your native and target languages for personalized learning.
      </p>
    </div>
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading...</p>
    </div>
    <div v-else>
      <div v-if="error" class="alert alert-error mb-4">{{ error }}</div>
      <div class="space-y-8">
        <!-- Native Languages Card -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title text-lg flex items-center gap-2">
              <Languages class="w-5 h-5" />
              Native Languages
            </h3>
            <p class="text-base-content/70 text-sm mb-4">
              Languages you speak fluently. These will be used as the source language for translations.
            </p>
            <div v-if="nativeLanguages.length > 0" class="space-y-2 mb-4">
              <div v-for="language in nativeLanguages" :key="language.code" class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div>
                  <div class="font-medium">{{ language.name }}</div>
                  <div class="text-sm text-base-content/60">{{ language.code }}</div>
                </div>
                <button @click="removeNativeLanguage(language.code)" class="btn btn-error btn-sm" title="Remove language">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-else class="text-center py-6 text-base-content/60">
              <Languages class="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No native languages added yet.</p>
              <p class="text-sm">Add your native languages to get started.</p>
            </div>
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text font-medium">Add Native Language</span>
              </label>
              <div class="flex gap-2">
                <input v-model="addNativeSearch" class="input input-bordered w-full" placeholder="Search for a language..." />
                <select v-model="addNativeSelected" class="select select-bordered w-48">
                  <option :value="null">Select</option>
                  <option v-for="lang in availableNative" :key="lang.code" :value="lang">
                    {{ lang.name }} ({{ lang.code }})
                  </option>
                </select>
                <button class="btn btn-primary" :disabled="!addNativeSelected || addNativeSaving" @click="addNativeLanguage">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Target Languages Card -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title text-lg flex items-center gap-2">
              <Target class="w-5 h-5" />
              Target Languages
            </h3>
            <p class="text-base-content/70 text-sm mb-4">
              Languages you want to learn. These will be used as the target language for translations.
            </p>
            <div v-if="targetLanguages.length > 0" class="space-y-2 mb-4">
              <div v-for="language in targetLanguages" :key="language.code" class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div>
                  <div class="font-medium">{{ language.name }}</div>
                  <div class="text-sm text-base-content/60">{{ language.code }}</div>
                </div>
                <button @click="removeTargetLanguage(language.code)" class="btn btn-error btn-sm" title="Remove language">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-else class="text-center py-6 text-base-content/60">
              <Target class="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No target languages added yet.</p>
              <p class="text-sm">Add languages you want to learn.</p>
            </div>
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text font-medium">Add Target Language</span>
              </label>
              <div class="flex gap-2">
                <input v-model="addTargetSearch" class="input input-bordered w-full" placeholder="Search for a language..." />
                <select v-model="addTargetSelected" class="select select-bordered w-48">
                  <option :value="null">Select</option>
                  <option v-for="lang in availableTarget" :key="lang.code" :value="lang">
                    {{ lang.name }} ({{ lang.code }})
                  </option>
                </select>
                <button class="btn btn-primary" :disabled="!addTargetSelected || addTargetSaving" @click="addTargetLanguage">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
