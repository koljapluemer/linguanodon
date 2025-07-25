<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Save, ArrowLeft } from 'lucide-vue-next';
import type { ImmersionContentData } from '@/entities/immersion-content';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';
import { immersionContentService } from '@/entities/immersion-content';
import { languageService } from '@/entities/languages';
import { WordDexieRepository } from '@/entities/linguisticUnits/words/WordDexieRepository';
import { SentenceDexieRepository } from '@/entities/linguisticUnits/sentences/SentenceDexieRepository';
import ResourceExtractionFormControl from '@/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormControl.vue';
import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';

const route = useRoute();
const router = useRouter();

const wordRepository = new WordDexieRepository();
const sentenceRepository = new SentenceDexieRepository();

const content = ref<ImmersionContentData | null>(null);
const languages = ref<LanguageIdentifier[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  title: '',
  link: '',
  prompt: '',
  extraInfo: '',
  language: '',
  priority: 1,
  isUserCreated: false
});

const isNewContent = computed(() => !route.params.uid || route.params.uid === 'new');

/**
 * Load languages and immersion content data.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    languages.value = await languageService.getAll();
    if (!isNewContent.value) {
      const uid = route.params.uid as string;
      const contentData = await immersionContentService.getById(uid);
      if (!contentData) {
        error.value = 'Immersion content not found';
        return;
      }
      content.value = contentData;
      formData.value = {
        title: contentData.title,
        link: contentData.link,
        prompt: contentData.prompt,
        extraInfo: contentData.extraInfo,
        language: contentData.language,
        priority: contentData.priority,
        isUserCreated: contentData.isUserCreated
      };
    } else {
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
 * Save the immersion content.
 */
async function saveContent() {
  if (!formData.value.title.trim() || !formData.value.language) {
    error.value = 'Title and language are required';
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    const contentData: ImmersionContentData = {
      uid: content.value?.uid || `immersion-content-${Date.now()}`,
      title: formData.value.title.trim(),
      link: formData.value.link.trim(),
      prompt: formData.value.prompt.trim(),
      extraInfo: formData.value.extraInfo.trim(),
      language: formData.value.language,
      priority: formData.value.priority,
      isUserCreated: formData.value.isUserCreated,
      isExploited: content.value?.isExploited || false,
      lastDownloadedAt: content.value?.lastDownloadedAt || new Date(),
      lastIteratedAt: content.value?.lastIteratedAt || null,
      nextShownEarliestAt: content.value?.nextShownEarliestAt || new Date(),
      associatedUnits: content.value?.associatedUnits || [],
      extractedUnits: content.value?.extractedUnits || []
    };
    if (isNewContent.value) {
      await immersionContentService.add(contentData);
    } else {
      await immersionContentService.update(contentData);
    }
    router.push({ name: 'immersion-content' });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save immersion content';
  } finally {
    saving.value = false;
  }
}

/**
 * Navigate back to the immersion content list.
 */
function goBack() {
  router.push({ name: 'immersion-content' });
}

/**
 * Convert a reactive immersion content object to a plain object for IndexedDB storage.
 */
function convertContentToPlainObject(content: ImmersionContentData): ImmersionContentData {
  return {
    uid: content.uid,
    title: content.title,
    link: content.link,
    prompt: content.prompt,
    extraInfo: content.extraInfo,
    language: content.language,
    priority: content.priority,
    isUserCreated: content.isUserCreated,
    isExploited: content.isExploited,
    lastDownloadedAt: content.lastDownloadedAt,
    lastIteratedAt: content.lastIteratedAt,
    nextShownEarliestAt: content.nextShownEarliestAt,
    associatedUnits: content.associatedUnits.map(unit => ({
      type: unit.type,
      language: unit.language,
      content: unit.content
    })),
    extractedUnits: content.extractedUnits.map(unit => ({
      type: unit.type,
      language: unit.language,
      content: unit.content
    }))
  };
}

/**
 * Handle when a linguistic unit is saved to extractedUnits.
 */
async function handleUnitSaved(unit: LinguisticUnitIdentification) {
  if (!content.value) return;
  try {
    const existingUnit = content.value.extractedUnits.find(
      u => u.type === unit.type && u.language === unit.language && u.content === unit.content
    );
    if (!existingUnit) {
      content.value.extractedUnits.push(unit);
      const contentToSave = convertContentToPlainObject(content.value);
      await immersionContentService.update(contentToSave);
    }
  } catch (error) {
    console.error('Failed to update immersion content with new unit:', error);
  }
}

onMounted(loadData);
</script>

<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex items-center gap-4 mb-6">
      <button @click="goBack" class="btn btn-ghost btn-sm">
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <h1 class="text-3xl font-bold">
        {{ isNewContent ? 'Add New Immersion Content' : 'Edit Immersion Content' }}
      </h1>
    </div>
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading...</p>
    </div>
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>
    <div v-else class="space-y-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">Immersion Content Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Title *</span>
              </label>
              <input 
                v-model="formData.title"
                type="text"
                placeholder="Enter immersion content title..."
                class="input input-bordered"
                required
              />
            </div>
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
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Link</span>
              </label>
              <input 
                v-model="formData.link"
                type="url"
                placeholder="https://..."
                class="input input-bordered"
              />
            </div>
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Prompt</span>
              </label>
              <textarea 
                v-model="formData.prompt"
                placeholder="Enter prompt for this content..."
                class="textarea textarea-bordered h-20"
              ></textarea>
            </div>
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
      <div v-if="!isNewContent && content" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">Associated Units (Read-Only)</h2>
          <p class="text-sm text-gray-600 mb-4">
            These units help you understand the immersion content.
          </p>
          <ul class="list-disc ml-6">
            <li v-for="unit in content.associatedUnits" :key="unit.type + unit.language + unit.content">
              <span class="font-mono">[{{ unit.type }}]</span> {{ unit.content }} <span class="text-xs text-gray-400">({{ unit.language }})</span>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="!isNewContent && content" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">Extracted Units</h2>
          <p class="text-sm text-gray-600 mb-4">
            Extract words and sentences you find useful from this immersion content.
          </p>
          <ResourceExtractionFormControl
            :extracted-units="content.extractedUnits"
            :word-repository="wordRepository"
            :sentence-repository="sentenceRepository"
            :languages="languages"
            :on-unit-saved="handleUnitSaved"
          />
        </div>
      </div>
      <div class="flex justify-end gap-4">
        <button @click="goBack" class="btn btn-outline">
          Cancel
        </button>
        <button 
          @click="saveContent"
          :disabled="saving || !formData.title.trim() || !formData.language"
          class="btn btn-primary"
        >
          <Save v-if="!saving" class="w-4 h-4" />
          <span v-if="saving" class="loading loading-spinner loading-xs"></span>
          {{ saving ? 'Saving...' : (isNewContent ? 'Create Immersion Content' : 'Save Changes') }}
        </button>
      </div>
    </div>
  </div>
</template> 