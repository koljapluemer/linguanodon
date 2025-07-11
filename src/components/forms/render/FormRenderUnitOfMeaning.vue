<template>
  <div class="space-y-6">
    <!-- Language -->
    <FormWidgetLanguageSelect
      :model-value="unit.language"
      :repository="repository"
      label="Language"
      placeholder="Search languages..."
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

    <!-- Translations -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">Translations</span>
        <span class="label-text-alt">Format: language:content (one per line)</span>
      </label>
      <textarea
        :value="unit.translations.map(t => `${t.language}:${t.content}`).join('\n')"
        @input="updateTranslations(($event.target as HTMLTextAreaElement).value)"
        class="textarea textarea-bordered w-full"
        rows="3"
        placeholder="en:hello&#10;es:hola"
      ></textarea>
    </div>

    <!-- See Also -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">See Also</span>
        <span class="label-text-alt">Related units (language:content format)</span>
      </label>
      <textarea
        :value="unit.seeAlso.map(t => `${t.language}:${t.content}`).join('\n')"
        @input="updateSeeAlso(($event.target as HTMLTextAreaElement).value)"
        class="textarea textarea-bordered w-full"
        rows="2"
        placeholder="en:related word&#10;ar:كلمة ذات صلة"
      ></textarea>
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
import FormWidgetLanguageSelect from '@/components/forms/widgets/FormWidgetLanguageSelect.vue'
import type { UnitOfMeaning, Credit } from '@/entities/UnitOfMeaning'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  unit: UnitOfMeaning
  repository: LanguageRepository
}

interface Emits {
  (e: 'update', unit: UnitOfMeaning): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Update a simple field in the unit
 */
function updateField(field: keyof UnitOfMeaning, value: string) {
  const updatedUnit = { ...props.unit, [field]: value }
  emit('update', updatedUnit)
}

/**
 * Update translations from textarea (one per line)
 */
function updateTranslations(value: string) {
  const translationStrings = value.split('\n').filter(line => line.trim() !== '')
  const translations = translationStrings.map(line => {
    const [language, content] = line.split(':', 2)
    return { language: language?.trim() || '', content: content?.trim() || '' }
  }).filter(t => t.language && t.content)
  const updatedUnit = { ...props.unit, translations }
  emit('update', updatedUnit)
}

/**
 * Update see also from textarea (one per line)
 */
function updateSeeAlso(value: string) {
  const seeAlsoStrings = value.split('\n').filter(line => line.trim() !== '')
  const seeAlso = seeAlsoStrings.map(line => {
    const [language, content] = line.split(':', 2)
    return { language: language?.trim() || '', content: content?.trim() || '' }
  }).filter(t => t.language && t.content)
  const updatedUnit = { ...props.unit, seeAlso }
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
</script>
