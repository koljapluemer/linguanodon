<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Debug: Units of Meaning</h1>
    <button class="btn btn-error mb-4" @click="deleteAll">Delete All Units</button>
    <table class="table w-full">
      <thead>
        <tr>
          <th>UID</th>
          <th>Language</th>
          <th>Content</th>
          <th>Translations</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in units" :key="unit.uid">
          <td>{{ unit.uid }}</td>
          <td>{{ unit.language }}</td>
          <td>{{ unit.content }}</td>
          <td>{{ unit.translations?.length || 0 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/modules/db/db-local/accessLocalDB'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const units = ref<UnitOfMeaning[]>([])

async function loadUnits() {
  units.value = await db.unitsOfMeaning.toArray()
}

async function deleteAll() {
  await db.unitsOfMeaning.clear()
  await loadUnits()
}

onMounted(loadUnits)
</script>
