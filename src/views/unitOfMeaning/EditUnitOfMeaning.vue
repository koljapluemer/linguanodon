<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Add Unit Of Meaning</h1>
      <form @submit.prevent="onSubmit" class="box">
        <div class="field">
          <label class="label">Language Code</label>
          <div class="control">
            <input v-model="form.languageCode" class="input" required placeholder="e.g. en, ar" />
          </div>
        </div>
        <div class="field">
          <label class="label">Content</label>
          <div class="control">
            <input v-model="form.content" class="input" required placeholder="Word or phrase" />
          </div>
        </div>
        <div class="field">
          <label class="label">Word Type</label>
          <div class="control">
            <input v-model="form.wordType" class="input" required placeholder="e.g. noun, verb" />
          </div>
        </div>
        <div class="field">
          <label class="label">Pronunciation <span class="has-text-grey-light">(optional)</span></label>
          <div class="control">
            <input v-model="form.pronunciation" class="input" placeholder="Pronunciation" />
          </div>
        </div>
        <div class="field">
          <label class="label">Notes <span class="has-text-grey-light">(optional)</span></label>
          <div class="control">
            <textarea v-model="form.notes" class="textarea" placeholder="Any notes"></textarea>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-primary" type="submit" :disabled="loading">Add</button>
          </div>
        </div>
        <p v-if="success" class="has-text-success">Unit of Meaning added!</p>
        <p v-if="error" class="has-text-danger">{{ error }}</p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { addUnitOfMeaning } from '../../dexie/useUnitOfMeaningTable'

const form = ref({
  languageCode: '',
  content: '',
  wordType: '',
  pronunciation: '',
  notes: ''
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  success.value = false
  error.value = ''
  try {
    await addUnitOfMeaning({
      languageCode: form.value.languageCode,
      content: form.value.content,
      wordType: form.value.wordType,
      pronunciation: form.value.pronunciation || undefined,
      notes: form.value.notes || undefined
    })
    success.value = true
    form.value = { languageCode: '', content: '', wordType: '', pronunciation: '', notes: '' }
  } catch (e: any) {
    error.value = e?.message || 'Failed to add.'
  } finally {
    loading.value = false
  }
}
</script>
