<template>
  <div class="max-w-2xl">
    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Title -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Title *</span>
        </label>
        <input
          v-model="formData.title"
          type="text"
          placeholder="Resource title"
          class="input input-bordered w-full"
          :class="{ 'input-error': errors.title }"
          required
        />
        <div v-if="errors.title" class="label">
          <span class="label-text-alt text-error">{{ errors.title }}</span>
        </div>
      </div>

      <!-- Language -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Language *</span>
        </label>
        <LanguageDropdown
          v-model="formData.language"
          placeholder="Select target language"
          required
        />
        <div v-if="errors.language" class="label">
          <span class="label-text-alt text-error">{{ errors.language }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Content</span>
        </label>
        <textarea
          v-model="formData.content"
          placeholder="Main content of the resource (text, article, etc.)"
          class="textarea textarea-bordered w-full"
          rows="6"
        ></textarea>
      </div>

      <!-- Link -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Link</span>
        </label>
        <LinksForm
          :links="formData.links"
          :single-link-mode="true"
          @add-link="handleAddLink"
          @update-link="handleUpdateLink"
          @remove-link="handleRemoveLink"
          @field-change="() => {}"
        />
      </div>

      <!-- Buttons -->
      <div class="flex justify-end gap-2">
        <router-link to="/resources" class="btn btn-ghost">
          Cancel
        </router-link>
        <button
          type="button"
          class="btn btn-outline"
          :disabled="!isFormValid || saving"
          @click="handleSaveAndAddAnother"
        >
          <span v-if="saving" class="loading loading-spinner loading-sm mr-1"></span>
          Save and Add Another
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!isFormValid || saving"
        >
          <span v-if="saving" class="loading loading-spinner loading-sm mr-1"></span>
          Save
        </button>
      </div>
    </form>

    <!-- Error Display -->
    <div v-if="error" class="alert alert-error mt-4">
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import LinksForm from '@/shared/links/LinksForm.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { Link } from '@/shared/links/Link';

const emit = defineEmits<{
  'resource-saved': [resource: ResourceData];
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;

const saving = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  title: '',
  language: '',
  content: '',
  links: [] as Link[]
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

function handleAddLink(link: Link) {
  formData.value.links = [link];
}

function handleUpdateLink(index: number, link: Link) {
  if (index === 0 && formData.value.links.length > 0) {
    formData.value.links[0] = link;
  }
}

function handleRemoveLink(index: number) {
  if (index === 0) {
    formData.value.links = [];
  }
}

async function saveResource(): Promise<ResourceData | null> {
  validateForm();
  if (!isFormValid.value) return null;
  
  saving.value = true;
  error.value = null;
  
  try {
    const resourceData: Omit<ResourceData, 'uid' | 'lastShownAt'> = {
      title: formData.value.title.trim(),
      language: formData.value.language.trim(),
      priority: 1,
      content: formData.value.content.trim() || undefined,
      vocab: [],
      factCards: [],
      notes: [],
      origins: ['user-added'],
      finishedExtracting: false
    };

    // Add link if provided
    if (formData.value.links.length > 0 && formData.value.links[0].url.trim()) {
      const link = formData.value.links[0];
      resourceData.link = {
        url: link.url.trim(),
        label: link.label.trim() || 'Link',
        owner: link.owner?.trim() || undefined,
        ownerLink: link.ownerLink?.trim() || undefined,
        license: link.license?.trim() || undefined
      };
    }

    const savedResource = await resourceRepo.saveResource(resourceData);
    return savedResource;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save resource';
    return null;
  } finally {
    saving.value = false;
  }
}

async function handleSave() {
  const resource = await saveResource();
  if (resource) {
    emit('resource-saved', resource);
  }
}

async function handleSaveAndAddAnother() {
  const resource = await saveResource();
  if (resource) {
    // Reset form for next entry
    formData.value = {
      title: '',
      language: formData.value.language, // Keep language selected
      content: '',
      links: []
    };
    errors.value = {};
    
    // Show success message or toast here if desired
  }
}
</script>