<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1>{{ $t('resources.title') }}</h1>

      <router-link to="/resources/new" class="btn btn-primary">
        {{ $t('resources.addNew') }}
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="resources.length === 0" class="text-center p-12">
      <h3>{{ $t('resources.states.noItems') }}</h3>
      <p class="text-light mb-4">{{ $t('resources.suggestions.createFirst') }}</p>
      <router-link to="/resources/new" class="btn btn-primary">
        {{ $t('resources.addNew') }}
      </router-link>
    </div>

    <!-- Resources List -->
    <div v-else class="grid gap-4">
      <div v-for="resource in resources" :key="resource.uid"
        class="card shadow hover:shadow-md transition-shadow">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <LanguageDisplay v-if="languageMap.get(resource.language)"
                  :language="languageMap.get(resource.language)!" variant="short" />
                <span v-if="resource.priority" class="badge badge-secondary">{{ $t('factCards.tags.priority') }}{{ resource.priority }}</span>
              </div>

              <h3>{{ resource.title }}</h3>

              <div v-if="resource.content" class="text-light mb-3">
                {{ resource.content.substring(0, 150) }}{{ resource.content.length > 150 ? $t('resources.ellipsis') : '' }}
              </div>

              <!-- Extracted content counts -->
              <div class="flex gap-4  text-base-content/60">
                <span v-if="resource.vocab.length > 0">
                  {{ resource.vocab.length }} {{ $t('resources.vocab') }}
                </span>
                <span v-if="resource.factCards.length > 0">
                  {{ resource.factCards.length }} {{ $t('resources.facts') }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 ml-4">
              <router-link :to="`/resources/${resource.uid}/edit`" class="btn btn-sm btn-outline">
                {{ $t('common.edit') }}
              </router-link>
              <button @click="deleteResource(resource.uid)" class="btn btn-sm btn-outline btn-error"
                :disabled="deleting">
                <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
                <span v-else>{{ $t('common.delete') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import LanguageDisplay from '@/entities/languages/LanguageDisplay.vue';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const resources = ref<ResourceData[]>([]);
const languageMap = ref<Map<string, LanguageData>>(new Map());
const loading = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);

async function loadResources() {
  if (!resourceRepo) return;

  loading.value = true;
  error.value = null;

  try {
    resources.value = await resourceRepo.getAllResources();
  } catch (err) {
    console.error('Error loading resources:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load resources';
  } finally {
    loading.value = false;
  }
}

async function deleteResource(uid: string) {
  if (!confirm('Are you sure you want to delete this resource?') || !resourceRepo) {
    return;
  }

  deleting.value = true;
  try {
    await resourceRepo.deleteResource(uid);
    // Remove from local list
    resources.value = resources.value.filter(r => r.uid !== uid);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete resource';
  } finally {
    deleting.value = false;
  }
}

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;

onMounted(async () => {
  await loadResources();
  const codes = Array.from(new Set(resources.value.map(r => r.language)));
  const langs = await Promise.all(codes.map(c => languageRepo.getByCode(c)));
  const map = new Map<string, LanguageData>();
  langs.forEach(l => { if (l) map.set(l.code, l); });
  languageMap.value = map;
});
</script>