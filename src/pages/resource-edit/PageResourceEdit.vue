<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Edit Resource</h1>
    <router-link to="/resources" class="btn btn-outline">
      Back to Resources List
    </router-link>
  </div>

  <div v-if="loading" class="flex justify-center py-12">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else-if="resource" class="space-y-8">
    <!-- Basic Resource Information -->
    <section>
      <ResourceEditForm :resource="resource" @resource-updated="handleResourceUpdate" />
    </section>

    <!-- Vocabulary Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Vocabulary</h2>
      <ManageResourceVocab :resource="resource" @resource-updated="handleResourceUpdate" />
    </section>

    <!-- Fact Cards Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Fact Cards</h2>
      <ManageResourceFactCards :resource="resource" @resource-updated="handleResourceUpdate" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import ResourceEditForm from './ui/ResourceEditForm.vue';
import ManageResourceVocab from '@/widgets/manage-resource-vocab/ManageResourceVocab.vue';
import ManageResourceFactCards from '@/widgets/manage-resource-fact-cards/ManageResourceFactCards.vue';

const route = useRoute();
const router = useRouter();
const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;

const resource = ref<ResourceData | null>(null);
const loading = ref(true);

async function loadResource() {
  loading.value = true;
  
  const resourceId = route.params.uid as string;
  const loadedResource = await resourceRepo.getResourceById(resourceId);
  if (!loadedResource) {
    router.push('/resources');
    return;
  }
  resource.value = loadedResource;
  
  loading.value = false;
}

function handleResourceUpdate(updatedResource: ResourceData) {
  resource.value = updatedResource;
}

onMounted(loadResource);
</script>