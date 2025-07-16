<template>
  <div class="card bg-base-200 p-4">
    <h4 class="font-bold text-lg mb-4">Add New Word or Sentence as Translation</h4>
    
    <FormRenderUnitOfMeaning
      :unit="newUnit"
      :show-translations="false"
      @update="handleUpdate"
    />
    
    <!-- Actions -->
    <div class="flex gap-2 mt-4">
      <button @click="handleCancel" class="btn btn-outline btn-sm">Cancel</button>
      <button 
        @click="handleCreate"
        class="btn btn-primary btn-sm"
        :disabled="!isValid"
      >
        Create and Connect
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createEmptyCard } from 'ts-fsrs'
import FormRenderUnitOfMeaning from '@/components/forms/render/FormRenderUnitOfMeaning.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

interface Emits {
  (e: 'create', unit: UnitOfMeaning): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

/**
 * Initialize new unit with defaults
 */
const newUnit = ref<UnitOfMeaning>({
  language: 'en',
  content: '',
  notes: [],
  translations: [],
  seeAlso: [],
  credits: [],
  card: createEmptyCard()
})

/**
 * Check if the form is valid
 */
const isValid = computed(() => {
  return newUnit.value.language.trim() !== '' && newUnit.value.content.trim() !== ''
})

/**
 * Handle updates from the form render
 */
function handleUpdate(unit: UnitOfMeaning) {
  newUnit.value = unit
}

/**
 * Handle create action
 */
function handleCreate() {
  if (isValid.value) {
    emit('create', { ...newUnit.value })
  }
}

/**
 * Handle cancel
 */
function handleCancel() {
  emit('cancel')
}
</script> 