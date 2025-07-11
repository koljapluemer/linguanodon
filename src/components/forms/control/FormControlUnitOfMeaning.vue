<script setup lang="ts">
import { ref } from 'vue'
import { createEmptyCard } from 'ts-fsrs'
import FormRenderUnitOfMeaning from '@/components/forms/render/FormRenderUnitOfMeaning.vue'
import { makeTwoUnitsOfMeaningsTranslationsOfEachOther } from '@/utils/unitOfMeaning/makeTwoUnitsOfMeaningsTranslationsOfEachOther'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  initialUnit?: Partial<UnitOfMeaning>
  repository: UnitOfMeaningRepository
  languageRepository: LanguageRepository
  showTranslations?: boolean
}

interface Emits {
  (e: 'update', unit: UnitOfMeaning): void
}

const props = withDefaults(defineProps<Props>(), {
  showTranslations: true
})

const emit = defineEmits<Emits>()

/**
 * Initialize with default unit or provided initial data
 */
const unit = ref<UnitOfMeaning>({
  language: props.initialUnit?.language || 'en',
  content: props.initialUnit?.content || '',
  notes: props.initialUnit?.notes || '',
  translations: props.initialUnit?.translations || [],
  seeAlso: props.initialUnit?.seeAlso || [],
  credits: props.initialUnit?.credits || [],
  card: props.initialUnit?.card || createEmptyCard()
})

/**
 * Handle updates from the render component
 */
function handleUpdate(updatedUnit: UnitOfMeaning) {
  unit.value = updatedUnit
  emit('update', updatedUnit)
}

/**
 * Handle connecting an existing unit as translation (mutual)
 */
async function handleConnectTranslation(selectedUnit: UnitOfMeaning) {
  await makeTwoUnitsOfMeaningsTranslationsOfEachOther(unit.value, selectedUnit, props.repository)
  // Refresh current unit (assume repo is source of truth)
  const refreshed = await props.repository.findUnitOfMeaning(unit.value.language, unit.value.content)
  if (refreshed) {
    unit.value = refreshed
    emit('update', refreshed)
  }
}

/**
 * Handle creating a new unit and connecting as translation (mutual)
 */
async function handleAddNewTranslation(newUnit: UnitOfMeaning) {
  await props.repository.addUnitOfMeaning(newUnit)
  await makeTwoUnitsOfMeaningsTranslationsOfEachOther(unit.value, newUnit, props.repository)
  // Refresh current unit
  const refreshed = await props.repository.findUnitOfMeaning(unit.value.language, unit.value.content)
  if (refreshed) {
    unit.value = refreshed
    emit('update', refreshed)
  }
}

/**
 * Handle disconnecting a translation (removes mutual relationship)
 */
async function handleDisconnectTranslation(translation: { language: string; content: string }) {
  // Remove from current unit's translations
  unit.value = {
    ...unit.value,
    translations: unit.value.translations.filter(t => !(t.language === translation.language && t.content === translation.content))
  }
  
  // Also remove current unit from the translation unit's translations
  const translationUnit = await props.repository.findUnitOfMeaning(translation.language, translation.content)
  if (translationUnit) {
    const updatedTranslationUnit = {
      ...translationUnit,
      translations: translationUnit.translations.filter(t => 
        !(t.language === unit.value.language && t.content === unit.value.content)
      )
    }
    // Update the translation unit in the repository
    await props.repository.addUnitOfMeaning(updatedTranslationUnit)
  }
  
  emit('update', unit.value)
}

/**
 * Handle deleting a translation (deletes the unit entirely)
 */
async function handleDeleteTranslation(translation: { language: string; content: string }) {
  const translationUnit = await props.repository.findUnitOfMeaning(translation.language, translation.content)
  if (translationUnit) {
    // Remove current unit from the translation unit's translations before deleting
    const updatedTranslationUnit = {
      ...translationUnit,
      translations: translationUnit.translations.filter(t => 
        !(t.language === unit.value.language && t.content === unit.value.content)
      )
    }
    await props.repository.addUnitOfMeaning(updatedTranslationUnit)
    
    // Now delete the translation unit
    await props.repository.deleteUnitOfMeaning(translationUnit)
    
    // Remove from current unit's translations
    unit.value = {
      ...unit.value,
      translations: unit.value.translations.filter(t => !(t.language === translation.language && t.content === translation.content))
    }
    emit('update', unit.value)
  }
}
</script>

<template>
  <FormRenderUnitOfMeaning
    :unit="unit"
    :language-repository="languageRepository"
    :repository="repository"
    :show-translations="showTranslations"
    @update="handleUpdate"
    @connect-translation="handleConnectTranslation"
    @add-new-translation="handleAddNewTranslation"
    @disconnect-translation="handleDisconnectTranslation"
    @delete-translation="handleDeleteTranslation"
  />
</template>
