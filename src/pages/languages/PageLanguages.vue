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

const activeLanguages = computed(() => userLanguages.value.filter(lang => lang.isActive));

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
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-lg flex items-center gap-2">
            <Languages class="w-5 h-5" />
            Target Languages
          </h3>
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
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text font-medium">Add Target Language</span>
            </label>
            <div class="flex gap-2">
              <input 
                v-model="addLanguageSearch" 
                class="input input-bordered flex-1" 
                placeholder="Search for a language..." 
              />
              <select 
                v-model="addLanguageSelected" 
                class="select select-bordered w-64"
                :disabled="!addLanguageSearch || availableLanguages.length === 0"
              >
                <option :value="null">
                  {{ addLanguageSearch ? 'Select from results' : 'Type to search' }}
                </option>
                <option 
                  v-for="lang in availableLanguages" 
                  :key="lang.code" 
                  :value="lang"
                >
                  {{ lang.emoji ? `${lang.emoji} ` : '' }}{{ lang.name }} ({{ lang.code }})
                </option>
              </select>
              <button 
                class="btn btn-primary" 
                :disabled="!addLanguageSelected || addLanguageSaving" 
                @click="addLanguage"
              >
                {{ addLanguageSaving ? 'Adding...' : 'Add' }}
              </button>
            </div>
            <div v-if="addLanguageSearch && availableLanguages.length === 0" class="label">
              <span class="label-text-alt text-warning">No languages found matching your search.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>