<template>
  <div class="divide-y divide-gray-200 ">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">{{ $t('factCards.states.loadingFactCard') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <div v-else>
      <LanguageDropdown
        v-model="formData.language"
        label="Language"
        placeholder="Select target language"
        required
        inline
        @update:model-value="$emit('field-change')"
      />

      <InlineTextarea
        v-model="formData.front"
        label="Front"
        placeholder="Enter the front of the card"
        required
        @update:modelValue="$emit('field-change')"
      />

      <InlineTextarea
        v-model="formData.back"
        label="Back"
        placeholder="Enter the back of the card"
        required
        @update:modelValue="$emit('field-change')"
      />

      <!-- Notes -->
      <div class="py-4">
        <div class="flex justify-between items-center mb-3">
          <div class=" font-medium  ">
            {{ $t('notes.title') }}
          </div>
          <button
            type="button"
            @click="$emit('add-note')"
            class="btn btn-sm btn-outline"
          >
            <Plus class="w-4 h-4 mr-1" />
            {{ $t('factCards.notes.addNote') }}
          </button>
        </div>
        
        <div v-if="formData.notes.length === 0" class=" text-center py-4">
          {{ $t('factCards.notes.noNotes') }}
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="note in formData.notes"
            :key="note.uid"
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div class="flex-1">
              <div class="text-lg">{{ note.content || '(Empty note)' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="$emit('remove-note', note.uid)"
                class="btn btn-ghost btn-circle text-error flex-shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="py-4">
        <div class="flex justify-between items-center mb-3">
          <div class=" font-medium  ">
            {{ $t('factCards.links.title') }}
          </div>
          <button
            type="button"
            @click="addNewLink"
            class="btn btn-sm btn-outline"
          >
            <Plus class="w-4 h-4 mr-1" />
            {{ $t('factCards.links.addLink') }}
          </button>
        </div>
        
        <div v-if="formData.links.length === 0" class=" text-center py-4">
          {{ $t('factCards.links.noLinks') }}
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="(link, index) in formData.links"
            :key="index"
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div class="flex-1">
              <div class="text-lg">{{ link.label || '(Untitled)' }}</div>
              <div class=" ">{{ link.url }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="$emit('remove-link', index)"
                class="btn btn-ghost btn-circle text-error flex-shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto-save status -->
      <div class="py-4">
        <div class="flex items-center gap-2">
          <span v-if="saving" class=" text-light flex items-center gap-1">
            <span class="loading loading-spinner loading-sm"></span>
            {{ $t('factCards.autoSaving') }}
          </span>
          <span v-else-if="isEditing" class=" text-success flex items-center gap-1">
            <Check class="w-4 h-4" />
            {{ $t('factCards.changesSaved') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, X, Check } from 'lucide-vue-next';
import InlineTextarea from '@/shared/ui/InlineTextarea.vue';
import LanguageDropdown from '@/entities/languages/LanguageDropdown.vue';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { Link } from '@/shared/links/Link';

interface FactCardFormData {
  id?: string;
  language: string;
  front: string;
  back: string;
  notes: NoteData[];
  links: Link[];
  priority?: number;
  doNotPractice?: boolean;
}

defineProps<{
  formData: FactCardFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
  loadedFactCardData: FactCardData | null;
}>();

const emit = defineEmits<{
  'field-change': [];
  'add-note': [];
  'update-note': [note: NoteData];
  'remove-note': [uid: string];
  'add-link': [link: Link];
  'update-link': [index: number, link: Link];
  'remove-link': [index: number];
}>();

function addNewLink() {
  const newLink: Link = {
    label: '',
    url: ''
  };
  emit('add-link', newLink);
}
</script>