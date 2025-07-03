<template>
  <div>
    <table class="table table-zebra w-full mb-4">
      <thead>
        <tr>
          <th>Content</th>
          <th>Language</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="translation in translations" :key="translation.uid">
          <td>{{ translation.content }}</td>
          <td>{{ translation.language }}</td>
          <td>
            <button class="btn btn-xs btn-outline btn-error mr-2" @click="handleRemoveTranslation(translation.uid)">Remove</button>
            <button class="btn btn-xs btn-outline btn-primary">Edit</button>
          </td>
        </tr>
        <tr v-if="!translations.length">
          <td colspan="3" class="text-center text-base-content/50 italic">No translations found</td>
        </tr>
      </tbody>
    </table>
    <div class="flex gap-2 justify-end">
      <button type="button" class="btn btn-sm btn-outline" @click="showConnectModal = true">Add Existing Word or Sentence as Translation</button>
      <button type="button" class="btn btn-sm btn-primary" @click="showAddModal = true">Add new Word or Sentence as Translation</button>
    </div>

    <!-- Connect Existing Translation Modal -->
    <ConnectUnitOfMeaningAsTranslation 
      v-if="showConnectModal"
      :oppositeLanguageGroup="oppositeLanguageGroup"
      @close="showConnectModal = false"
      @confirm="handleConnectTranslation"
    />

    <!-- Add New Translation Modal -->
    <AddUnitOfMeaningAsTranslation 
      v-if="showAddModal"
      :parentUnit="parentUnit"
      @close="showAddModal = false"
      @confirm="handleAddTranslation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ConnectUnitOfMeaningAsTranslation from './ConnectUnitOfMeaningAsTranslation.vue'
import AddUnitOfMeaningAsTranslation from './AddUnitOfMeaningAsTranslation.vue'
import { getUnitOfMeaningById, linkUnitsAsTranslations } from '@/modules/unit-of-meaning/utils/useUnitOfMeaningDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const props = defineProps<{
  parentUnit: UnitOfMeaning
}>()

const emit = defineEmits<{
  addTranslation: [translationUid: string]
  removeTranslation: [translationUid: string]
}>()

const showConnectModal = ref(false)
const showAddModal = ref(false)
const translations = ref<UnitOfMeaning[]>([])

// Determine opposite language group for filtering
const oppositeLanguageGroup = computed(() => {
  if (!props.parentUnit) return 'target'
  // This is a simplified logic - you might want to use the language helpers
  return props.parentUnit.language.startsWith('en') ? 'native' : 'target'
})

/**
 * Fetches translation units from the parent unit's translation UIDs.
 */
async function fetchTranslations() {
  if (!props.parentUnit || !props.parentUnit.translations || !props.parentUnit.translations.length) {
    translations.value = []
    return
  }
  const promises = props.parentUnit.translations.map(uid => getUnitOfMeaningById(uid))
  translations.value = (await Promise.all(promises)).filter(Boolean) as UnitOfMeaning[]
}

/**
 * Handles connecting an existing unit as a translation.
 */
function handleConnectTranslation(translationUid: string) {
  emit('addTranslation', translationUid)
  showConnectModal.value = false
}

/**
 * Handles adding a new unit as a translation.
 */
async function handleAddTranslation(newUnit: UnitOfMeaning) {
  await linkUnitsAsTranslations(props.parentUnit.uid, newUnit.uid)
  await fetchTranslations()
  showAddModal.value = false
}

/**
 * Handles removing a translation from the current unit.
 */
function handleRemoveTranslation(translationUid: string) {
  emit('removeTranslation', translationUid)
}

onMounted(fetchTranslations)
</script>

<style scoped>
</style>
