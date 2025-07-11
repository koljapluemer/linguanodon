<script setup lang="ts">
import { ref, watch, inject } from 'vue'
import { createEmptyCard } from 'ts-fsrs'
import FormRenderUnitOfMeaning from '@/components/forms/render/FormRenderUnitOfMeaning.vue'
import { makeTwoUnitsOfMeaningsTranslationsOfEachOther } from '@/utils/unitOfMeaning/makeTwoUnitsOfMeaningsTranslationsOfEachOther'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import { languageRepositoryKey, unitOfMeaningRepositoryKey } from '@/types/injectionKeys'

interface Props {
  initialUnit?: Partial<UnitOfMeaning>
  showTranslations?: boolean
}

interface Emits {
  (e: 'update', unit: UnitOfMeaning): void
}

const props = withDefaults(defineProps<Props>(), {
  showTranslations: true
})

const emit = defineEmits<Emits>()

// Inject repositories using proper injection keys
const repository = inject(unitOfMeaningRepositoryKey, null)
const languageRepository = inject(languageRepositoryKey, null)

if (!repository) {
  throw new Error('UnitOfMeaningRepository not provided in parent context')
}

if (!languageRepository) {
  throw new Error('LanguageRepository not provided in parent context')
}

// Type assertion after null check - this is safe because we've verified the values exist
const typedRepository = repository as NonNullable<typeof repository>

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
 * Watch for changes in initialUnit prop and update the form
 */
watch(() => props.initialUnit, (newInitialUnit) => {
  if (newInitialUnit) {
    unit.value = {
      language: newInitialUnit.language || 'en',
      content: newInitialUnit.content || '',
      notes: newInitialUnit.notes || '',
      translations: newInitialUnit.translations || [],
      seeAlso: newInitialUnit.seeAlso || [],
      credits: newInitialUnit.credits || [],
      card: newInitialUnit.card || createEmptyCard()
    }
  }
}, { immediate: true })

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
  await makeTwoUnitsOfMeaningsTranslationsOfEachOther(unit.value, selectedUnit, typedRepository)
  // Refresh current unit (assume repo is source of truth)
  const refreshed = await typedRepository.findUnitOfMeaning(unit.value.language, unit.value.content)
  if (refreshed) {
    unit.value = refreshed
    emit('update', refreshed)
  }
}

/**
 * Handle creating a new unit and connecting as translation (mutual)
 */
async function handleAddNewTranslation(newUnit: UnitOfMeaning) {
  await typedRepository.addUnitOfMeaning(newUnit)
  await makeTwoUnitsOfMeaningsTranslationsOfEachOther(unit.value, newUnit, typedRepository)
  // Refresh current unit
  const refreshed = await typedRepository.findUnitOfMeaning(unit.value.language, unit.value.content)
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
  const translationUnit = await typedRepository.findUnitOfMeaning(translation.language, translation.content)
  if (translationUnit) {
    const updatedTranslationUnit = {
      ...translationUnit,
      translations: translationUnit.translations.filter(t => 
        !(t.language === unit.value.language && t.content === unit.value.content)
      )
    }
    // Update the translation unit in the repository
    await typedRepository.addUnitOfMeaning(updatedTranslationUnit)
  }
  
  emit('update', unit.value)
}

/**
 * Handle deleting a translation (deletes the unit entirely)
 */
async function handleDeleteTranslation(translation: { language: string; content: string }) {
  const translationUnit = await typedRepository.findUnitOfMeaning(translation.language, translation.content)
  
  if (translationUnit) {
    // Remove current unit from the translation unit's translations before deleting
    const updatedTranslationUnit = {
      ...translationUnit,
      translations: translationUnit.translations.filter(t => 
        !(t.language === unit.value.language && t.content === unit.value.content)
      )
    }
    await typedRepository.addUnitOfMeaning(updatedTranslationUnit)
    
    // Now delete the translation unit
    await typedRepository.deleteUnitOfMeaning(translationUnit)
    
    // Remove from current unit's translations and save to repository
    const updatedCurrentUnit = {
      ...unit.value,
      translations: unit.value.translations.filter(t => !(t.language === translation.language && t.content === translation.content))
    }
    await typedRepository.addUnitOfMeaning(updatedCurrentUnit)
    
    // Update local state
    unit.value = updatedCurrentUnit
    emit('update', updatedCurrentUnit)
  }
}
</script>

<template>
  <FormRenderUnitOfMeaning
    :unit="unit"
    :show-translations="showTranslations"
    @update="handleUpdate"
    @connect-translation="handleConnectTranslation"
    @add-new-translation="handleAddNewTranslation"
    @disconnect-translation="handleDisconnectTranslation"
    @delete-translation="handleDeleteTranslation"
  />
</template>
