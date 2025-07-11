<template>
  <FormRenderConnectUnitOfMeaningAsTranslation
    :current-unit="currentUnit"
    :repository="repository"
    :language-repository="languageRepository"
    @select="handleSelect"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import FormRenderConnectUnitOfMeaningAsTranslation from '@/components/forms/render/FormRenderConnectUnitOfMeaningAsTranslation.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  currentUnit: UnitOfMeaning
  repository: UnitOfMeaningRepository
  languageRepository: LanguageRepository
}

interface Emits {
  (e: 'select', unit: UnitOfMeaning): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle unit selection
 */
function handleSelect(unit: UnitOfMeaning) {
  emit('select', unit)
}

/**
 * Handle cancel
 */
function handleCancel() {
  emit('cancel')
}
</script>
