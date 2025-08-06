<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        :value="searchQuery"
        @input="$emit('search', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Search vocab by content, language, pronunciation, or notes..."
        class="input input-bordered w-full pl-10"
      />
    </div>

    <!-- Results Summary -->
    <div v-if="!loading || vocab.length > 0" class="text-sm text-gray-600">
      Showing {{ vocab.length }} {{ totalCount > 0 ? `of ${totalCount}` : '' }} vocab items
    </div>

    <!-- Loading State -->
    <div v-if="loading && vocab.length === 0" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading vocab...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
      <button @click="$emit('refresh')" class="btn btn-sm btn-outline">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="vocab.length === 0 && !loading" class="text-center py-8">
      <p class="text-gray-500">
        {{ searchQuery ? 'No vocab found matching your search.' : 'No vocab items yet.' }}
      </p>
      <router-link to="/vocab/new" class="btn btn-primary btn-sm mt-4">
        Add Your First Vocab
      </router-link>
    </div>

    <!-- Vocab List -->
    <div v-else class="space-y-4">
      <div 
        v-for="item in vocab" 
        :key="item.uid"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <!-- Main Content -->
              <h3 class="text-lg font-semibold">
                {{ item.content || '[No content]' }}
              </h3>
              <p class="text-sm text-gray-600">
                <LanguageDisplay :language-code="item.language" />
              </p>
              
              <!-- Pronunciation removed - now handled as notes -->

              <!-- Translations Count -->
              <p class="text-sm text-gray-600 mt-2">
                {{ item.translationCount }} translation{{ item.translationCount !== 1 ? 's' : '' }}
              </p>

              <!-- Notes Preview -->
              <div v-if="item.notes && item.notes.length > 0" class="mt-2">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">Notes:</span> 
                  {{ item.notes.length }} note{{ item.notes.length === 1 ? '' : 's' }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 mt-3">
                <router-link 
                  :to="{ name: 'vocab-edit', params: { id: item.uid } }"
                  class="btn btn-sm btn-outline"
                >
                  Edit
                </router-link>
                <button 
                  @click="$emit('delete', item.uid)"
                  class="btn btn-sm btn-outline btn-error"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div v-if="item.masteryPercentage > 0" class="ml-4 w-24">
              <div class="text-xs text-gray-600 mb-1">Mastery</div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-primary h-2 rounded-full transition-all"
                  :style="{ width: `${item.masteryPercentage}%` }"
                ></div>
              </div>
              <div class="text-xs text-gray-600 mt-1">{{ item.masteryPercentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center py-4">
        <button 
          @click="$emit('loadMore')"
          :disabled="loading"
          class="btn btn-outline"
        >
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';
import type { VocabListItem } from './types';

defineProps<{
  vocab: VocabListItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  hasMore: boolean;
  totalCount: number;
}>();

defineEmits<{
  search: [query: string];
  loadMore: [];
  refresh: [];
  delete: [id: string];
}>();
</script>