<template>
  <UnitsOfMeaningList
    :units="units"
    :targetLangs="targetLangs"
    :nativeLangs="nativeLangs"
    :initiallyFilterBy="'target'"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAllUnitsOfMeaning } from '@/modules/unit-of-meaning/utils/useUnitOfMeaningDB'
import { useUserSettings } from '@/modules/user-settings/utils/useUserSettingsDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'
import UnitsOfMeaningList from './UnitsOfMeaningList.vue'

const units = ref<UnitOfMeaning[]>([])
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
</script>
