import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageDebugExerciseData from '@/pages/debug/PageDebugExerciseData.vue'
import PageRemoteListAllSets from '@/pages/PageRemoteListAllSets.vue'

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


  // DEBUG ROUTES
  {
    path: '/debug/exercise-data',
    name: 'debug-exercise-data',
    component: PageDebugExerciseData
  }



]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
