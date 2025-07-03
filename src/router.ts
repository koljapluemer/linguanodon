import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BrowseRemoteLearningGoals from '@/modules/learning-goals/user-interaction/browse-remote-learning-goals/BrowseRemoteLearningGoals.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/learning-goals/remote/:language',
    component: BrowseRemoteLearningGoals
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
