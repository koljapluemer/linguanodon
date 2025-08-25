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
      <div class="space-y-6">
        <h2 class="text-lg font-semibold">Resource Details</h2>
        <div class="flex flex-col space-y-1">
          <label class="text-sm font-medium">Title *</label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="Resource title"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.title }"
          />
          <div v-if="errors.title" class="text-sm text-error mt-1">{{ errors.title }}</div>
        </div>

        <div class="flex flex-col space-y-1">
          <label class="text-sm font-medium">Language *</label>
          <LanguageDropdown
            v-model="formData.language"
            placeholder="Select target language"
            required
          />
          <div v-if="errors.language" class="text-sm text-error mt-1">{{ errors.language }}</div>
        </div>

        <div class="flex flex-col space-y-1">
          <label class="text-sm font-medium">Priority</label>
          <input
            v-model.number="formData.priority"
            type="number"
            placeholder="0"
            class="input input-bordered w-full"
            style="width: 6rem"
          />
        </div>

        <div class="flex flex-col space-y-1">
          <label class="text-sm font-medium">Content</label>
          <textarea
            v-model="formData.content"
            placeholder="Main content of the resource (text, article, etc.)"
            class="textarea textarea-bordered w-full"
            rows="6"
          ></textarea>
        </div>

        <LinkEdit
          :link="formData.link"
          @update:link="formData.link = $event"
        />

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-6">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import LinkEdit from '@/shared/links/LinkEdit.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { Link } from '@/shared/links/Link';

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
  content: '',
  link: { label: '', url: '' } as Link
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
      content: resource.content || '',
      link: resource.link || { label: '', url: '' }
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
      const resourceData: Omit<ResourceData, 'uid' | 'tasks' | 'lastShownAt'> = {
        title: formData.value.title.trim(),
        language: formData.value.language.trim(),
        priority: formData.value.priority,
        content: formData.value.content.trim() || undefined,
        vocab: [],
        factCards: [],
        notes: [],
        origins: ['user-added']
      };

      // Add link if URL is provided
      if (formData.value.link.url.trim()) {
        resourceData.link = {
          url: formData.value.link.url.trim(),
          label: formData.value.link.label.trim() || 'Link',
          owner: formData.value.link.owner?.trim() || undefined,
          ownerLink: formData.value.link.ownerLink?.trim() || undefined,
          license: formData.value.link.license?.trim() || undefined
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
        content: formData.value.content.trim() || undefined,
        link: formData.value.link.url.trim() ? {
          url: formData.value.link.url.trim(),
          label: formData.value.link.label.trim() || 'Link',
          owner: formData.value.link.owner?.trim() || undefined,
          ownerLink: formData.value.link.ownerLink?.trim() || undefined,
          license: formData.value.link.license?.trim() || undefined
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