import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * Application routes. Add new pages here.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/practice',
    name: 'practice',
    /**
     *
     */
    component: () => import('@/pages/PracticePage.vue')
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
