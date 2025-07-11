<template>
  <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
    <div class="flex-1">
      <div class="font-medium">{{ translation.content }}</div>
      <div class="text-sm text-base-content/60">{{ translation.language }}</div>
    </div>
    
    <div class="flex gap-2">
      <button 
        @click="handleDisconnect"
        class="btn btn-outline btn-sm"
        title="Disconnect translation"
      >
        <Unlink class="w-4 h-4" />
      </button>
      <button 
        @click="handleDelete"
        class="btn btn-error btn-sm"
        title="Delete unit of meaning"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Unlink, Trash2 } from 'lucide-vue-next'
import type { UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'

interface Props {
  translation: UnitOfMeaningIdentification
}

interface Emits {
  (e: 'disconnect', translation: UnitOfMeaningIdentification): void
  (e: 'delete', translation: UnitOfMeaningIdentification): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle disconnect action
 */
function handleDisconnect() {
  emit('disconnect', props.translation)
}

/**
 * Handle delete action
 */
function handleDelete() {
  emit('delete', props.translation)
}
</script>
