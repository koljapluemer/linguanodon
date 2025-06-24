<template>
  <section class="section">
    <div class="container">
      <h1 class="title">All Units Of Meaning</h1>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="uom in units" :key="uom.id">
              <td>{{ uom.languageCode }}</td>
              <td>{{ uom.content }}</td>
              <td>{{ uom.wordType }}</td>
              <td>{{ uom.pronunciation }}</td>
              <td>{{ uom.notes }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="units.length === 0" class="has-text-grey">No units found.</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '../../dexie/useUnitOfMeaningTable'
import type { UnitOfMeaning } from '../../types/UnitOfMeaning'

const units = ref<UnitOfMeaning[]>([])
const loading = ref(true)

async function fetchUnits() {
  loading.value = true
  units.value = await db.unitOfMeanings.toArray()
  loading.value = false
}

onMounted(fetchUnits)
</script> 