<template>
  <div>
    <button class="button is-link" @click="openModal = true">Connect Existing Word or Sentence</button>
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
import { ref, computed, watch, onMounted } from 'vue'
import ConnectExistingUnitOfMeaning from './translationWidgets/ConnectExistingUnitOfMeaning.vue'
import { getUnitOfMeaningById, connectUnitsAsTranslations } from '../../../dexie/useUnitOfMeaningTable'
import { getLanguages } from '../../../dexie/useLanguageTable'
import { db } from '../../../dexie/db'
import { filterEligibleTranslationUnits } from '../../../utils/unitOfMeaningUtils'
import type { UnitOfMeaning } from '../../../types/UnitOfMeaning'
import type { Language } from '../../../types/Language'


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

watch(() => props.unitId, loadData, { immediate: true })
</script>
