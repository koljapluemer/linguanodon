<template>
  <div class="space-y-2">
    <div 
      v-for="translation in translations" 
      :key="`${translation.language}-${translation.content}`"
    >
      <ListWidgetTranslation
        :translation="translation"
        @disconnect="handleDisconnect"
        @delete="handleDelete"
      />
    </div>
    
    <div v-if="translations.length === 0" class="text-center py-4 text-base-content/60">
      <p>No translations yet.</p>
      <p class="text-sm">Add translations to connect this unit with other units of meaning.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ListWidgetTranslation from '@/components/lists/widgets/ListWidgetTranslation.vue'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'

interface Props {
  translations: UnitOfMeaningIdentification[]
}

interface Emits {
  (e: 'disconnect', translation: UnitOfMeaningIdentification): void
  (e: 'delete', translation: UnitOfMeaningIdentification): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle disconnect from child widget
 */
function handleDisconnect(translation: UnitOfMeaningIdentification) {
  emit('disconnect', translation)
}

/**
 * Handle delete from child widget
 */
function handleDelete(translation: UnitOfMeaningIdentification) {
  emit('delete', translation)
}
</script>
