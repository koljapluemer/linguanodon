import { createRouter, createWebHistory } from 'vue-router'
import ListOfLearningGoals from './modules/learning-goals/ListOfLearningGoals.vue'
import ShowLearningGoal from './modules/learning-goals/ShowLearningGoal.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/debug/learning-goals',
      name: 'learning-goals',
      component: ListOfLearningGoals
    },
    {
      path: '/debug/learning-goals/:id',
      name: 'learning-goal-detail',
      component: ShowLearningGoal
    }
  ]
})

export default router 