<template>
  <div class="mb-4">
    <h1 class="text-2xl font-bold">Manage Resource</h1>
  </div>
  <ResourceFormRenderer :resource-uid="route.params.uid as string" />

  <!-- Associated Vocabulary Section -->
  <div v-if="route.params.uid" class="card bg-base-100 shadow-xl mt-6">
    <div class="card-body">
      <ManageVocabOfResourceWidget :resource-uid="route.params.uid as string" :show-delete-button="false"
        :show-disconnect-button="true" :allow-jumping-to-vocab-page="true" :allow-connecting-existing="true" />
    </div>
  </div>

</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import ResourceFormRenderer from '@/features/resource-manage/ResourceFormRenderer.vue';
import ManageVocabOfResourceWidget from '@/features/resource-manage-its-vocab/ManageVocabOfResourceWidget.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';

const route = useRoute();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');

if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

</script>