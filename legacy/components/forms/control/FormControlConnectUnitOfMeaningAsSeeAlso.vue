<template>
  <FormRenderConnectUnitOfMeaningAsSeeAlso
    :current-unit="currentUnit"
    @select="handleSelect"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import FormRenderConnectUnitOfMeaningAsSeeAlso from '@/components/forms/render/FormRenderConnectUnitOfMeaningAsSeeAlso.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

interface Props {
  currentUnit: UnitOfMeaning
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