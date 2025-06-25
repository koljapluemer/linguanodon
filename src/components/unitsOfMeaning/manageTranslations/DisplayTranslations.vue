<template>
  <div>
    <h2 class="title">Translations</h2>
    <div v-if="currentUnit && currentUnit.translations && currentUnit.translations.length" class="mb-3" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
      <UnitOfMeaningForm
        v-for="tid in currentUnit.translations"
        :key="tid"
        :id="tid"
        :initially-collapsed="true"
        :showTranslations="false"
      />
    </div>
    
    <div class="buttons">
      <button class="button is-link" @click="openModal = true">Connect Existing Word or Sentence</button>
      <button class="button is-success" @click="showAddForm = true" v-if="!showAddForm">Add New Translation</button>
    </div>
    
    <AddTranslationForm
      v-if="showAddForm && currentUnit"
      :current-unit="currentUnit"
      :all-languages="allLanguages"
      @saved="onNewTranslationSaved"
      @cancelled="showAddForm = false"
    />
    
    <ConnectExistingUnitOfMeaning
      :open="openModal"
      :eligible-units="visibleEligibleUnits"
      :loading="loadingMore"
      :load-more="loadMore"
      :close="closeModal"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ConnectExistingUnitOfMeaning from './translationWidgets/ConnectExistingUnitOfMeaning.vue'
import AddTranslationForm from './translationWidgets/AddTranslationForm.vue'
import { getUnitOfMeaningById, connectUnitsAsTranslations } from '../../../dexie/useUnitOfMeaningTable'
import { getLanguages } from '../../../dexie/useLanguageTable'
import { db } from '../../../dexie/db'
import { filterEligibleTranslationUnits } from '../../../utils/unitOfMeaningUtils'
import type { UnitOfMeaning } from '../../../types/UnitOfMeaning'
import type { Language } from '../../../types/Language'
import UnitOfMeaningForm from '@/components/unitsOfMeaning/UnitOfMeaningForm.vue'


const props = defineProps<{ unitId: number }>()
const openModal = ref(false)
const loadingMore = ref(false)
const allUnits = ref<UnitOfMeaning[]>([])
const allLanguages = ref<Language[]>([])
const currentUnit = ref<UnitOfMeaning | null>(null)
const eligibleUnits = ref<UnitOfMeaning[]>([])
const visibleEligibleUnits = ref<UnitOfMeaning[]>([])
const page = ref(0)
const PAGE_SIZE = 20
const showAddForm = ref(false)

async function loadData() {
  const u = await getUnitOfMeaningById(props.unitId)
  currentUnit.value = u || null
  allUnits.value = await db.unitOfMeanings.toArray()
  allLanguages.value = await getLanguages()
  eligibleUnits.value = currentUnit.value
    ? filterEligibleTranslationUnits(allUnits.value, currentUnit.value, allLanguages.value)
    : []
  page.value = 0
  visibleEligibleUnits.value = eligibleUnits.value.slice(0, PAGE_SIZE)
}

function loadMore() {
  if (loadingMore.value) return
  loadingMore.value = true
  setTimeout(() => {
    page.value++
    visibleEligibleUnits.value = eligibleUnits.value.slice(0, (page.value + 1) * PAGE_SIZE)
    loadingMore.value = false
  }, 300)
}

function closeModal() {
  openModal.value = false
}

async function onSelect(selectedId: number) {
  if (!currentUnit.value) return
  await connectUnitsAsTranslations(currentUnit.value.id!, selectedId)
  await loadData()
  openModal.value = false
}

function getTranslationContent(tid: number) {
  const t = allUnits.value.find(u => u.id === tid)
  return t ? t.content : ''
}

async function onNewTranslationSaved(newUnitId: number) {
  if (!currentUnit.value) return
  
  try {
    // Connect the new unit as a translation to the current unit
    await connectUnitsAsTranslations(currentUnit.value.id!, newUnitId)
    
    // Refresh the data to show the new translation
    await loadData()
    
    // Hide the add form
    showAddForm.value = false
  } catch (error) {
    console.error('Failed to connect new translation:', error)
    // In a real app, you might want to show an error message to the user
    // For now, we'll just log it since this should be very rare with a local DB
  }
}

watch(() => props.unitId, loadData, { immediate: true })
</script>
