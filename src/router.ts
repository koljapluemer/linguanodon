import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BrowseRemoteLearningGoals from '@/modules/learning-goals/user-interaction/browse-remote-learning-goals/BrowseRemoteLearningGoals.vue'
import DebugLearningGoals from '@/modules/debug/DebugLearningGoals.vue'
import DebugUnitsOfMeaning from '@/modules/debug/DebugUnitsOfMeaning.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/learning-goals/remote/:language',
    component: BrowseRemoteLearningGoals
  },
  {
    path: '/debug/learning-goals',
    component: DebugLearningGoals
  },
  {
    path: '/debug/units-of-meaning',
    component: DebugUnitsOfMeaning
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
