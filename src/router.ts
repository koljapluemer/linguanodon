import { createRouter, createWebHistory } from 'vue-router'
import ListOfLearningGoals from './modules/debug/ListOfLearningGoals.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/debug/learning-goals',
      name: 'learning-goals',
      component: ListOfLearningGoals
    }
  ]
})

export default router 