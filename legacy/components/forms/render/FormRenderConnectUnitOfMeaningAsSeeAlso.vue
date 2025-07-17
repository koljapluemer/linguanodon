<template>
  <div class="card bg-base-200 p-4">
    <h4 class="font-bold text-lg mb-4">Connect Related Word or Sentence</h4>
    
    <!-- Lazy Loading Units List -->
    <ListRenderUnitsOfMeaningLazy
      :current-unit="currentUnit"
      :show-language-filter="true"
      :show-search="true"
      :page-size="20"
      :max-items="500"
      @select="handleSelectUnit"
    />
    
    <!-- Actions -->
    <div class="flex gap-2 mt-4">
      <button @click="handleCancel" class="btn btn-outline btn-sm">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ListRenderUnitsOfMeaningLazy from '@/components/lists/render/ListRenderUnitsOfMeaningLazy.vue'
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
 * Handle unit selection from the lazy list
 */
function handleSelectUnit(unit: UnitOfMeaning) {
  emit('select', unit)
}

/**
 * Handle cancel
 */
function handleCancel() {
  emit('cancel')
}
</script> 