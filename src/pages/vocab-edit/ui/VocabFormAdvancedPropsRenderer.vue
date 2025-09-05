<template>
  <div class="mt-8 space-y-8">
    <!-- Length, Priority and Exclude from Practice -->
    <div class="divide-y divide-gray-200 ">
      <InlineSelect
        v-model="formData.length"
        label="Length"
        :options="lengthOptions"
        @update:modelValue="$emit('field-change')"
      />

      <InlineInput
        v-model="formData.priority"
        label="Priority"
        type="number"
        :min="1"
        :max="5"
        placeholder="1"
        @update:modelValue="$emit('field-change')"
      />

      <InlineToggle
        v-model="formData.doNotPractice"
        label="Exclude from practice"
        @update:modelValue="$emit('field-change')"
      />

      <InlineToggle
        v-model="formData.isPicturable"
        label="Can be visualized"
        @update:modelValue="$emit('field-change')"
      />
    </div>

    <!-- Notes -->
      <NoteList
        :notes="formData.notes"
        :show-before-exercise-option="true"
        @add="$emit('add-note', $event)"
        @update="$emit('update-note', $event)"
        @delete="$emit('remove-note', $event)"
      />

    <!-- Links -->
    <LinksForm
      :links="formData.links"
      @add-link="$emit('add-link', $event)"
      @update-link="(index, link) => $emit('update-link', index, link)"
      @remove-link="$emit('remove-link', $event)"
      @field-change="$emit('field-change')"
    />

    <!-- Images -->
    <VocabImageManager
      v-if="formData.isPicturable !== false"
      :images="formData.images"
      :is-picturable="formData.isPicturable"
      @images-changed="(images) => emit('update-images', images)"
    />

    <!-- Audio -->
    <VocabSoundManager
      :sounds="formData.sounds"
      @sounds-changed="(sounds) => emit('update-sounds', sounds)"
    />

    <div class="space-y-4">
      <h3 class="text-lg font-medium  ">See Also / Related Vocabulary</h3>
      <ManageVocabList
        :vocab-ids="formData.relatedVocab || []"
        :language="formData.language"
        :config="{
          allowAdd: true,
          allowEdit: true,
          allowDisconnect: true,
          allowNavigate: true,
          allowDelete: false
        }"
        @update:vocab-ids="updateRelatedVocab"
        @vocab-added="handleRelatedVocabAdded"
        @vocab-updated="handleRelatedVocabUpdated"
        @vocab-disconnected="handleRelatedVocabDisconnected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineSelect from '@/shared/ui/InlineSelect.vue';
import InlineToggle from '@/shared/ui/InlineToggle.vue';
import NoteList from '@/entities/notes/NoteList.vue';
import LinksForm from '@/shared/links/LinksForm.vue';
import ManageVocabList from '@/features/manage-vocab-list/ManageVocabList.vue';
import VocabImageManager from '@/features/vocab-image-management/VocabImageManager.vue';
import VocabSoundManager from '@/features/vocab-sound-management/VocabSoundManager.vue';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { Link } from '@/shared/links/Link';
import type { Length } from '@/shared/types/Length';
import type { VocabImage, VocabSound } from '@/entities/vocab/VocabData';

interface VocabFormData {
  id?: string;
  language: string;
  content: string;
  length: Length;
  translations: TranslationData[];
  priority?: number;
  doNotPractice?: boolean;
  notes: NoteData[];
  links: Link[];
  relatedVocab?: string[];
  isPicturable?: boolean;
  images?: VocabImage[];
  sounds?: VocabSound[];
}

defineProps<{
  formData: VocabFormData;
}>();

const emit = defineEmits<{
  'field-change': [];
  'add-note': [note: NoteData];
  'update-note': [note: NoteData];
  'remove-note': [uid: string];
  'add-link': [link: Link];
  'update-link': [index: number, link: Link];
  'remove-link': [index: number];
  'update-related-vocab': [vocabIds: string[]];
  'update-images': [images: VocabImage[]];
  'update-sounds': [sounds: VocabSound[]];
}>();

const lengthOptions = computed(() => {
  return (['sentence', 'word', 'unspecified'] as Length[]).map(value => ({
    value: value,
    label: value
  }));
});

// Related vocabulary event handlers
function updateRelatedVocab(vocabIds: string[]) {
  emit('update-related-vocab', vocabIds);
  emit('field-change');
}

function handleRelatedVocabAdded() {
  emit('field-change');
}

function handleRelatedVocabUpdated() {
  emit('field-change');
}

function handleRelatedVocabDisconnected() {
  emit('field-change');
}
</script>