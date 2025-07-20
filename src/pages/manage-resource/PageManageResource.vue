<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Save, ArrowLeft, ExternalLink } from 'lucide-vue-next';
import type { ResourceData } from '@/entities/resources';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';
import { resourceService } from '@/entities/resources';
import { languageService } from '@/entities/languages';
import { WordDexieRepository } from '@/entities/linguisticUnits/words/WordDexieRepository';
import { SentenceDexieRepository } from '@/entities/linguisticUnits/sentences/SentenceDexieRepository';
import ResourceExtractionFormControl from '@/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormControl.vue';
import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';

// Route and router
const route = useRoute();
const router = useRouter();

// Repository instances
const wordRepository = new WordDexieRepository();
const sentenceRepository = new SentenceDexieRepository();

// State
const resource = ref<ResourceData | null>(null);
const languages = ref<LanguageIdentifier[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);

// Form data
const formData = ref({
  title: '',
  link: '',
  prompt: '',
  extraInfo: '',
  language: '',
  priority: 1,
  isUserCreated: false
});

// Check if this is a new resource or editing existing
const isNewResource = computed(() => !route.params.uid || route.params.uid === 'new');

/**
 * Load languages and resource data.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Load languages
    languages.value = await languageService.getAll();
    
    if (!isNewResource.value) {
      // Load existing resource
      const uid = route.params.uid as string;
      const resourceData = await resourceService.getById(uid);
      
      if (!resourceData) {
        error.value = 'Resource not found';
        return;
      }
      
      resource.value = resourceData;
      
      // Populate form
      formData.value = {
        title: resourceData.title,
        link: resourceData.link,
        prompt: resourceData.prompt,
        extraInfo: resourceData.extraInfo,
        language: resourceData.language,
        priority: resourceData.priority,
        isUserCreated: resourceData.isUserCreated
      };
    } else {
      // Initialize form for new resource
      formData.value = {
        title: '',
        link: '',
        prompt: '',
        extraInfo: '',
        language: languages.value[0]?.code || '',
        priority: 1,
        isUserCreated: true
      };
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data';
  } finally {
    loading.value = false;
  }
}

/**
 * Save the resource.
 */
async function saveResource() {
  if (!formData.value.title.trim() || !formData.value.language) {
    error.value = 'Title and language are required';
    return;
  }

  saving.value = true;
  error.value = null;

  try {
    const resourceData: ResourceData = {
      uid: resource.value?.uid || `resource-${Date.now()}`,
      title: formData.value.title.trim(),
      link: formData.value.link.trim(),
      prompt: formData.value.prompt.trim(),
      extraInfo: formData.value.extraInfo.trim(),
      language: formData.value.language,
      priority: formData.value.priority,
      isUserCreated: formData.value.isUserCreated,
      isExploited: resource.value?.isExploited || false,
      lastDownloadedAt: resource.value?.lastDownloadedAt || new Date(),
      lastIteratedAt: resource.value?.lastIteratedAt || null,
      nextShownEarliestAt: resource.value?.nextShownEarliestAt || new Date(),
      extractedUnits: resource.value?.extractedUnits || []
    };

    if (isNewResource.value) {
      await resourceService.add(resourceData);
    } else {
      await resourceService.update(resourceData);
    }

    // Navigate back to resource list
    router.push({ name: 'resources' });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save resource';
  } finally {
    saving.value = false;
  }
}

/**
 * Go back to resource list.
 */
function goBack() {
  router.push({ name: 'resources' });
}

/**
 * Convert a reactive resource object to a plain object for IndexedDB storage.
 */
function convertResourceToPlainObject(resource: ResourceData): ResourceData {
  return {
    uid: resource.uid,
    title: resource.title,
    link: resource.link,
    prompt: resource.prompt,
    extraInfo: resource.extraInfo,
    language: resource.language,
    priority: resource.priority,
    isUserCreated: resource.isUserCreated,
    isExploited: resource.isExploited,
    lastDownloadedAt: resource.lastDownloadedAt,
    lastIteratedAt: resource.lastIteratedAt,
    nextShownEarliestAt: resource.nextShownEarliestAt,
    extractedUnits: resource.extractedUnits.map(unit => ({
      type: unit.type,
      language: unit.language,
      content: unit.content
    }))
  };
}

/**
 * Handle when a linguistic unit is saved.
 */
async function handleUnitSaved(unit: LinguisticUnitIdentification) {
  if (!resource.value) return;
  
  try {
    // Add the unit to the resource's extractedUnits if it's not already there
    const existingUnit = resource.value.extractedUnits.find(
      u => u.type === unit.type && u.language === unit.language && u.content === unit.content
    );
    
    if (!existingUnit) {
      resource.value.extractedUnits.push(unit);
      
      // Convert reactive object to plain object before saving
      const resourceToSave = convertResourceToPlainObject(resource.value);
      
      // Save the updated resource
      await resourceService.update(resourceToSave);
    }
  } catch (error) {
    console.error('Failed to update resource with new unit:', error);
  }
}

// Load data on mount
onMounted(loadData);
</script>

<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <button @click="goBack" class="btn btn-ghost btn-sm">
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <h1 class="text-3xl font-bold">
        {{ isNewResource ? 'Add New Resource' : 'Edit Resource' }}
      </h1>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <div v-else class="space-y-6">
      <!-- Basic Resource Information -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">Resource Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Title -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Title *</span>
              </label>
              <input 
                v-model="formData.title"
                type="text"
                placeholder="Enter resource title..."
                class="input input-bordered"
                required
              />
            </div>

            <!-- Language -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Language *</span>
              </label>
              <select 
                v-model="formData.language"
                class="select select-bordered"
                required
              >
                <option value="">Select language</option>
                <option 
                  v-for="lang in languages" 
                  :key="lang.code"
                  :value="lang.code"
                >
                  {{ lang.name }}
                </option>
              </select>
            </div>

            <!-- Priority -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Priority</span>
              </label>
              <input 
                v-model.number="formData.priority"
                type="number"
                min="1"
                max="10"
                class="input input-bordered"
              />
            </div>

            <!-- Link -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Link</span>
              </label>
              <div class="input-group">
                <input 
                  v-model="formData.link"
                  type="url"
                  placeholder="https://..."
                  class="input input-bordered flex-1"
                />
                <a 
                  v-if="formData.link"
                  :href="formData.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-square btn-outline"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>
              </div>
            </div>

            <!-- Prompt -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Prompt</span>
              </label>
              <textarea 
                v-model="formData.prompt"
                placeholder="Enter prompt for this resource..."
                class="textarea textarea-bordered h-20"
              ></textarea>
            </div>

            <!-- Extra Info -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Extra Information</span>
              </label>
              <textarea 
                v-model="formData.extraInfo"
                placeholder="Additional notes or context..."
                class="textarea textarea-bordered h-24"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Associated Linguistic Units -->
      <div v-if="!isNewResource && resource" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">Associated Words & Sentences</h2>
          <p class="text-sm text-gray-600 mb-4">
            Manage the words and sentences extracted from this resource.
          </p>
          
          <ResourceExtractionFormControl
            :extracted-units="resource.extractedUnits"
            :word-repository="wordRepository"
            :sentence-repository="sentenceRepository"
            :languages="languages"
            :on-unit-saved="handleUnitSaved"
          />
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end gap-4">
        <button @click="goBack" class="btn btn-outline">
          Cancel
        </button>
        <button 
          @click="saveResource"
          :disabled="saving || !formData.title.trim() || !formData.language"
          class="btn btn-primary"
        >
          <Save v-if="!saving" class="w-4 h-4" />
          <span v-if="saving" class="loading loading-spinner loading-xs"></span>
          {{ saving ? 'Saving...' : (isNewResource ? 'Create Resource' : 'Save Changes') }}
        </button>
      </div>
    </div>
  </div>
</template>
