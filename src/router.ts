import { createRouter, createWebHistory } from 'vue-router'
import SelfLearning from './modules/self-learning/SelfLearning.vue'
import GoalsView from './modules/self-learning/views/GoalsView.vue'
import SubGoalsView from './modules/self-learning/views/SubGoalsView.vue'
import UnitsView from './modules/self-learning/views/UnitsView.vue'
import PracticeView from './modules/self-learning/views/PracticeView.vue'
import RandomGoalView from './modules/self-learning/views/RandomGoalView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/debug/self-learning',
      component: SelfLearning,
      children: [
        {
          path: '',
          name: 'goals',
          component: GoalsView
        },
        {
          path: 'random',
          name: 'random-goal',
          component: RandomGoalView
        },
        {
          path: 'subgoals/:goalId',
          name: 'subgoals',
          component: SubGoalsView
        },
        {
          path: 'units/:subGoalId',
          name: 'units',
          component: UnitsView
        },
        {
          path: 'practice/:goalId',
          name: 'practice',
          component: PracticeView
        }
      ]
    }
  ]
})

export default router 