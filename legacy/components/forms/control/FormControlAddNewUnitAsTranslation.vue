<template>
  <FormRenderAddNewUnitAsTranslation
    @create="handleCreate"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import FormRenderAddNewUnitAsTranslation from '@/components/forms/render/FormRenderAddNewUnitAsTranslation.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

interface Props {
  currentUnit: UnitOfMeaning
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