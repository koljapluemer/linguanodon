<template>
  <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
    <div class="flex-1">
      <div class="font-medium">{{ seeAlsoItem.content }}</div>
      <div class="text-sm text-base-content/60">{{ seeAlsoItem.language }}</div>
    </div>
    
    <div class="flex gap-2">
      <button 
        @click="handleDisconnect"
        class="btn btn-outline btn-sm"
        title="Disconnect related unit"
      >
        <Unlink class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Unlink } from 'lucide-vue-next'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'

interface Props {
  seeAlsoItem: UnitOfMeaningIdentification
}

interface Emits {
  (e: 'disconnect', seeAlsoItem: UnitOfMeaningIdentification): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle disconnect action
 */
function handleDisconnect() {
  emit('disconnect', props.seeAlsoItem)
}
</script>
