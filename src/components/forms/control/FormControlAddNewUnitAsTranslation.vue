<template>
  <FormRenderAddNewUnitAsTranslation
    :language-repository="languageRepository"
    @create="handleCreate"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import FormRenderAddNewUnitAsTranslation from '@/components/forms/render/FormRenderAddNewUnitAsTranslation.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  languageRepository: LanguageRepository
}

interface Emits {
  (e: 'create', unit: UnitOfMeaning): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Emit create event with the new unit
 */
function handleCreate(unit: UnitOfMeaning) {
  emit('create', unit)
}

/**
 * Emit cancel event
 */
function handleCancel() {
  emit('cancel')
}
</script> 