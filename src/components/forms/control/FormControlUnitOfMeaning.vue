<template>
  <FormRenderUnitOfMeaning
    :unit="unit"
    :language-repository="languageRepository"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createEmptyCard } from 'ts-fsrs'
import FormRenderUnitOfMeaning from '@/components/forms/render/FormRenderUnitOfMeaning.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  initialUnit?: Partial<UnitOfMeaning>
  repository: UnitOfMeaningRepository
  languageRepository: LanguageRepository
}

interface Emits {
  (e: 'update', unit: UnitOfMeaning): void
}

const props = defineProps<Props>()
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
</script>
