<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">
        {{ isNew ? 'Add New Resource' : 'Edit Resource' }}
      </h1>
      <div class="text-sm breadcrumbs">
        <ul>
          <li><router-link to="/resources">Resources</router-link></li>
          <li>{{ isNew ? 'New' : 'Edit' }}</li>
        </ul>
      </div>
    </div>

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
          <h2 class="card-title">Basic Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Title -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text">Title *</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                placeholder="Resource title"
                class="input input-bordered"
                :class="{ 'input-error': errors.title }"
              />
              <div v-if="errors.title" class="label">
                <span class="label-text-alt text-error">{{ errors.title }}</span>
              </div>
            </div>

            <!-- Language -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Language *</span>
              </label>
              <input
                v-model="formData.language"
                type="text"
                placeholder="e.g., Italian"
                class="input input-bordered"
                :class="{ 'input-error': errors.language }"
              />
              <div v-if="errors.language" class="label">
                <span class="label-text-alt text-error">{{ errors.language }}</span>
              </div>
            </div>

            <!-- Priority -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Priority</span>
              </label>
              <input
                v-model.number="formData.priority"
                type="number"
                placeholder="0"
                class="input input-bordered"
              />
            </div>

            <!-- Prompt -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text">Prompt</span>
              </label>
              <textarea
                v-model="formData.prompt"
                placeholder="Task prompt for extracting content from this resource"
                class="textarea textarea-bordered"
                rows="3"
              ></textarea>
            </div>

            <!-- Extra Info -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text">Extra Information</span>
              </label>
              <textarea
                v-model="formData.extraInfo"
                placeholder="Additional context or information about this resource"
                class="textarea textarea-bordered"
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
      await repo.saveResource({
        title: formData.value.title.trim(),
        language: formData.value.language.trim(),
        priority: formData.value.priority,
        prompt: formData.value.prompt.trim() || 'Extract important words, examples and facts from the resource',
        extraInfo: formData.value.extraInfo.trim() || undefined
      });
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
        extraInfo: formData.value.extraInfo.trim() || undefined
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