<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Remote Sets</h1>
    <ListControllRemoteSets />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ListControllRemoteSets from '@/components/lists/control/ListControllRemoteSets.vue'
import { useRepoDexieSets } from '@/repositories/implementations/dexie/useRepoDexieSets'
import { useRepoDexieTasks } from '@/repositories/implementations/dexie/useRepoDexieTasks'
import { useRepoDexieUnitsOfMeaning } from '@/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning'
import { useRepoDexieLanguages } from '@/repositories/implementations/dexie/useRepoDexieLanguages'
import { setRepositoryKey, taskRepositoryKey, unitOfMeaningRepositoryKey, languageRepositoryKey } from '@/types/injectionKeys'

// Provide repositories to child components
provide(setRepositoryKey, useRepoDexieSets())
provide(taskRepositoryKey, useRepoDexieTasks())
provide(unitOfMeaningRepositoryKey, useRepoDexieUnitsOfMeaning())
provide(languageRepositoryKey, useRepoDexieLanguages())
</script>
