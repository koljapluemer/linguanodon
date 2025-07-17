<template>
  <div class="container mx-auto p-4">
    <PracticeUnitOfMeaningBased />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PracticeUnitOfMeaningBased from '@/components/practice/unitOfMeaning/PracticeUnitOfMeaningBased.vue'
import { useRepoDexieUnitsOfMeaning } from '@/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning'
import { useRepoDexieLanguages } from '@/repositories/implementations/dexie/useRepoDexieLanguages'
import { useRepoDexieExerciseData } from '@/repositories/implementations/dexie/useRepoDexieExerciseData'
import { unitOfMeaningRepositoryKey, languageRepositoryKey, exerciseRepositoryKey } from '@/types/injectionKeys'

provide(unitOfMeaningRepositoryKey, useRepoDexieUnitsOfMeaning())
provide(languageRepositoryKey, useRepoDexieLanguages())
provide(exerciseRepositoryKey, useRepoDexieExerciseData())
</script>
