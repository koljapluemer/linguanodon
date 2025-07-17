<template>
  <div class="space-y-4">
    <!-- Translations List -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Translations</span>
      </label>
      <ListRenderTranslations
        :translations="translations"
        @disconnect="handleDisconnect"
        @delete="handleDelete"
      />
    </div>
    
    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button 
        @click="showConnectForm = true"
        class="btn btn-outline btn-sm"
        :disabled="showConnectForm || showAddNewForm"
      >
        <Link class="w-4 h-4 mr-2" />
        Connect Translation
      </button>
      <button 
        @click="showAddNewForm = true"
        class="btn btn-primary btn-sm"
        :disabled="showConnectForm || showAddNewForm"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add New Word or Sentence as Translation
      </button>
    </div>

    <!-- Connect Existing Translation Form -->
    <div v-if="showConnectForm">
      <FormControlConnectUnitOfMeaningAsTranslation
        :current-unit="currentUnit"
        @select="handleConnectSelect"
        @cancel="showConnectForm = false"
      />
    </div>

    <!-- Add New Translation Form -->
    <div v-if="showAddNewForm">
      <FormControlAddNewUnitAsTranslation
        :current-unit="currentUnit"
        @create="handleAddNewCreate"
        @cancel="showAddNewForm = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Link, Plus } from 'lucide-vue-next'
import ListRenderTranslations from '@/components/lists/render/ListRenderTranslations.vue'
import FormControlConnectUnitOfMeaningAsTranslation from '@/components/forms/control/FormControlConnectUnitOfMeaningAsTranslation.vue'
import FormControlAddNewUnitAsTranslation from '@/components/forms/control/FormControlAddNewUnitAsTranslation.vue'
import type { UnitOfMeaning, UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'

interface Props {
  translations: UnitOfMeaningIdentification[]
  currentUnit: UnitOfMeaning
}

interface Emits {
  (e: 'disconnect', translation: UnitOfMeaningIdentification): void
  (e: 'delete', translation: UnitOfMeaningIdentification): void
  (e: 'connect-translation', unit: UnitOfMeaning): void
  (e: 'add-new-translation', unit: UnitOfMeaning): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Form visibility state
const showConnectForm = ref(false)
const showAddNewForm = ref(false)

/**
 * Handle disconnect from list
 */
function handleDisconnect(translation: UnitOfMeaningIdentification) {
  emit('disconnect', translation)
}

/**
 * Handle delete from list
 */
function handleDelete(translation: UnitOfMeaningIdentification) {
  emit('delete', translation)
}

/**
 * Handle connect translation selection
 */
function handleConnectSelect(unit: UnitOfMeaning) {
  emit('connect-translation', unit)
  showConnectForm.value = false
}

/**
 * Handle add new translation creation
 */
function handleAddNewCreate(unit: UnitOfMeaning) {
  emit('add-new-translation', unit)
  showAddNewForm.value = false
}
</script>
