<template>
  <div class="divide-y divide-gray-200 ">
    <LanguageDropdown
      v-model="formData.language"
      label="Language"
      placeholder="Select target language"
      required
      inline
      @update:model-value="$emit('field-change')"
    />

    <InlineInput
      v-model="formData.content"
      label="Content"
      placeholder="..."
      required
      size="large"
      @update:modelValue="$emit('field-change')"
    />

    <div class="py-4">
      <div class="flex justify-between items-center mb-3">
        <div class=" font-medium  ">
          Translations
        </div>
        <button
          type="button"
          @click="addNewTranslation"
          class="btn btn-sm btn-outline"
        >
          <Plus class="w-4 h-4 mr-1" />
          Add Translation
        </button>
      </div>
      
      <div v-if="formData.translations.length === 0" class=" text-center py-4">
        No translations attached.
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="(translation, index) in formData.translations"
          :key="translation.uid"
        >
          <!-- Edit mode -->
          <div v-if="editingIndex === index" class="space-y-4">
            <div class="flex flex-col space-y-1">
              <label class=" font-medium">Translation Content</label>
              <input
                v-model="tempTranslation.content"
                type="text"
                placeholder="Enter translation content..."
                class="input input-bordered input-lg w-full"
              />
            </div>
            
            <div class="flex gap-2 justify-end">
              <button
                @click="cancelEdit"
                class="btn btn-sm btn-ghost"
              >
                <X class="w-4 h-4" />
                Cancel
              </button>
              <button
                @click="saveEdit"
                class="btn btn-sm btn-success"
              >
                <Check class="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
          
          <!-- Display mode -->
          <div v-else class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
            <div class="flex-1">
              <div class="text-lg">{{ translation.content || '(Empty translation)' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="editingIndex = index; tempTranslation = { ...translation }"
                class="btn btn-sm btn-ghost"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button
                type="button"
                @click="deleteTranslation(translation.uid)"
                class="btn btn-ghost btn-circle text-error flex-shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- New translation creation form -->
      <div v-if="isCreatingNew" class="space-y-4 mt-4">
        <div class="flex flex-col space-y-1">
          <label class=" font-medium">Translation Content</label>
          <input
            v-model="tempTranslation.content"
            type="text"
            placeholder="Enter translation content..."
            class="input input-bordered input-lg w-full"
          />
        </div>
        
        <div class="flex gap-2 justify-end">
          <button
            @click="isCreatingNew = false"
            class="btn btn-sm btn-ghost"
          >
            <X class="w-4 h-4" />
            Cancel
          </button>
          <button
            @click="saveNewTranslation"
            class="btn btn-sm btn-success"
            :disabled="!tempTranslation.content?.trim()"
          >
            <Check class="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Edit, X, Check } from 'lucide-vue-next';
import InlineInput from '@/shared/ui/InlineInput.vue';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import LanguageDropdown from '@/entities/languages/LanguageDropdown.vue';
import type { Length } from '@/shared/types/Length';

interface VocabFormData {
  id?: string;
  language: string;
  content: string;
  length: Length;
  translations: TranslationData[];
  priority?: number;
  doNotPractice?: boolean;
  notes: NoteData[];
  links: Array<{
    label: string;
    url: string;
  }>;
}

defineProps<{
  formData: VocabFormData;
}>();

const emit = defineEmits<{
  'field-change': [];
  'add-translation': [translation: TranslationData];
  'update-translation': [translation: TranslationData];
  'remove-translation': [uid: string];
}>();

// Translation management state
const editingIndex = ref<number | null>(null);
const isCreatingNew = ref(false);
const tempTranslation = ref<TranslationData>({
  uid: '',
  content: '',
  priority: 1,
  notes: [],
  origins: []
});

function addNewTranslation() {
  tempTranslation.value = {
    uid: '',
    content: '',
    priority: 1,
    notes: [],
    origins: []
  };
  isCreatingNew.value = true;
}

function saveNewTranslation() {
  if (!tempTranslation.value.content?.trim()) return;
  
  const newTranslation: TranslationData = {
    ...tempTranslation.value,
    content: tempTranslation.value.content.trim(),
    uid: crypto.randomUUID()
  };
  
  emit('add-translation', newTranslation);
  isCreatingNew.value = false;
}

function saveEdit() {
  if (!tempTranslation.value.content?.trim()) {
    alert('Translation content is required');
    return;
  }
  
  const translationToSave: TranslationData = {
    ...tempTranslation.value,
    content: tempTranslation.value.content.trim()
  };
  
  emit('update-translation', translationToSave);
  editingIndex.value = null;
}

function cancelEdit() {
  editingIndex.value = null;
  isCreatingNew.value = false;
}

function deleteTranslation(uid: string) {
  emit('remove-translation', uid);
}
</script>