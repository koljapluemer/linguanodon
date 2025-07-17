<template>
  <div class="space-y-4">
    <!-- See Also List -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Related Words or Sentences</span>
      </label>
      <ListRenderSeeAlso
        :see-also="seeAlso"
        @disconnect="handleDisconnect"
      />
    </div>
    
    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button 
        @click="showConnectForm = true"
        class="btn btn-outline btn-sm"
        :disabled="showConnectForm"
      >
        <Link class="w-4 h-4 mr-2" />
        Connect Related Word or Sentence
      </button>
    </div>

    <!-- Connect Existing Unit Form -->
    <div v-if="showConnectForm">
      <FormControlConnectUnitOfMeaningAsSeeAlso
        :current-unit="currentUnit"
        @select="handleConnectSelect"
        @cancel="showConnectForm = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Link } from 'lucide-vue-next'
import ListRenderSeeAlso from '@/components/lists/render/ListRenderSeeAlso.vue'
import FormControlConnectUnitOfMeaningAsSeeAlso from '@/components/forms/control/FormControlConnectUnitOfMeaningAsSeeAlso.vue'
import type { UnitOfMeaning, UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'

interface Props {
  seeAlso: UnitOfMeaningIdentification[]
  currentUnit: UnitOfMeaning
}

interface Emits {
  (e: 'disconnect', item: UnitOfMeaningIdentification): void
  (e: 'connect-see-also', unit: UnitOfMeaning): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Form visibility state
const showConnectForm = ref(false)

/**
 * Handle disconnect from list
 */
function handleDisconnect(item: UnitOfMeaningIdentification) {
  emit('disconnect', item)
}

/**
 * Handle connect seeAlso selection
 */
function handleConnectSelect(unit: UnitOfMeaning) {
  emit('connect-see-also', unit)
  showConnectForm.value = false
}
</script>
