<template>
  <!-- Loading state -->
  <div v-if="loading" class="text-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="mt-4">Loading...</p>
  </div>

  <!-- Form -->
  <div v-else class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <WordFormRender
        :word="form"
        :languages="languages"
        :errors="errors"
        @submit="save"
        @update:language="updateLanguage"
        @update:content="updateContent"
        @update:note-content="updateNoteContent"
        @update:note-show-before="updateNoteShowBefore"
        @add-note="addNote"
        @remove-note="removeNote"
        @update:translation-type="updateTranslationType"
        @update:translation-language="updateTranslationLanguage"
        @update:translation-content="updateTranslationContent"
        @add-translation="addTranslation"
        @remove-translation="removeTranslation"
        @update:link-label="updateLinkLabel"
        @update:link-url="updateLinkUrl"
        @add-link="addLink"
        @remove-link="removeLink"
      />

      <!-- Actions -->
      <div class="flex gap-4 mt-6">
        <button
          @click="save"
          class="btn btn-primary"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          {{ (language && content) ? 'Update Word' : 'Create Word' }}
        </button>
        <button
          @click="reset"
          class="btn btn-outline"
          :disabled="loading"
        >
          Reset
        </button>
        <button
          v-if="language && content"
          @click="deleteWord"
          class="btn btn-error"
          :disabled="loading"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WordFormRender from './WordFormRender.vue'
import { wordService } from '@/entities/linguisticUnits'
import type { WordData } from '@/entities/linguisticUnits'

interface Props {
  language?: string
  content?: string
  languages: Array<{ code: string; name: string }>
}

interface Emits {
  (e: 'saved', word: WordData): void
  (e: 'deleted'): void
  (e: 'error', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Internal form state
const form = ref<WordData>({
  type: 'word',
  language: '',
  content: '',
  notes: [],
  translations: [],
  links: [],
  credits: [],
  otherForms: [],
  synonyms: [],
  appearsIn: []
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)

// Initialize data loading on mount
onMounted(() => {
  if (props.language && props.content) {
    loading.value = true
    loadWordData()
  }
})

/**
 * Validates the form and updates errors
 */
function validate() {
  const newErrors: Record<string, string> = {}
  
  if (!form.value.language.trim()) {
    newErrors.language = 'Language is required'
  }
  
  if (!form.value.content.trim()) {
    newErrors.content = 'Content is required'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

/**
 * Loads word data from the repository
 */
async function loadWordData() {
  if (!props.language || !props.content) return
  
  loading.value = true
  try {
    const word = await wordService.getById(props.language, props.content)
    if (word) {
      form.value = { ...word }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load word'
    emit('error', message)
  } finally {
    loading.value = false
  }
}

/**
 * Resets the form to initial state
 */
function reset() {
  if (props.language && props.content) {
    loadWordData()
  } else {
    form.value = {
      type: 'word',
      language: '',
      content: '',
      notes: [],
      translations: [],
      links: [],
      credits: [],
      otherForms: [],
      synonyms: [],
      appearsIn: []
    }
  }
  errors.value = {}
}

/**
 * Saves the word to the repository
 */
async function save() {
  if (!validate()) return false
  
  loading.value = true
  try {
    if (props.language && props.content) {
      await wordService.update(form.value)
    } else {
      await wordService.add(form.value)
    }
    emit('saved', form.value)
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save word'
    emit('error', message)
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Deletes the word from the repository
 */
async function deleteWord() {
  if (!props.language || !props.content) return false
  
  loading.value = true
  try {
    await wordService.delete(form.value.language, form.value.content)
    emit('deleted')
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete word'
    emit('error', message)
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Updates the word language
 */
function updateLanguage(value: string) {
  form.value.language = value
}

/**
 * Updates the word content
 */
function updateContent(value: string) {
  form.value.content = value
}

/**
 * Updates note content
 */
function updateNoteContent(index: number, content: string) {
  if (!form.value.notes) form.value.notes = []
  form.value.notes[index] = { ...form.value.notes[index], content }
}

/**
 * Updates note showBeforeExercise flag
 */
function updateNoteShowBefore(index: number, showBefore: boolean) {
  if (!form.value.notes) form.value.notes = []
  form.value.notes[index] = { ...form.value.notes[index], showBeforeExercise: showBefore }
}

/**
 * Adds a new note
 */
function addNote() {
  if (!form.value.notes) form.value.notes = []
  form.value.notes.push({ content: '' })
}

/**
 * Removes a note
 */
function removeNote(index: number) {
  if (!form.value.notes) return
  form.value.notes.splice(index, 1)
}

/**
 * Updates translation type
 */
function updateTranslationType(index: number, type: string) {
  if (!form.value.translations) form.value.translations = []
  form.value.translations[index] = { ...form.value.translations[index], type: type as 'word' | 'sentence' }
}

/**
 * Updates translation language
 */
function updateTranslationLanguage(index: number, language: string) {
  if (!form.value.translations) form.value.translations = []
  form.value.translations[index] = { ...form.value.translations[index], language }
}

/**
 * Updates translation content
 */
function updateTranslationContent(index: number, content: string) {
  if (!form.value.translations) form.value.translations = []
  form.value.translations[index] = { ...form.value.translations[index], content }
}

/**
 * Adds a new translation
 */
function addTranslation() {
  if (!form.value.translations) form.value.translations = []
  form.value.translations.push({ type: 'word', language: '', content: '' })
}

/**
 * Removes a translation
 */
function removeTranslation(index: number) {
  if (!form.value.translations) return
  form.value.translations.splice(index, 1)
}

/**
 * Updates link label
 */
function updateLinkLabel(index: number, label: string) {
  if (!form.value.links) form.value.links = []
  form.value.links[index] = { ...form.value.links[index], label }
}

/**
 * Updates link URL
 */
function updateLinkUrl(index: number, url: string) {
  if (!form.value.links) form.value.links = []
  form.value.links[index] = { ...form.value.links[index], url }
}

/**
 * Adds a new link
 */
function addLink() {
  if (!form.value.links) form.value.links = []
  form.value.links.push({ label: '', url: '' })
}

/**
 * Removes a link
 */
function removeLink(index: number) {
  if (!form.value.links) return
  form.value.links.splice(index, 1)
}

// Expose methods for parent components
defineExpose({
  save,
  delete: deleteWord,
  reset,
  validate
})
</script> 