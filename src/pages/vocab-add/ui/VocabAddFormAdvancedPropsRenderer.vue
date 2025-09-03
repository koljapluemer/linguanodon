<template>
  <div class="py-4">
    <label class="label">
      <span class="label-text font-medium">Length</span>
    </label>
    <select v-model="formData.length" @change="$emit('field-change')" class="select select-bordered w-full">
      <option v-for="value in (['sentence', 'word', 'unspecified'] as Length[])" :key="value" :value="value">
        {{ value }}
      </option>
    </select>
  </div>

  <!-- Priority -->
  <div class="py-4">
    <label class="label">
      <span class="label-text font-medium">Priority</span>
    </label>
    <input v-model.number="formData.priority" @input="$emit('field-change')" type="number" min="1" max="5"
      placeholder="1" class="input input-bordered w-full" />
  </div>

  <!-- Exclude from Practice -->
  <div class="py-4">
    <label class="label cursor-pointer">
      <span class="label-text font-medium">Exclude from practice</span>
      <input v-model="formData.doNotPractice" @change="$emit('field-change')" type="checkbox" class="toggle" />
    </label>
  </div>

  <div class="py-4">
    <NoteList :notes="formData.notes" :show-before-exercise-option="true" @add="$emit('add-note', $event)"
      @update="$emit('update-note', $event)" @delete="$emit('remove-note', $event)" />
  </div>

  <div class="py-4">
    <LinksForm :links="formData.links" @add-link="$emit('add-link', $event)"
      @update-link="(index, link) => $emit('update-link', index, link)" @remove-link="$emit('remove-link', $event)"
      @field-change="$emit('field-change')" />
  </div>

  <!-- Can be visualized toggle -->
  <div class="py-4">
    <label class="label cursor-pointer">
      <span class="label-text font-medium">Can be visualized</span>
      <input v-model="formData.isPicturable" @change="$emit('field-change')" type="checkbox" class="toggle" />
    </label>
  </div>

  <!-- Images -->
  <div v-if="formData.isPicturable !== false" class="py-4">
    <VocabImageManager
      :images="formData.images"
      :is-picturable="formData.isPicturable"
      @images-changed="(images) => $emit('update-images', images)"
    />
  </div>

  <!-- Audio -->
  <div class="py-4">
    <VocabSoundManager
      :sound="formData.sound"
      @sound-changed="(sound) => $emit('update-sound', sound)"
    />
  </div>
</template>

<script setup lang="ts">
import NoteList from '@/entities/notes/NoteList.vue';
import LinksForm from '@/shared/links/LinksForm.vue';
import VocabImageManager from '@/features/vocab-image-management/VocabImageManager.vue';
import VocabSoundManager from '@/features/vocab-sound-management/VocabSoundManager.vue';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import type { Link } from '@/shared/links/Link';
import type { Length } from '@/shared/types/Length';
import type { VocabImage, VocabSound } from '@/entities/vocab/VocabData';

interface VocabFormData {
  language: string;
  content: string;
  length: Length;
  translations: TranslationData[];
  priority?: number;
  doNotPractice?: boolean;
  notes: NoteData[];
  links: Link[];
  isPicturable?: boolean;
  images?: VocabImage[];
  sound?: VocabSound;
}

defineProps<{
  formData: VocabFormData;
}>();

defineEmits<{
  'field-change': [];
  'add-note': [note: NoteData];
  'update-note': [note: NoteData];
  'remove-note': [uid: string];
  'add-link': [link: Link];
  'update-link': [index: number, link: Link];
  'remove-link': [index: number];
  'update-images': [images: VocabImage[]];
  'update-sound': [sound: VocabSound | undefined];
}>();
</script>