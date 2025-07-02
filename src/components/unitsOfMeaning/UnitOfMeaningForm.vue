<template>
  <details :open="!initiallyCollapsed && !isCollapsed" @toggle="onToggle" class="box">
    <summary class="title is-4 is-clickable m-0">
      {{ summaryText }}
    </summary>
    <form @submit.prevent="onSubmit" class="mt-4">
      <div class="field">
        <label class="label">Language</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="form.languageName" required>
              <option v-for="lang in orderedLanguages" :key="lang.name" :value="lang.name">
                {{ lang.abbreviation }} {{ lang.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Content</label>
        <div class="control">
          <input v-model="form.content" class="input" required placeholder="Word or phrase" />
        </div>
      </div>
      <div class="field">
        <label class="label">Word Type</label>
        <div class="control">
          <input v-model="form.wordType" class="input" required placeholder="e.g. noun, verb" />
        </div>
      </div>
      <div class="field">
        <label class="label">Pronunciation <span class="has-text-grey-light">(optional)</span></label>
        <div class="control">
          <input v-model="form.pronunciation" class="input" placeholder="Pronunciation" />
        </div>
      </div>
      <div class="field">
        <label class="label">Notes <span class="has-text-grey-light">(optional)</span></label>
        <div class="control">
          <textarea v-model="form.notes" class="textarea" placeholder="Any notes"></textarea>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <button class="button is-primary" type="submit" :disabled="loading">{{ isEdit ? 'Update' : 'Add' }}</button>
        </div>
      </div>
      <p v-if="success" class="has-text-success">Unit of Meaning {{ isEdit ? 'updated' : 'added' }}!</p>
      <p v-if="error" class="has-text-danger">{{ error }}</p>
    </form>

    <div class="" v-if="showTranslations">
      <hr>
      <DisplayTranslations v-if="id" :unit-id="id" class="mt-5" />
    </div>

  </details>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { addUnitOfMeaning, getUnitOfMeaningById } from '../../dexie/useUnitOfMeaningTable'
import { db } from '../../dexie/db'
import { getLanguages } from '../../dexie/useLanguageTable'
import type { Language } from '@/types/persistent-general-data/Language'
import DisplayTranslations from './manageTranslations/DisplayTranslations.vue'

const props = defineProps<{ 
  id?: number, 
  initiallyCollapsed: boolean, 
  showTranslations: boolean,
  filteredLanguages?: Language[]
}>()
const emit = defineEmits<{
  saved: [unitId: number]
  cancelled: []
}>()
const isEdit = computed(() => !!props.id)

const form = ref({
  languageName: '',
  content: '',
  wordType: '',
  pronunciation: '',
  notes: ''
})

const languages = ref<Language[]>([])
const loading = ref(false)
const success = ref(false)
const error = ref('')
const isCollapsed = ref(props.initiallyCollapsed)

const summaryText = computed(() => {
  return form.value.content || 'Add Word or Sentence'
})

const orderedLanguages = computed(() => {
  // Use filtered languages if provided (for translation forms)
  if (props.filteredLanguages) {
    return props.filteredLanguages
  }
  
  // Otherwise use all languages with normal ordering
  const targets = languages.value.filter(l => l.isTargetLanguage).sort((a, b) => a.position - b.position)
  const natives = languages.value.filter(l => !l.isTargetLanguage).sort((a, b) => a.position - b.position)
  return [...targets, ...natives]
})

function onToggle(event: Event) {
  const details = event.target as HTMLDetailsElement
  isCollapsed.value = !details.open
  
  // Emit cancelled event when form is collapsed and we're in add mode
  if (!details.open && !isEdit.value) {
    emit('cancelled')
  }
}

async function fetchLanguages() {
  languages.value = await getLanguages()
}

async function fetchUnitOfMeaning(id: number) {
  loading.value = true
  const uom = await getUnitOfMeaningById(id)
  if (uom) {
    form.value = {
      languageName: uom.languageName || '',
      content: uom.content || '',
      wordType: uom.wordType || '',
      pronunciation: uom.pronunciation || '',
      notes: uom.notes || ''
    }
  }
  loading.value = false
}

onMounted(async () => {
  await fetchLanguages()
  if (isEdit.value && props.id) {
    await fetchUnitOfMeaning(props.id)
  }
})

watch(() => props.id, async (newId, oldId) => {
  if (newId !== oldId) {
    // Reset to collapsed state when switching between add/edit modes
    isCollapsed.value = props.initiallyCollapsed
    if (newId) {
      await fetchUnitOfMeaning(newId)
    } else {
      form.value = { languageName: '', content: '', wordType: '', pronunciation: '', notes: '' }
    }
  }
})

async function onSubmit() {
  loading.value = true
  success.value = false
  error.value = ''
  try {
    if (isEdit.value && props.id) {
      await db.unitOfMeanings.update(props.id, {
        languageName: form.value.languageName,
        content: form.value.content,
        wordType: form.value.wordType,
        pronunciation: form.value.pronunciation || undefined,
        notes: form.value.notes || undefined
      })
      success.value = true
    } else {
      const newId = await addUnitOfMeaning({
        languageName: form.value.languageName,
        content: form.value.content,
        wordType: form.value.wordType,
        pronunciation: form.value.pronunciation || undefined,
        notes: form.value.notes || undefined
      })
      success.value = true
      form.value = { languageName: '', content: '', wordType: '', pronunciation: '', notes: '' }
      
      // Emit saved event with the new unit ID
      emit('saved', newId)
    }
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as Record<string, unknown>).message === 'string') {
      error.value = (e as { message: string }).message
    } else {
      error.value = 'Failed to save.'
    }
  } finally {
    loading.value = false
  }
}
</script>
