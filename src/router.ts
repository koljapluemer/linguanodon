import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ViewRemoteLearningGoals from '@/pages/ViewRemoteLearningGoals.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/remote-learning-goals/:lang_code',
    name: 'remote-learning-goals',
    component: ViewRemoteLearningGoals,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
