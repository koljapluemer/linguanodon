import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageRemoteListAllSets from '@/pages/PageRemoteListAllSets.vue'
import PageListAllUnitsOfMeaning from '@/pages/PageListAllUnitsOfMeaning.vue'
import PageListAllTasks from '@/pages/PageListAllTasks.vue'
import PagePracticeTask from '@/pages/PagePracticeTask.vue'
import PageManageUserLanguages from '@/pages/PageManageUserLanguages.vue'
import DebugTaskExerciseGeneration from '@/pages/debug/DebugTaskExerciseGeneration.vue'
import DebugExerciseDataTracking from '@/pages/debug/DebugExerciseDataTracking.vue'
import PageManageUnitOfMeaning from '@/pages/PageManageUnitOfMeaning.vue'
import PageQueue from '@/pages/PageQueue.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/remote-sets'
  },

  {
    /** Route for listing remote sets */
    path: '/remote-sets',
    name: 'remote-sets',
    component: PageRemoteListAllSets
  },

  {
    /** Route for listing all units of meaning */
    path: '/units',
    name: 'units',
    component: PageListAllUnitsOfMeaning
  },

  {
    /** Route for listing all tasks */
    path: '/tasks',
    name: 'tasks',
    component: PageListAllTasks
  },

  {
    /** Route for practicing a specific task */
    path: '/practice-task/:taskId',
    name: 'practice-task',
    component: PagePracticeTask
  },

  {
    /** Route for managing user languages */
    path: '/manage-languages',
    name: 'manage-languages',
    component: PageManageUserLanguages
  },

  {
    /** Route for debugging task exercise generation */
    path: '/debug/exercise-generation',
    name: 'debug-exercise-generation',
    component: DebugTaskExerciseGeneration
  },

  {
    /** Route for debugging exercise data tracking */
    path: '/debug/exercise-data-tracking',
    name: 'debug-exercise-data-tracking',
    component: DebugExerciseDataTracking
  },

  // Route for editing a specific unit of meaning
  {
    path: '/units/:language/:content/edit',
    name: 'unit-edit',
    component: PageManageUnitOfMeaning
  },

  {
    path: '/queue',
    name: 'queue',
    component: PageQueue
  },

]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
