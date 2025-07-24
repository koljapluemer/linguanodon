import PageListWords from '@/pages/list-words/PageListWords.vue'
import PageManageWords from '@/pages/manage-words/PageManageWords.vue'
import PagePractice from '@/pages/practice/PagePractice.vue'
import PageListSentences from '@/pages/list-sentences/PageListSentences.vue'
import PageManageSentences from '@/pages/manage-sentences/PageManageSentences.vue'
import PageListResources from '@/pages/list-resources/PageListResources.vue'
import PageManageResource from '@/pages/manage-resource/PageManageResource.vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageDebugLearningEvents from '@/pages/debug/debug-learning-events/DebugLearningEvents.vue'
import PageDebugLinguisticUnitProgressData from '@/pages/debug/debug-linguistic-unit-progress-data/DebugLinguisticUnitProgressData.vue'
import PageDebugWord from '@/pages/debug/debug-word/DebugWord.vue'
import PageDebugSentence from '@/pages/debug/debug-sentence/DebugSentence.vue'
import PageManageLanguages from '@/pages/manage-languages/PageManageLanguages.vue'
import PageManageLearningGoal from '@/pages/manage-learning-goal/PageManageLearningGoal.vue'
import PageListLearningGoals from '@/pages/list-learning-goals/PageListLearningGoals.vue'

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
    /** Manage words - add/edit */
    path: '/words/manage',
    name: 'manage-words',
    component: PageManageWords
  },
  {
    /** Edit specific word */
    path: '/words/manage/:language/:content',
    name: 'edit-word',
    component: PageManageWords
  },
  {
    /** List all sentences with progress data */
    path: '/sentences',
    name: 'sentences',
    component: PageListSentences
  },
  {
    /** Manage sentences - add/edit */
    path: '/sentences/manage',
    name: 'manage-sentences',
    component: PageManageSentences
  },
  {
    /** Edit specific sentence */
    path: '/sentences/manage/:language/:content',
    name: 'edit-sentence',
    component: PageManageSentences
  },
  {
    /** List all resources */
    path: '/resources',
    name: 'resources',
    component: PageListResources
  },
  {
    /** Manage resources - add/edit */
    path: '/resources/manage',
    name: 'manage-resource',
    component: PageManageResource
  },
  {
    /** Edit specific resource */
    path: '/resources/manage/:uid',
    name: 'edit-resource',
    component: PageManageResource
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
  },
  {
    /** Manage languages - add/edit */
    path: '/languages/manage',
    name: 'manage-languages',
    component: PageManageLanguages
  },
  {
    /** Manage learning goals - add/edit */
    path: '/learning-goals/manage',
    name: 'manage-learning-goals',
    component: PageManageLearningGoal
  },
  {
    /** Edit specific learning goal */
    path: '/learning-goals/manage/:uid',
    name: 'edit-learning-goal',
    component: PageManageLearningGoal
  },
  {
    /** List all learning goals */
    path: '/learning-goals',
    name: 'learning-goals',
    component: PageListLearningGoals
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
