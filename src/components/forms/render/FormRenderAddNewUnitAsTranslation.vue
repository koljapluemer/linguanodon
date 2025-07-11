<template>
  <div class="card bg-base-200 p-4">
    <h4 class="font-bold text-lg mb-4">Add New Word or Sentence as Translation</h4>
    
    <div class="space-y-4">
      <!-- Language -->
      <FormWidgetUserLanguageSelect
        :model-value="newUnit.language"
        :repository="languageRepository"
        language-type="both"
        label="Language"
        placeholder="Select a language..."
        @update:model-value="updateNewUnitField('language', $event)"
      />

      <!-- Content -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Content</span>
        </label>
        <textarea
          :value="newUnit.content"
          @input="updateNewUnitField('content', ($event.target as HTMLTextAreaElement).value)"
          class="textarea textarea-bordered w-full"
          rows="3"
          placeholder="Enter the word or sentence"
        ></textarea>
      </div>

      <!-- Notes -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Notes</span>
        </label>
        <textarea
          :value="newUnit.notes"
          @input="updateNewUnitField('notes', ($event.target as HTMLTextAreaElement).value)"
          class="textarea textarea-bordered w-full"
          rows="2"
          placeholder="Optional notes about this unit"
        ></textarea>
      </div>
    </div>
    
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
import FormWidgetUserLanguageSelect from '@/components/forms/widgets/FormWidgetUserLanguageSelect.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  languageRepository: LanguageRepository
}

interface Emits {
  (e: 'create', unit: UnitOfMeaning): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Initialize new unit with defaults
 */
const newUnit = ref<UnitOfMeaning>({
  language: 'en',
  content: '',
  notes: '',
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
 * Update a field in the new unit
 */
function updateNewUnitField(field: keyof UnitOfMeaning, value: string) {
  newUnit.value = { ...newUnit.value, [field]: value }
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