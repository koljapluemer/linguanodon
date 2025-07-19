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
    component: () => import('@/pages/PagePractice.vue')
  },
  {
    /** List all words with progress data */
    path: '/words',
    name: 'words',
    component: () => import('@/pages/PageListWords.vue')
  },
  {
    /** List all sentences with progress data */
    path: '/sentences',
    name: 'sentences',
    component: () => import('@/pages/PageListSentences.vue')
  },
  {
    /** Debug page to view all learning events */
    path: '/debug-learning-events',
    name: 'debug-learning-events',
    component: () => import('@/pages/DebugLearningEvents.vue')
  },
  {
    /** Debug page to view all linguistic unit progress data */
    path: '/debug-linguistic-unit-progress-data',
    name: 'debug-linguistic-unit-progress-data',
    component: () => import('@/pages/DebugLinguisticUnitProgressData.vue')
  },
  {
    /** Debug page for a specific word */
    path: '/debug/word/:language/:content',
    name: 'debug-word',
    component: () => import('@/pages/DebugWord.vue')
  },
  {
    /** Debug page for a specific sentence */
    path: '/debug/sentence/:language/:content',
    name: 'debug-sentence',
    component: () => import('@/pages/DebugSentence.vue')
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
