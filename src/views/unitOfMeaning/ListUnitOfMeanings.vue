<template>
  <section class="section">
    <div class="container">
      <h1 class="title">All Units Of Meaning</h1>
      <div class="mb-4">
        <div class="buttons has-addons">
          <button class="button" :class="{ 'is-primary': showTarget }" @click="showTarget = true">Show target language</button>
          <button class="button" :class="{ 'is-primary': !showTarget }" @click="showTarget = false">Show native language</button>
        </div>
      </div>
      <div v-if="loading" class="has-text-grey">Loading...</div>
      <div v-else>
        <table class="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Language</th>
              <th>Content</th>
              <th>Word Type</th>
              <th>Pronunciation</th>
              <th>Notes</th>
              <th>Translations</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="uom in filteredUnits" :key="uom.id" @click="goToEdit(uom.id)" style="cursor:pointer">
              <td>{{ getLanguageAbbreviation(uom.languageName, languages) }}</td>
              <td>{{ uom.content }}</td>
              <td>{{ uom.wordType }}</td>
              <td>{{ uom.pronunciation }}</td>
              <td>{{ uom.notes }}</td>
              <td>
                <div v-if="uom.translations && uom.translations.length" style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                  <div class="tag" v-for="tid in uom.translations" :key="tid">
                    {{ getTranslationContent(tid) }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredUnits.length === 0" class="has-text-grey">No units found.</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../../dexie/db'
import { getLanguages } from '../../dexie/useLanguageTable'
import { getLanguageAbbreviation } from '../../utils/languageUtils'
import type { UnitOfMeaning } from '../../types/UnitOfMeaning'
import type { Language } from '../../types/Language'

const units = ref<UnitOfMeaning[]>([])
const languages = ref<Language[]>([])
const loading = ref(true)
const showTarget = ref(true)
const router = useRouter()

async function fetchUnits() {
  loading.value = true
  units.value = await db.unitOfMeanings.toArray()
  languages.value = await getLanguages()
  loading.value = false
}

function goToEdit(id: number | undefined) {
  if (id !== undefined) {
    router.push({ name: 'AddUnitOfMeaning', params: { id } })
  }
}

const filteredUnits = computed(() => {
  return units.value.filter(uom => {
    if (!uom.languageName) return false
    const lang = languages.value.find(l => l.name === uom.languageName)
    return lang ? lang.isTargetLanguage === showTarget.value : false
  })
})

function getTranslationContent(tid: number) {
  const t = units.value.find(u => u.id === tid)
  return t ? t.content : ''
}

onMounted(fetchUnits)
</script>

<style scoped>
tr[style*="cursor:pointer"]:hover {
  background-color: #f5f5f5;
}
</style> 