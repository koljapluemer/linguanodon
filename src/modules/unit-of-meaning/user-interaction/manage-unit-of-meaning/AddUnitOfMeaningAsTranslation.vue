<template>
  <dialog open class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Add New Translation</h3>
      <UnitOfMeaningForm :unit="newUnit" :showTranslations="false" />
      <div class="modal-action mt-4">
        <button class="btn btn-outline" @click="handleCancel">Cancel</button>
        <button class="btn btn-primary" @click="handleSave" :disabled="!isValid">Save</button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UnitOfMeaningForm from './UnitOfMeaningForm.vue'
import { addUnitOfMeaning } from '@/modules/unit-of-meaning/utils/useUnitOfMeaningDB'
import { useUserSettings } from '@/modules/user-settings/utils/useUserSettingsDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const props = defineProps<{
  parentUnit?: UnitOfMeaning
}>()

const emit = defineEmits<{
  close: []
  confirm: [unit: UnitOfMeaning]
}>()

const { userSettings } = useUserSettings()

// Create a new unit with auto-selected language
const newUnit = ref<UnitOfMeaning>({
  uid: `new-${Date.now()}`, // Temporary UID
  language: '', // Will be set in onMounted
  content: '',
  linguType: '',
  userCreated: true,
  context: ''
})

// Auto-select the first language from the opposite group
onMounted(() => {
  if (props.parentUnit) {
    // Simple logic: if parent is English, select first native language, otherwise select first target language
    const isEnglish = props.parentUnit.language.startsWith('en')
    const targetGroup = isEnglish ? userSettings.value.primaryNativeLanguages : userSettings.value.primaryTargetLanguages
    if (targetGroup.length > 0) {
      newUnit.value.language = targetGroup[0]
    }
  }
})

// Form validation
const isValid = computed(() => {
  return newUnit.value.content.trim() !== '' && 
         newUnit.value.linguType.trim() !== '' &&
         newUnit.value.language.trim() !== ''
})

/**
 * Handles saving the new unit.
 */
async function handleSave() {
  if (!isValid.value) return
  
  try {
    // Convert reactive Proxy to plain object for Dexie
    const plainUnit = JSON.parse(JSON.stringify(newUnit.value))
    // Generate a proper UID and save to DB
    const savedUid = await addUnitOfMeaning(plainUnit)
    // Update the unit with the real UID
    newUnit.value.uid = savedUid
    emit('confirm', newUnit.value)
  } catch (error) {
    console.error('Failed to save new unit:', error)
    // You might want to show an error message to the user
  }
}

/**
 * Handles canceling the modal.
 */
function handleCancel() {
  emit('close')
}
</script>

<style scoped>
</style>
