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
      <FormFieldset legend="Immersion Content Details">
        <FormField label="Title" required>
          <template #default="{ inputId, inputClasses }">
            <input
              :id="inputId"
              v-model="formData.title"
              type="text"
              placeholder="Content title"
              :class="[inputClasses, { 'input-error': errors.title }]"
            />
            <div v-if="errors.title" class="text-sm text-error mt-1">{{ errors.title }}</div>
          </template>
        </FormField>

        <FormField label="Language" required>
          <template #default="{ inputId }">
            <LanguageDropdown
              :id="inputId"
              v-model="formData.language"
              placeholder="Select target language"
              required
            />
            <div v-if="errors.language" class="text-sm text-error mt-1">{{ errors.language }}</div>
          </template>
        </FormField>

        <FormField label="Priority">
          <template #default="{ inputId, inputClasses }">
            <input
              :id="inputId"
              v-model.number="formData.priority"
              type="number"
              placeholder="0"
              :class="inputClasses"
              style="width: 6rem"
            />
          </template>
        </FormField>

        <FormField label="Content">
          <template #default="{ inputId }">
            <textarea
              :id="inputId"
              v-model="formData.content"
              placeholder="Main content for immersion (text, article, story, etc.)"
              class="textarea textarea-bordered w-full"
              rows="6"
            ></textarea>
          </template>
        </FormField>

        <LinkEdit
          :link="formData.link"
          @update:link="formData.link = $event"
        />

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-6">
          <router-link to="/immersion-content" class="btn btn-ghost">
            Cancel
          </router-link>
          <button
            class="btn btn-primary"
            :disabled="!isFormValid || saving"
            @click="handleSave"
          >
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            <span v-else>{{ isNew ? 'Create Content' : 'Save Changes' }}</span>
          </button>
        </div>
      </FormFieldset>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import LinkEdit from '@/shared/ui/LinkEdit.vue';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { Link } from '@/shared/Link';

const props = defineProps<{
  immersionContentUid?: string;
}>();

const router = useRouter();
const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo');
if (!immersionContentRepo) {
  throw new Error('ImmersionContentRepo not provided');
}
// Make immersionContentRepo definitely assigned for TypeScript
const repo = immersionContentRepo;

const isNew = computed(() => !props.immersionContentUid);
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

async function loadImmersionContent() {
  if (!props.immersionContentUid) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const content = await repo.getImmersionContentById(props.immersionContentUid);
    if (!content) {
      error.value = 'Immersion content not found';
      return;
    }
    
    formData.value = {
      title: content.title,
      language: content.language,
      priority: content.priority,
      content: content.content || '',
      link: content.link || { label: '', url: '' }
    };
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load immersion content';
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
      // Create new immersion content
      const contentData: Omit<ImmersionContentData, 'uid' | 'tasks' | 'lastShownAt'> = {
        title: formData.value.title.trim(),
        language: formData.value.language.trim(),
        priority: formData.value.priority,
        content: formData.value.content.trim() || undefined,
        neededVocab: [],
        notes: [],
        extractedVocab: [],
        extractedFactCards: []
      };

      // Add link if URL is provided
      if (formData.value.link.url.trim()) {
        contentData.link = {
          url: formData.value.link.url.trim(),
          label: formData.value.link.label.trim() || 'Link',
          owner: formData.value.link.owner?.trim() || undefined,
          ownerLink: formData.value.link.ownerLink?.trim() || undefined,
          license: formData.value.link.license?.trim() || undefined
        };
      }

      await repo.saveImmersionContent(contentData);
    } else {
      // Update existing immersion content
      const existing = await repo.getImmersionContentById(props.immersionContentUid!);
      if (!existing) {
        error.value = 'Immersion content not found';
        return;
      }
      
      const updatedContent: ImmersionContentData = {
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
      
      await repo.updateImmersionContent(updatedContent);
    }
    
    // Navigate back to immersion content list
    router.push('/immersion-content');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save immersion content';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!isNew.value) {
    loadImmersionContent();
  }
});
</script>