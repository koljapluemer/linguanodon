import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ViewRemoteLearningGoals from '@/pages/ViewRemoteLearningGoals.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/browse-learning-goals/:lang_code',
    name: 'browse-learning-goals',
    component: ViewRemoteLearningGoals,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
