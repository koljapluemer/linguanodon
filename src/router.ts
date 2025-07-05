import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ViewRemoteLearningGoals from '@/pages/ViewRemoteLearningGoals.vue'
import ViewLearningGoals from '@/pages/ViewLearningGoals.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/browse-learning-goals/:lang_code',
    name: 'browse-learning-goals',
    component: ViewRemoteLearningGoals,
    props: true
  },
  {
    path: '/learning-goals',
    name: 'learning-goals',
    component: ViewLearningGoals
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
