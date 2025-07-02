<template>
  <div class="manage-languages">
    <div class="columns">
      <div class="column">
        <div class="box">
          <h2 class="title is-5">Native Languages</h2>
          <ul>
            <li v-for="(lang, idx) in nativeLanguages" :key="lang.name" class="mb-2">
              <div class="is-flex is-align-items-center">
                <template v-if="editName === lang.name">
                  <div class="field is-grouped is-grouped-multiline mr-2">
                    <div class="control">
                      <input class="input is-small" v-model="editForm.name" placeholder="Name" :disabled="lang.requiredByApp" />
                    </div>
                    <div class="control">
                      <input class="input is-small" v-model="editForm.abbreviation" placeholder="Abbreviation" />
                    </div>
                  </div>
                  <div class="buttons are-small">
                    <button class="button is-primary is-light" @click="saveEdit(lang)">Save</button>
                    <button class="button is-light" @click="cancelEdit">Cancel</button>
                  </div>
                </template>
                <template v-else>
                  <span class="mr-3">{{ lang.name }} <span class="has-text-grey">({{ lang.abbreviation }})</span></span>
                  <div class="buttons are-small">
                    <button class="button is-light" @click="move(lang, 'up')" :disabled="idx === 0">↑</button>
                    <button class="button is-light" @click="move(lang, 'down')" :disabled="idx === nativeLanguages.length - 1">↓</button>
                    <button v-if="!lang.requiredByApp" class="button is-info is-light" @click="startEdit(lang)">Edit</button>
                    <button v-if="!lang.requiredByApp" class="button is-danger is-light" @click="remove(lang)">Delete</button>
                  </div>
                </template>
              </div>
            </li>
          </ul>
          <form class="mt-4" @submit.prevent="addNative">
            <div class="field is-grouped">
              <div class="control is-expanded">
                <input class="input is-small" v-model="addFormNative.name" placeholder="Name" />
              </div>
              <div class="control">
                <input class="input is-small" v-model="addFormNative.abbreviation" placeholder="Abbreviation" />
              </div>
              <div class="control">
                <button class="button is-primary is-small" type="submit">Add</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="column">
        <div class="box">
          <h2 class="title is-5">Target Languages</h2>
          <ul>
            <li v-for="(lang, idx) in targetLanguages" :key="lang.name" class="mb-2">
              <div class="is-flex is-align-items-center">
                <template v-if="editName === lang.name">
                  <div class="field is-grouped is-grouped-multiline mr-2">
                    <div class="control">
                      <input class="input is-small" v-model="editForm.name" placeholder="Name" :disabled="lang.requiredByApp" />
                    </div>
                    <div class="control">
                      <input class="input is-small" v-model="editForm.abbreviation" placeholder="Abbreviation" />
                    </div>
                  </div>
                  <div class="buttons are-small">
                    <button class="button is-primary is-light" @click="saveEdit(lang)">Save</button>
                    <button class="button is-light" @click="cancelEdit">Cancel</button>
                  </div>
                </template>
                <template v-else>
                  <span class="mr-3">{{ lang.name }} <span class="has-text-grey">({{ lang.abbreviation }})</span></span>
                  <div class="buttons are-small">
                    <button class="button is-light" @click="move(lang, 'up')" :disabled="idx === 0">↑</button>
                    <button class="button is-light" @click="move(lang, 'down')" :disabled="idx === targetLanguages.length - 1">↓</button>
                    <button v-if="!lang.requiredByApp" class="button is-info is-light" @click="startEdit(lang)">Edit</button>
                    <button v-if="!lang.requiredByApp" class="button is-danger is-light" @click="remove(lang)">Delete</button>
                  </div>
                </template>
              </div>
            </li>
          </ul>
          <form class="mt-4" @submit.prevent="addTarget">
            <div class="field is-grouped">
              <div class="control is-expanded">
                <input class="input is-small" v-model="addFormTarget.name" placeholder="Name" />
              </div>
              <div class="control">
                <input class="input is-small" v-model="addFormTarget.abbreviation" placeholder="Abbreviation" />
              </div>
              <div class="control">
                <button class="button is-primary is-small" type="submit">Add</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getLanguages, addLanguage, updateLanguage, deleteLanguage, moveLanguage, ensureDefaultLanguages } from '../../dexie/useLanguageTable'
import type { Language } from '@/types/persistent-general-data/Language'
import type { UnitOfMeaning } from '@/types/persistent-general-data/UnitOfMeaning'

const languages = ref<Language[]>([])
const editName = ref<string | null>(null)
const editForm = ref({ name: '', abbreviation: '' })
const addFormNative = ref({ name: '', abbreviation: '' })
const addFormTarget = ref({ name: '', abbreviation: '' })

const load = async () => {
  await ensureDefaultLanguages()
  languages.value = await getLanguages()
}

onMounted(load)

const nativeLanguages = computed(() => languages.value.filter(l => !l.isTargetLanguage).sort((a, b) => a.position - b.position))
const targetLanguages = computed(() => languages.value.filter(l => l.isTargetLanguage).sort((a, b) => a.position - b.position))

const addNative = async () => {
  if (!addFormNative.value.name.trim()) return
  if (languages.value.some(l => l.name === addFormNative.value.name.trim())) return
  await addLanguage({
    name: addFormNative.value.name.trim(),
    abbreviation: addFormNative.value.abbreviation.trim(),
  }, false)
  addFormNative.value.name = ''
  addFormNative.value.abbreviation = ''
  await load()
}

const addTarget = async () => {
  if (!addFormTarget.value.name.trim()) return
  if (languages.value.some(l => l.name === addFormTarget.value.name.trim())) return
  await addLanguage({
    name: addFormTarget.value.name.trim(),
    abbreviation: addFormTarget.value.abbreviation.trim(),
  }, true)
  addFormTarget.value.name = ''
  addFormTarget.value.abbreviation = ''
  await load()
}

const startEdit = (lang: Language) => {
  editName.value = lang.name
  editForm.value = { name: lang.name, abbreviation: lang.abbreviation }
}

const saveEdit = async (lang: Language) => {
  if (!editForm.value.name.trim()) return
  if (editForm.value.name !== lang.name && languages.value.some(l => l.name === editForm.value.name.trim())) return
  await updateLanguage(lang.name, {
    abbreviation: editForm.value.abbreviation.trim(),
  })
  editName.value = null
  await load()
}

const cancelEdit = () => {
  editName.value = null
}

const remove = async (lang: Language) => {
  await deleteLanguage(lang.name)
  await load()
}

const move = async (lang: Language, dir: 'up'|'down') => {
  await moveLanguage(lang.name, dir)
  await load()
}
</script>

<!-- No custom CSS needed, Bulma handles layout and style -->
