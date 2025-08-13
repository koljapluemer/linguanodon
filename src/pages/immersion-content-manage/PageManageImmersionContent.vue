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
          <ManageNeededVocabWidget 
            :immersion-content-uid="route.params.uid as string"
            :show-delete-button="false"
            :show-disconnect-button="true"
            :allow-jumping-to-vocab-page="true"
            :allow-connecting-existing="true"
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
import ImmersionContentFormRenderer from '@/features/immersion-content-manage/ImmersionContentFormRenderer.vue';
import ManageNeededVocabWidget from '@/features/immersion-content-manage-needed-vocab/ManageNeededVocabWidget.vue';
import ManageExtractedVocabWidget from '@/features/immersion-content-manage-extracted-vocab/ManageExtractedVocabWidget.vue';

const route = useRoute();
</script>