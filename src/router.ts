import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import EditUnitOfMeaning from './views/unitOfMeaning/EditUnitOfMeaning.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/unit-of-meaning/add',
    name: 'AddUnitOfMeaning',
    component: EditUnitOfMeaning
  },
  // Future routes can be added here
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
