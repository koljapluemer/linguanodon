import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageListAllSets from '@/pages/LegacyPageListAllSets.vue'
import PagePracticeSet from '@/pages/LegacyPagePracticeSet.vue'
import PageDebugExerciseData from '@/pages/debug/PageDebugExerciseData.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/sets'
  },
  {
    /** Route for listing all sets */
    path: '/sets',
    name: 'sets',
    component: PageListAllSets
  },
  {
    /** Route for practicing a specific set */
    path: '/practice/:setUid',
    name: 'practice',
    component: PagePracticeSet,
    props: true
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
