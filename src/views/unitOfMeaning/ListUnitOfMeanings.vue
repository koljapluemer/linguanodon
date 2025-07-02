<template>
  <section class="section">
    <div class="container">
      <div class="mb-4">
        <router-link :to="{ name: 'AddUnitOfMeaning' }" class="button is-link">Add Word or Sentence</router-link>
      </div>

      <h1 class="title">All Words & Sentences</h1>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="uom in filteredUnits" :key="uom.id">
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
              <td>
                <div class="buttons are-small">
                  <router-link 
                    :to="{ name: 'AddUnitOfMeaning', params: { id: uom.id } }" 
                    class="button is-info is-light"
                    title="Edit"
                  >
                    <Edit class="icon is-small" />
                  </router-link>
                  <button 
                    class="button is-danger is-light" 
                    @click="handleDelete(uom.id)"
                    title="Delete"
                  >
                    <Trash2 class="icon is-small" />
                  </button>
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
import { Edit, Trash2 } from 'lucide-vue-next'
import { db } from '../../dexie/db'
import { getLanguageAbbreviation } from '../../utils/languageUtils'
import type { UnitOfMeaning } from '@/types/persistent-general-data/UnitOfMeaning'
import type { Language } from '@/types/persistent-general-data/Language'

const units = ref<UnitOfMeaning[]>([])
const languages = ref<Language[]>([])
const loading = ref(true)
const showTarget = ref(true)

async function fetchUnits() {
  loading.value = true
  units.value = await db.unitOfMeanings.toArray()
  languages.value = await getLanguages()
  loading.value = false
}

function handleDelete(id: number | undefined) {
  // TODO: Implement delete functionality
  console.log('Delete unit with id:', id)
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
.icon {
  width: 1rem;
  height: 1rem;
}
</style> 