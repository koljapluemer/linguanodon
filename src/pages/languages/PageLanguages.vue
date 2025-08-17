<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue';
import { Languages, X } from 'lucide-vue-next';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import isoLangs from '@/entities/languages/isoLangs.json';

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;

// State
const userLanguages = ref<LanguageData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Add language state
const addLanguageSearch = ref('');
const addLanguageSelected = ref<{ code: string; name: string; emoji?: string } | null>(null);
const addLanguageSaving = ref(false);
const showDropdown = ref(false);


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
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <Languages class="w-8 h-8" />
        <h1 class="text-3xl font-bold">Manage Languages</h1>
      </div>
      <p class="text-base-content/70">
        Configure your target languages for personalized learning.
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
        <h2 class="text-lg font-semibold">Target Languages</h2>
        <p class="text-base-content/70 text-sm mb-4">
          Languages you want to learn. You can temporarily disable languages or remove them completely.
        </p>

        <div v-if="userLanguages.length > 0" class="space-y-2 mb-4">
          <div v-for="language in userLanguages" :key="language.code" 
               class="flex items-center justify-between p-3 rounded-lg"
               :class="language.isActive ? 'bg-base-200' : 'bg-base-300 opacity-60'">
            <div class="flex items-center gap-3">
              <input 
                type="checkbox" 
                :checked="language.isActive"
                @change="toggleLanguageActive(language.code, !language.isActive)"
                class="checkbox checkbox-sm"
              />
              <div>
                <div class="font-medium flex items-center gap-2">
                  <span v-if="language.emoji">{{ language.emoji }}</span>
                  {{ language.name }}
                </div>
                <div class="text-sm text-base-content/60">{{ language.code }}</div>
              </div>
            </div>
            <button 
              @click="removeLanguage(language.code)" 
              class="btn btn-error btn-sm" 
              title="Remove language completely"
            >
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
            <input 
              v-model="addLanguageSearch" 
              class="input input-bordered w-full" 
              placeholder="Type to search for a language..." 
              @focus="showDropdown = true"
              @blur="hideDropdown"
            />
            <div 
              v-if="showDropdown && addLanguageSearch && availableLanguages.length > 0" 
              class="absolute top-full left-0 right-0 z-50 bg-base-100 border border-base-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              <button
                v-for="lang in availableLanguages" 
                :key="lang.code"
                class="w-full text-left px-4 py-2 hover:bg-base-200 focus:bg-base-200 border-none bg-transparent"
                @mousedown.prevent="selectLanguage(lang)"
              >
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
      </div>
    </div>
  </div>
</template>