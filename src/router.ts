import { createRouter, createWebHistory } from 'vue-router'
import SelfLearning from './modules/self-learning/SelfLearning.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/debug/self-learning',
      name: 'self-learning',
      component: SelfLearning
    }
  ]
})

export default router 