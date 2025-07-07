import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageListAllSets from '@/pages/PageListAllSets.vue'
import PagePracticeSet from '@/pages/PagePracticeSet.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/sets'
  },
  {
    /** Route for listing all sets */
    path: '/sets',
    name: 'sets',
    component: PageListAllSets
  },
  {
    /** Route for practicing a specific set */
    path: '/practice/:setUid',
    name: 'practice',
    component: PagePracticeSet,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
