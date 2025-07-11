<template>
  <div class="container mx-auto p-4">
    <PracticeTaskControl :task-id="taskId" />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { useRoute } from 'vue-router'
import PracticeTaskControl from '@/components/practice/task/PracticeTaskControl.vue'
import { useRepoDexieTasks } from '@/repositories/implementations/dexie/useRepoDexieTasks'
import { useRepoDexieUnitsOfMeaning } from '@/repositories/implementations/dexie/useRepoDexieUnitsOfMeaning'
import { useRepoDexieExerciseData } from '@/repositories/implementations/dexie/useRepoDexieExerciseData'
import { taskRepositoryKey, unitOfMeaningRepositoryKey, exerciseRepositoryKey } from '@/types/injectionKeys'

const route = useRoute()
const taskId = route.params.taskId as string

// Provide repositories to child components
provide(taskRepositoryKey, useRepoDexieTasks())
provide(unitOfMeaningRepositoryKey, useRepoDexieUnitsOfMeaning())
provide(exerciseRepositoryKey, useRepoDexieExerciseData())
</script>
