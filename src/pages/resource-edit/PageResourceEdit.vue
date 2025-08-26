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

      <!-- Vocab Mastery Progress -->
      <div v-if="resource.vocab.length > 0" class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">Average Vocab Mastery</span>
          <span class="text-sm font-bold">{{ avgVocabMastery }}%</span>
        </div>
        <progress class="progress progress-primary w-full" :value="avgVocabMastery" max="100"></progress>
      </div>

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
import { ref, onMounted, inject, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import { calculateVocabMastery } from '@/entities/vocab/vocabMastery';
import ResourceEditForm from './ui/ResourceEditForm.vue';
import ManageResourceVocab from '@/widgets/manage-resource-vocab/ManageResourceVocab.vue';
import ManageResourceFactCards from '@/widgets/manage-resource-fact-cards/ManageResourceFactCards.vue';

const route = useRoute();
const router = useRouter();
const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;

const resource = ref<ResourceData | null>(null);
const loading = ref(true);
const vocabItems = ref<VocabData[]>([]);

const avgVocabMastery = computed(() => {
  if (vocabItems.value.length === 0) return 0;

  const masteries = vocabItems.value.map(vocab => calculateVocabMastery(vocab));
  const sum = masteries.reduce((acc, mastery) => acc + mastery, 0);
  return Math.round(sum / masteries.length);
});

async function loadVocabItems() {
  if (!resource.value || resource.value.vocab.length === 0) {
    vocabItems.value = [];
    return;
  }

  try {
    vocabItems.value = await vocabRepo.getVocabByIds(resource.value.vocab);
  } catch (error) {
    console.error('Error loading vocab items:', error);
    vocabItems.value = [];
  }
}

async function loadResource() {
  loading.value = true;

  const resourceId = route.params.uid as string;
  const loadedResource = await resourceRepo.getResourceById(resourceId);
  if (!loadedResource) {
    router.push('/resources');
    return;
  }
  resource.value = loadedResource;
  await loadVocabItems();

  loading.value = false;
}

function handleResourceUpdate(updatedResource: ResourceData) {
  resource.value = updatedResource;
}

// Watch for changes in vocab list and reload vocab items
watch(() => resource.value?.vocab, async () => {
  await loadVocabItems();
}, { deep: true });

onMounted(loadResource);
</script>