<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <div v-else class="space-y-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="space-y-6">
            <!-- Title -->
            <div class="space-y-2">
              <label for="title" class="text-sm font-medium block">Title *</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                placeholder="Resource title"
                class="input input-bordered w-full block"
                :class="{ 'input-error': errors.title }"
              />
              <div v-if="errors.title" class="text-sm text-error">{{ errors.title }}</div>
            </div>

            <!-- Language -->
            <div class="space-y-2">
              <label for="language" class="text-sm font-medium block">Language *</label>
              <div class="block">
                <LanguageDropdown
                  id="language"
                  v-model="formData.language"
                  placeholder="Select target language"
                  required
                />
              </div>
              <div v-if="errors.language" class="text-sm text-error">{{ errors.language }}</div>
            </div>

            <!-- Priority -->
            <div class="space-y-2">
              <label for="priority" class="text-sm font-medium block">Priority</label>
              <input
                id="priority"
                v-model.number="formData.priority"
                type="number"
                placeholder="0"
                class="input input-bordered w-24 block"
              />
            </div>

            <!-- Prompt -->
            <div class="space-y-2">
              <label for="prompt" class="text-sm font-medium block">Prompt</label>
              <textarea
                id="prompt"
                v-model="formData.prompt"
                placeholder="Task prompt for extracting content from this resource"
                class="textarea textarea-bordered w-full block"
                rows="3"
              ></textarea>
            </div>

            <!-- Content -->
            <div class="space-y-2">
              <label for="content" class="text-sm font-medium block">Content</label>
              <textarea
                id="content"
                v-model="formData.content"
                placeholder="Main content of the resource (text, article, etc.)"
                class="textarea textarea-bordered w-full block"
                rows="6"
              ></textarea>
            </div>

            <!-- Link URL -->
            <div class="space-y-2">
              <label for="linkUrl" class="text-sm font-medium block">Link URL</label>
              <input
                id="linkUrl"
                v-model="formData.linkUrl"
                type="url"
                placeholder="https://example.com"
                class="input input-bordered w-full block"
              />
            </div>

            <!-- Link Label -->
            <div class="space-y-2">
              <label for="linkLabel" class="text-sm font-medium block">Link Label</label>
              <input
                id="linkLabel"
                v-model="formData.linkLabel"
                type="text"
                placeholder="Link label (optional)"
                class="input input-bordered w-64 block"
              />
            </div>

            <!-- Extra Info -->
            <div class="space-y-2">
              <label for="extraInfo" class="text-sm font-medium block">Extra Information</label>
              <textarea
                id="extraInfo"
                v-model="formData.extraInfo"
                placeholder="Additional context or information about this resource"
                class="textarea textarea-bordered w-full block"
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-actions justify-end mt-6">
            <router-link to="/resources" class="btn btn-ghost">
              Cancel
            </router-link>
            <button
              class="btn btn-primary"
              :disabled="!isFormValid || saving"
              @click="handleSave"
            >
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              <span v-else>{{ isNew ? 'Create Resource' : 'Save Changes' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import LanguageDropdown from '@/shared/LanguageDropdown.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';

const props = defineProps<{
  resourceUid?: string;
}>();

const router = useRouter();
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}
// Make resourceRepo definitely assigned for TypeScript
const repo = resourceRepo;

const isNew = computed(() => !props.resourceUid);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  title: '',
  language: '',
  priority: 0,
  prompt: '',
  content: '',
  linkUrl: '',
  linkLabel: '',
  extraInfo: ''
});

const errors = ref<Record<string, string>>({});

const isFormValid = computed(() => {
  return formData.value.title.trim() && 
         formData.value.language.trim() &&
         Object.keys(errors.value).length === 0;
});

function validateForm() {
  errors.value = {};
  
  if (!formData.value.title.trim()) {
    errors.value.title = 'Title is required';
  }
  
  if (!formData.value.language.trim()) {
    errors.value.language = 'Language is required';
  }
}

async function loadResource() {
  if (!props.resourceUid) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const resource = await repo.getResourceById(props.resourceUid);
    if (!resource) {
      error.value = 'Resource not found';
      return;
    }
    
    formData.value = {
      title: resource.title,
      language: resource.language,
      priority: resource.priority,
      prompt: resource.prompt || '',
      content: resource.content || '',
      linkUrl: resource.link?.url || '',
      linkLabel: resource.link?.label || '',
      extraInfo: resource.extraInfo || ''
    };
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load resource';
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  validateForm();
  if (!isFormValid.value) return;
  
  saving.value = true;
  error.value = null;
  
  try {
    if (isNew.value) {
      // Create new resource
      const resourceData: Partial<ResourceData> = {
        title: formData.value.title.trim(),
        language: formData.value.language.trim(),
        priority: formData.value.priority,
        prompt: formData.value.prompt.trim() || 'Extract important words, examples and facts from the resource',
        content: formData.value.content.trim() || undefined,
        extraInfo: formData.value.extraInfo.trim() || undefined
      };

      // Add link if URL is provided
      if (formData.value.linkUrl.trim()) {
        resourceData.link = {
          url: formData.value.linkUrl.trim(),
          label: formData.value.linkLabel.trim() || 'Link'
        };
      }

      await repo.saveResource(resourceData);
    } else {
      // Update existing resource
      const existing = await repo.getResourceById(props.resourceUid!);
      if (!existing) {
        error.value = 'Resource not found';
        return;
      }
      
      const updatedResource: ResourceData = {
        ...existing,
        title: formData.value.title.trim(),
        language: formData.value.language.trim(),
        priority: formData.value.priority,
        prompt: formData.value.prompt.trim() || 'Extract important words, examples and facts from the resource',
        content: formData.value.content.trim() || undefined,
        extraInfo: formData.value.extraInfo.trim() || undefined,
        link: formData.value.linkUrl.trim() ? {
          url: formData.value.linkUrl.trim(),
          label: formData.value.linkLabel.trim() || 'Link'
        } : undefined
      };
      
      await repo.updateResource(updatedResource);
    }
    
    // Navigate back to resources list
    router.push('/resources');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save resource';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!isNew.value) {
    loadResource();
  }
});
</script>