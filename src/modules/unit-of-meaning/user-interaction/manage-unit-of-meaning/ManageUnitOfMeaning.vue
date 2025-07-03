<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200">
    <div class="card w-full max-w-xl shadow-xl bg-base-100">
      <div class="card-body">
        <template v-if="state === 'loading'">
          <div class="flex flex-col items-center justify-center py-8">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <span class="mt-4 text-base-content/70">Loading...</span>
          </div>
        </template>
        <template v-else-if="state === 'error'">
          <div class="alert alert-error">
            <span>Error loading unit of meaning.</span>
          </div>
        </template>
        <template v-else-if="state === 'empty'">
          <div class="flex flex-col items-center justify-center py-8">
            <span class="text-base-content/70">No data available.</span>
          </div>
        </template>
        <template v-else>
          <div class="mb-4">
            <h2 class="card-title">Manage Unit of Meaning</h2>
            <div v-if="uid" class="text-xs text-base-content/60 mt-1">UID: {{ uid }}</div>
            <div v-else class="text-xs text-base-content/60 mt-1 italic">No word or Sentence found</div>
          </div>
          <div v-if="unit">
            <UnitOfMeaningForm :unit="unit" :showTranslations="true" />
            <div class="mt-4">
              <TranslationsWidget :translations="translations" />
            </div>
            <div class="mt-2 text-xs text-base-content/60">
              <span v-if="status === 'unsaved'">Unsaved changes</span>
              <span v-else-if="status === 'saving'">Saving...</span>
              <span v-else-if="status === 'saved'">All changes saved</span>
              <span v-else-if="status === 'error'">Error saving changes</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import UnitOfMeaningForm from './UnitOfMeaningForm.vue'
import TranslationsWidget from './TranslationsWidget.vue'
import { getUnitOfMeaningById, updateUnitOfMeaning, getAllUnitsOfMeaning } from '@/modules/unit-of-meaning/utils/useUnitOfMeaningDB'
import { useAutoSaveUnitOfMeaning } from '@/modules/unit-of-meaning/utils/useAutoSaveUnitOfMeaning'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const props = defineProps<{ uid?: string }>()
const state = ref<'loading' | 'error' | 'empty' | 'ready'>('loading')
const unit = ref<UnitOfMeaning>({
  uid: '',
  language: '',
  content: '',
  linguType: '',
  userCreated: true,
  context: ''
})
const unitLoaded = ref(false)
const translations = ref<UnitOfMeaning[]>([])

const status = ref<'unsaved' | 'saving' | 'saved' | 'error'>('saved')
const error = ref<unknown>(null)

/**
 * Fetches the unit of meaning by UID and updates state.
 */
async function fetchUnit() {
  console.log('fetchUnit called with uid:', props.uid)
  if (!props.uid) {
    state.value = 'empty'
    unitLoaded.value = false
    return
  }
  state.value = 'loading'
  try {
    const result = await getUnitOfMeaningById(props.uid)
    console.log('getUnitOfMeaningById result:', result)
    if (!result) {
      state.value = 'empty'
      unitLoaded.value = false
      return
    }
    Object.assign(unit.value, result)
    state.value = 'ready'
    unitLoaded.value = true
    fetchTranslations()
  } catch (e) {
    console.error(e)
    state.value = 'error'
    unitLoaded.value = false
  }
}

/**
 * Fetches all translation units for the current unit.
 */
async function fetchTranslations() {
  if (!unit.value || !unit.value.translations) {
    translations.value = []
    return
  }
  // Fetch all translation units by UID
  const promises = unit.value.translations.map(uid => getUnitOfMeaningById(uid))
  translations.value = (await Promise.all(promises)).filter(Boolean) as UnitOfMeaning[]
}

let autoSave: ReturnType<typeof useAutoSaveUnitOfMeaning> | null = null
watch(unitLoaded, (loaded) => {
  if (loaded && !autoSave) {
    autoSave = useAutoSaveUnitOfMeaning(
      unit,
      async (u: UnitOfMeaning) => {
        console.log('Auto-save triggered with unit:', u)
        try {
          // Convert reactive Proxy to plain object for Dexie
          const plainUnit = JSON.parse(JSON.stringify(u))
          await updateUnitOfMeaning(plainUnit)
          console.log('Auto-save successful')
          await fetchTranslations()
        } catch (e) {
          console.error('Auto-save failed:', e)
          throw e
        }
      },
      { debounceMs: 500 }
    )
    watch(autoSave.status, val => (status.value = val))
    watch(autoSave.error, val => (error.value = val))
  }
})

onMounted(async () => {
  const all = await getAllUnitsOfMeaning();
  console.log('All units in DB:', all.map(u => u.uid));
  fetchUnit();
})
</script>

<style scoped>
</style>
