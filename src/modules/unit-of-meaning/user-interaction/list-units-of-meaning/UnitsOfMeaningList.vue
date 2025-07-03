<template>
  <div class="p-6 max-w-3xl mx-auto">
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
                v-for="tid in getExistingTranslationUids(unit.translations)"
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
import { ref, computed, watch } from 'vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const props = defineProps<{
  units: UnitOfMeaning[]
  targetLangs: string[]
  nativeLangs: string[]
  initiallyFilterBy: 'target' | 'native'
}>()

const showTarget = ref(props.initiallyFilterBy === 'target')

watch(() => props.initiallyFilterBy, (val) => {
  showTarget.value = val === 'target'
})

const filteredUnits = computed(() => {
  const langs = showTarget.value ? props.targetLangs : props.nativeLangs
  return props.units.filter(u => langs.includes(u.language))
})

/**
 * Returns the content of a UnitOfMeaning by UID, or an empty string if not found.
 */
function getTranslationContent(uid: string): string {
  const translation = props.units.find(u => u.uid === uid)
  return translation ? translation.content : ''
}

/**
 * Returns only translation UIDs that exist in the units array.
 */
function getExistingTranslationUids(uids: string[]): string[] {
  return uids.filter(uid => !!getTranslationContent(uid))
}
</script>
