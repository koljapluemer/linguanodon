<template>
  <div class="space-y-2">
    <div v-if="seeAlso.length === 0" class="text-center py-4 text-base-content/60">
      <p>No related units added yet.</p>
      <p class="text-sm">Connect related words or sentences to build associations.</p>
    </div>
    
    <div v-else class="space-y-2">
      <ListWidgetSeeAlsoElement
        v-for="item in seeAlso" 
        :key="`${item.language}-${item.content}`"
        :see-also-item="item"
        @disconnect="handleDisconnect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ListWidgetSeeAlsoElement from '@/components/lists/widgets/ListWidgetSeeAlsoElement.vue'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'

interface Props {
  seeAlso: UnitOfMeaningIdentification[]
}

interface Emits {
  (e: 'disconnect', item: UnitOfMeaningIdentification): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle disconnecting a seeAlso item
 */
function handleDisconnect(item: UnitOfMeaningIdentification) {
  emit('disconnect', item)
}
</script>
