<template>
  <div class="space-y-6">
    <!-- Language -->
    <FormWidgetUserLanguageSelect
      :model-value="unit.language"
      :repository="languageRepository"
      language-type="both"
      label="Language"
      placeholder="Select a language..."
      @update:model-value="updateField('language', $event)"
    />

    <!-- Content -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Content</span>
      </label>
      <textarea
        :value="unit.content"
        @input="updateField('content', ($event.target as HTMLTextAreaElement).value)"
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
        :value="unit.notes"
        @input="updateField('notes', ($event.target as HTMLTextAreaElement).value)"
        class="textarea textarea-bordered w-full"
        rows="2"
        placeholder="Optional notes about this unit"
      ></textarea>
    </div>

    <!-- Translations (only show if showTranslations is true) -->
    <div v-if="showTranslations" class="form-control">
      <FormRenderManageTranslations
        :translations="unit.translations"
        :current-unit="unit"
        :repository="repository"
        :language-repository="languageRepository"
        @disconnect="handleDisconnectTranslation"
        @delete="handleDeleteTranslation"
        @connect-translation="handleConnectTranslation"
        @add-new-translation="handleAddNewTranslation"
      />
    </div>

    <!-- See Also -->
    <div class="form-control">
      <FormRenderManageSeeAlso
        :see-also="unit.seeAlso"
        :current-unit="unit"
        @disconnect="handleDisconnectSeeAlso"
        @connect-see-also="handleConnectSeeAlso"
      />
    </div>

    <!-- Credits -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Credits</span>
      </label>
      <div class="space-y-4">
        <div 
          v-for="(credit, index) in unit.credits" 
          :key="index"
          class="card bg-base-200 p-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">License</span>
              </label>
              <input
                type="text"
                :value="credit.license"
                @input="updateCreditField(index, 'license', ($event.target as HTMLInputElement).value)"
                class="input input-bordered w-full"
                placeholder="e.g., CC-BY-NC-4.0"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Owner</span>
              </label>
              <input
                type="text"
                :value="credit.owner || ''"
                @input="updateCreditField(index, 'owner', ($event.target as HTMLInputElement).value)"
                class="input input-bordered w-full"
                placeholder="Owner name"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Owner Link</span>
              </label>
              <input
                type="url"
                :value="credit.ownerLink || ''"
                @input="updateCreditField(index, 'ownerLink', ($event.target as HTMLInputElement).value)"
                class="input input-bordered w-full"
                placeholder="https://..."
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Source</span>
              </label>
              <input
                type="text"
                :value="credit.source || ''"
                @input="updateCreditField(index, 'source', ($event.target as HTMLInputElement).value)"
                class="input input-bordered w-full"
                placeholder="Source name"
              />
            </div>
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text">Source Link</span>
              </label>
              <input
                type="url"
                :value="credit.sourceLink || ''"
                @input="updateCreditField(index, 'sourceLink', ($event.target as HTMLInputElement).value)"
                class="input input-bordered w-full"
                placeholder="https://..."
              />
            </div>
          </div>
          <div class="card-actions justify-end mt-4">
            <button 
              @click="removeCredit(index)"
              class="btn btn-error btn-sm"
            >
              Remove Credit
            </button>
          </div>
        </div>
        <button 
          @click="addCredit"
          class="btn btn-outline btn-sm"
        >
          Add Credit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import FormWidgetUserLanguageSelect from '@/components/forms/widgets/FormWidgetUserLanguageSelect.vue'
import FormRenderManageTranslations from '@/components/forms/render/FormRenderManageTranslations.vue'
import FormRenderManageSeeAlso from '@/components/forms/render/FormRenderManageSeeAlso.vue'
import type { UnitOfMeaning, Credit, UnitOfMeaningIdentification } from '@/entities/UnitOfMeaning'
import { languageRepositoryKey, unitOfMeaningRepositoryKey } from '@/types/injectionKeys'

interface Props {
  unit: UnitOfMeaning
  showTranslations?: boolean
}

interface Emits {
  (e: 'update', unit: UnitOfMeaning): void
  (e: 'disconnect-translation', translation: UnitOfMeaningIdentification): void
  (e: 'delete-translation', translation: UnitOfMeaningIdentification): void
  (e: 'connect-translation', unit: UnitOfMeaning): void
  (e: 'add-new-translation', unit: UnitOfMeaning): void
  (e: 'disconnect-see-also', item: UnitOfMeaningIdentification): void
  (e: 'connect-see-also', unit: UnitOfMeaning): void
}

const props = withDefaults(defineProps<Props>(), {
  showTranslations: true
})

const emit = defineEmits<Emits>()

// Inject repositories using proper injection keys
const languageRepository = inject(languageRepositoryKey)
const repository = inject(unitOfMeaningRepositoryKey)

if (!languageRepository) {
  throw new Error('LanguageRepository not provided in parent context')
}

if (!repository) {
  throw new Error('UnitOfMeaningRepository not provided in parent context')
}

/**
 * Update a simple field in the unit
 */
function updateField(field: keyof UnitOfMeaning, value: string) {
  const updatedUnit = { ...props.unit, [field]: value }
  emit('update', updatedUnit)
}

/**
 * Update a field in a specific credit
 */
function updateCreditField(creditIndex: number, field: keyof Credit, value: string) {
  const updatedCredits = [...props.unit.credits]
  updatedCredits[creditIndex] = { ...updatedCredits[creditIndex], [field]: value }
  const updatedUnit = { ...props.unit, credits: updatedCredits }
  emit('update', updatedUnit)
}

/**
 * Add a new credit
 */
function addCredit() {
  const newCredit: Credit = {
    license: '',
    owner: '',
    ownerLink: '',
    source: '',
    sourceLink: ''
  }
  const updatedCredits = [...props.unit.credits, newCredit]
  const updatedUnit = { ...props.unit, credits: updatedCredits }
  emit('update', updatedUnit)
}

/**
 * Remove a credit
 */
function removeCredit(creditIndex: number) {
  const updatedCredits = props.unit.credits.filter((_: Credit, index: number) => index !== creditIndex)
  const updatedUnit = { ...props.unit, credits: updatedCredits }
  emit('update', updatedUnit)
}

/**
 * Handle disconnect translation from manage translations component
 */
function handleDisconnectTranslation(translation: UnitOfMeaningIdentification) {
  emit('disconnect-translation', translation)
}

/**
 * Handle delete translation from manage translations component
 */
function handleDeleteTranslation(translation: UnitOfMeaningIdentification) {
  emit('delete-translation', translation)
}

/**
 * Handle connect translation from manage translations component
 */
function handleConnectTranslation(unit: UnitOfMeaning) {
  emit('connect-translation', unit)
}

/**
 * Handle add new translation from manage translations component
 */
function handleAddNewTranslation(unit: UnitOfMeaning) {
  emit('add-new-translation', unit)
}

/**
 * Handle disconnect see also from manage see also component
 */
function handleDisconnectSeeAlso(item: UnitOfMeaningIdentification) {
  emit('disconnect-see-also', item)
}

/**
 * Handle connect see also from manage see also component
 */
function handleConnectSeeAlso(unit: UnitOfMeaning) {
  emit('connect-see-also', unit)
}
</script>
