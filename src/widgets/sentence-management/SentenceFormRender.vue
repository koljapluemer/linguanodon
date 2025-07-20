<template>
  <form @submit.prevent="$emit('submit')">
    <!-- Language -->
    <WidgetLanguageSelect
      :model-value="sentence.language"
      @update:model-value="$emit('update:language', $event)"
      :languages="languages"
      label="Language"
      placeholder="Select a language..."
      :required="true"
      :error="errors.language"
    />

    <!-- Content -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-bold">
          Content
          <span class="text-error">*</span>
        </span>
      </label>
      <textarea
        :value="sentence.content"
        @input="$emit('update:content', ($event.target as HTMLTextAreaElement).value)"
        class="textarea textarea-bordered w-full"
        rows="4"
        placeholder="Enter the sentence content..."
        :class="{ 'textarea-error': errors.content }"
      ></textarea>
      <label v-if="errors.content" class="label">
        <span class="label-text-alt text-error">{{ errors.content }}</span>
      </label>
    </div>

    <!-- Notes -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-bold">Notes</span>
      </label>
      <div class="space-y-2">
        <div 
          v-for="(note, index) in sentence.notes || []" 
          :key="index"
          class="flex gap-2"
        >
          <textarea
            :value="note.content"
            @input="$emit('update:note-content', index, ($event.target as HTMLTextAreaElement).value)"
            class="textarea textarea-bordered flex-1"
            rows="2"
            placeholder="Note content..."
          ></textarea>
          <div class="flex flex-col gap-1">
            <label class="flex items-center gap-2">
              <input 
                type="checkbox" 
                :checked="note.showBeforeExercise"
                @change="$emit('update:note-show-before', index, ($event.target as HTMLInputElement).checked)"
                class="checkbox checkbox-sm"
              />
              <span class="text-sm">Show before exercise</span>
            </label>
            <button 
              @click="$emit('remove-note', index)"
              class="btn btn-error btn-sm"
            >
              Remove
            </button>
          </div>
        </div>
        <button 
          @click="$emit('add-note')"
          class="btn btn-outline btn-sm"
        >
          Add Note
        </button>
      </div>
    </div>

    <!-- Translations -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-bold">Translations</span>
      </label>
      <div class="space-y-2">
        <div 
          v-for="(translation, index) in sentence.translations || []" 
          :key="index"
          class="flex gap-2"
        >
          <input
            :value="translation.language"
            @input="$emit('update:translation-language', index, ($event.target as HTMLInputElement).value)"
            class="input input-bordered w-24"
            placeholder="Lang"
          />
          <input
            :value="translation.content"
            @input="$emit('update:translation-content', index, ($event.target as HTMLInputElement).value)"
            class="input input-bordered flex-1"
            placeholder="Translation content..."
          />
          <button 
            @click="$emit('remove-translation', index)"
            class="btn btn-error btn-sm"
          >
            Remove
          </button>
        </div>
        <button 
          @click="$emit('add-translation')"
          class="btn btn-outline btn-sm"
        >
          Add Translation
        </button>
      </div>
    </div>

    <!-- Links -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-bold">Links</span>
      </label>
      <div class="space-y-2">
        <div 
          v-for="(link, index) in sentence.links || []" 
          :key="index"
          class="flex gap-2"
        >
          <input
            :value="link.label"
            @input="$emit('update:link-label', index, ($event.target as HTMLInputElement).value)"
            class="input input-bordered w-32"
            placeholder="Label"
          />
          <input
            :value="link.url"
            @input="$emit('update:link-url', index, ($event.target as HTMLInputElement).value)"
            class="input input-bordered flex-1"
            placeholder="URL..."
          />
          <button 
            @click="$emit('remove-link', index)"
            class="btn btn-error btn-sm"
          >
            Remove
          </button>
        </div>
        <button 
          @click="$emit('add-link')"
          class="btn btn-outline btn-sm"
        >
          Add Link
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import WidgetLanguageSelect from '@/shared/WidgetLanguageSelect.vue'
import type { SentenceData } from '@/entities/linguisticUnits'

interface Props {
  sentence: SentenceData
  languages: Array<{ code: string; name: string }>
  errors: Record<string, string>
}

interface Emits {
  (e: 'submit'): void
  (e: 'update:language', value: string): void
  (e: 'update:content', value: string): void
  (e: 'update:note-content', index: number, content: string): void
  (e: 'update:note-show-before', index: number, showBefore: boolean): void
  (e: 'add-note'): void
  (e: 'remove-note', index: number): void
  (e: 'update:translation-language', index: number, language: string): void
  (e: 'update:translation-content', index: number, content: string): void
  (e: 'add-translation'): void
  (e: 'remove-translation', index: number): void
  (e: 'update:link-label', index: number, label: string): void
  (e: 'update:link-url', index: number, url: string): void
  (e: 'add-link'): void
  (e: 'remove-link', index: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
