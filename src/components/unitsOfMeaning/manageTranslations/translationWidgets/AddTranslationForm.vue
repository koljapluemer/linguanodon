<template>
  <div class="box">
    <h2 class="title is-5">Add New Translation</h2>
    <UnitOfMeaningForm
      :initially-collapsed="false"
      :show-translations="false"
      :filtered-languages="filteredLanguages"
      @saved="onTranslationSaved"
      @cancelled="onCancelled"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnitOfMeaningForm from '../../UnitOfMeaningForm.vue'
import type { Language } from '@/types/persistent-general-data/Language'
import type { UnitOfMeaning } from '@/types/persistent-general-data/UnitOfMeaning'

const props = defineProps<{
  currentUnit: UnitOfMeaning
  allLanguages: Language[]
}>()

const emit = defineEmits<{
  saved: [unitId: number]
  cancelled: []
}>()

const filteredLanguages = computed(() => {
  if (!props.currentUnit.languageName) return []
  
  const currentLang = props.allLanguages.find(l => l.name === props.currentUnit.languageName)
  if (!currentLang) return []
  
  // Filter to opposite language type
  return props.allLanguages.filter(lang => lang.isTargetLanguage !== currentLang.isTargetLanguage)
    .sort((a, b) => {
      // Sort target languages first, then by position
      if (a.isTargetLanguage !== b.isTargetLanguage) {
        return a.isTargetLanguage ? -1 : 1
      }
      return a.position - b.position
    })
})

function onTranslationSaved(unitId: number) {
  emit('saved', unitId)
}

function onCancelled() {
  emit('cancelled')
}
</script> 