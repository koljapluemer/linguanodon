import PageListWords from '@/pages/list-words/PageListWords.vue'
import PagePractice from '@/pages/practice/PagePractice.vue'
import PageListSentences from '@/pages/list-sentences/PageListSentences.vue'
import PageListResources from '@/pages/list-resources/PageListResources.vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageDebugLearningEvents from '@/pages/debug/debug-learning-events/DebugLearningEvents.vue'
import PageDebugLinguisticUnitProgressData from '@/pages/debug/debug-linguistic-unit-progress-data/DebugLinguisticUnitProgressData.vue'
import PageDebugWord from '@/pages/debug/debug-word/DebugWord.vue'
import PageDebugSentence from '@/pages/debug/debug-sentence/DebugSentence.vue'

/**
 * Application routes. Add new pages here.
 */
const routes: RouteRecordRaw[] = [
  {
    /** Practice page for language learning exercises */
    path: '/practice',
    name: 'practice',
    component: PagePractice
  },
  {
    /** List all words with progress data */
    path: '/words',
    name: 'words',
    component: PageListWords
  },
  {
    /** List all sentences with progress data */
    path: '/sentences',
    name: 'sentences',
    component: PageListSentences
  },
  {
    /** List all resources */
    path: '/resources',
    name: 'resources',
    component: PageListResources
  },
  {
    /** Debug page to view all learning events */
    path: '/debug-learning-events',
    name: 'debug-learning-events',
    component: PageDebugLearningEvents
  },
  {
    /** Debug page to view all linguistic unit progress data */
    path: '/debug-linguistic-unit-progress-data',
    name: 'debug-linguistic-unit-progress-data',
    component: PageDebugLinguisticUnitProgressData
  },
  {
    /** Debug page for a specific word */
    path: '/debug/word/:language/:content',
    name: 'debug-word',
    component: PageDebugWord
  },
  {
    /** Debug page for a specific sentence */
    path: '/debug/sentence/:language/:content',
    name: 'debug-sentence',
    component: PageDebugSentence
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
