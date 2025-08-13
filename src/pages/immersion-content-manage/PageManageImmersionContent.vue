<template>
  <div class="min-h-screen bg-base-200">
    <div class="max-w-4xl mx-auto p-4">
      <div class="mb-4">
        <h1 class="text-2xl font-bold">Manage Immersion Content</h1>
      </div>
      <ImmersionContentFormRenderer :immersion-content-uid="route.params.uid as string" />

      <!-- Needed Vocabulary Section -->
      <div v-if="route.params.uid" class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
          <VocabProgressWidget 
            :vocab-ids="neededVocabIds"
          />
          <ManageNeededVocabWidget 
            :immersion-content-uid="route.params.uid as string"
            :show-delete-button="false"
            :show-disconnect-button="true"
            :allow-jumping-to-vocab-page="true"
            :allow-connecting-existing="true"
            @update:needed-vocab-ids="handleNeededVocabUpdate"
          />
        </div>
      </div>

      <!-- Extracted Vocabulary Section -->
      <div v-if="route.params.uid" class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
          <ManageExtractedVocabWidget 
            :immersion-content-uid="route.params.uid as string"
            :show-delete-button="false"
            :show-disconnect-button="true"
            :allow-jumping-to-vocab-page="true"
            :allow-connecting-existing="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, inject, onMounted } from 'vue';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import ImmersionContentFormRenderer from '@/features/immersion-content-manage/ImmersionContentFormRenderer.vue';
import ManageNeededVocabWidget from '@/features/immersion-content-manage-needed-vocab/ManageNeededVocabWidget.vue';
import ManageExtractedVocabWidget from '@/features/immersion-content-manage-extracted-vocab/ManageExtractedVocabWidget.vue';
import VocabProgressWidget from '@/features/immersion-content-manage-needed-vocab/VocabProgressWidget.vue';

const route = useRoute();
const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo');
const neededVocabIds = ref<string[]>([]);

async function loadNeededVocabIds() {
  if (!immersionContentRepo || !route.params.uid) return;
  
  try {
    const content = await immersionContentRepo.getImmersionContentById(route.params.uid as string);
    if (content) {
      neededVocabIds.value = [...content.neededVocab];
    }
  } catch (error) {
    console.error('Failed to load needed vocab IDs:', error);
  }
}

function handleNeededVocabUpdate(newVocabIds: string[]) {
  neededVocabIds.value = newVocabIds;
}

onMounted(() => {
  loadNeededVocabIds();
});
</script>