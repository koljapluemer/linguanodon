<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Units of Meaning</h1>
    <div class="mb-4 flex items-center gap-4">
      <div class="btn-group">
        <button
          class="btn btn-sm"
          :class="showTarget ? 'btn-primary' : 'btn-outline'"
          @click="showTarget = true"
        >
          by target language(s)
        </button>
        <button
          class="btn btn-sm"
          :class="!showTarget ? 'btn-primary' : 'btn-outline'"
          @click="showTarget = false"
        >
          by native language(s)
        </button>
      </div>
    </div>
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Content</th>
          <th>Translations</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in filteredUnits" :key="unit.uid">
          <td class="text-lg font-semibold">{{ unit.content }}</td>
          <td>
            <template v-if="unit.translations && unit.translations.length">
              <span
                v-for="tid in unit.translations"
                :key="tid"
                class="badge badge-outline mr-1"
              >
                {{ getTranslationContent(tid) }}
              </span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllUnitsOfMeaning } from '@/modules/unit-of-meaning/utils/useUnitOfMeaningDB'
import { useUserSettings } from '@/modules/user-settings/utils/useUserSettingsDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const units = ref<UnitOfMeaning[]>([])
const showTarget = ref(true)

const { userSettings } = useUserSettings()

/**
 * Loads all units of meaning from the DB for display.
 */
async function loadUnits() {
  units.value = await getAllUnitsOfMeaning()
}

onMounted(loadUnits)

const targetLangs = computed(() => [
  ...(userSettings.value.primaryTargetLanguages || []),
  ...(userSettings.value.secondaryTargetLanguages || [])
])
const nativeLangs = computed(() => [
  ...(userSettings.value.primaryNativeLanguages || []),
  ...(userSettings.value.secondaryNativeLanguages || [])
])

const filteredUnits = computed(() => {
  const langs = showTarget.value ? targetLangs.value : nativeLangs.value
  return units.value.filter(u => langs.includes(u.language))
})

/**
 * Returns the content of a UnitOfMeaning by UID, or an ellipsis if not found.
 */
function getTranslationContent(uid: string): string {
  const translation = units.value.find(u => u.uid === uid)
  return translation ? translation.content : '…'
}
</script>
