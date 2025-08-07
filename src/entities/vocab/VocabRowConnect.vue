<template>
  <div class="card bg-base-100 border-2 border-dashed border-base-300">
    <div class="card-body p-4">
      <div class="flex items-end gap-4">

      <!-- Search Input with label above -->
      <div class="form-control relative">
        <label class="label">
          <span class="label-text">Connect Existing Vocabulary</span>
        </label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Type to search for existing vocab..."
          class="input input-bordered input-sm"
          @focus="showDropdown = true"
          @blur="hideDropdown"
        />
        
        <!-- Search Results Dropdown -->
        <div 
          v-if="showDropdown && searchQuery && searchResults.length > 0" 
          class="absolute top-full left-0 right-0 z-50 bg-base-100 border border-base-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
        >
          <button
            v-for="vocab in searchResults" 
            :key="vocab.uid"
            class="w-full text-left px-4 py-3 hover:bg-base-200 focus:bg-base-200 border-none bg-transparent"
            @mousedown.prevent="selectVocab(vocab)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <div class="w-20">
                    <span class="badge badge-outline badge-sm">
                      {{ vocab.language }}
                    </span>
                  </div>
                  <div class="font-medium">{{ vocab.content || '...' }}</div>
                  <div class="text-sm text-base-content/60">
                    {{ vocab.translations.join(', ') || '(no translations)' }}
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
        
        <!-- No results message -->
        <div v-if="searchQuery && searchResults.length === 0 && !loading" class="label">
          <span class="label-text-alt text-warning">No vocabulary found matching your search.</span>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="loading" class="label">
          <span class="label-text-alt">Searching...</span>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { VocabData } from './vocab/VocabData';
import type { VocabAndTranslationRepoContract } from './VocabAndTranslationRepoContract';

const props = defineProps<{
  defaultLanguage?: string;
  excludeIds?: string[]; // IDs to exclude from search results
}>();

const emit = defineEmits<{
  connect: [VocabData];
  cancel: [];
}>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!vocabRepo) {
  console.error('vocabRepo not provided');
}

const searchQuery = ref('');
const allVocab = ref<VocabData[]>([]);
const loading = ref(false);
const showDropdown = ref(false);

// Search results based on query
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];
  
  const query = searchQuery.value.toLowerCase();
  
  return allVocab.value
    .filter(vocab => {
      // Exclude already connected vocab
      if (props.excludeIds?.includes(vocab.uid)) return false;
      
      // Search in content
      if (vocab.content?.toLowerCase().includes(query)) return true;
      
      // Search in translations
      if (vocab.translations.some(translation => 
        translation.toLowerCase().includes(query)
      )) return true;
      
      return false;
    })
    .slice(0, 20); // Limit results
});

// Load all vocab when component mounts
async function loadAllVocab() {
  if (!vocabRepo) return;
  
  loading.value = true;
  try {
    allVocab.value = await vocabRepo.getVocab();
  } catch (error) {
    console.error('Failed to load vocabulary:', error);
  } finally {
    loading.value = false;
  }
}

function selectVocab(vocab: VocabData) {
  emit('connect', vocab);
  searchQuery.value = '';
  showDropdown.value = false;
}

function hideDropdown() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

// Load vocab when component mounts
loadAllVocab();
</script>