import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * Application routes. Add new pages here.
 */
const routes: RouteRecordRaw[] = [
  {
    /** Practice page for language learning exercises */
    path: '/practice',
    name: 'practice',
    component: () => import('@/pages/PracticePage.vue')
  },
  {
    /** Debug page to view all learning events */
    path: '/debug-learning-events',
    name: 'debug-learning-events',
    component: () => import('@/pages/DebugLearningEvents.vue')
  }
]

/**
 * Vue Router instance for the application.
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
