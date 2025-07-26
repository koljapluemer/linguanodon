import { createRouter, createWebHistory } from 'vue-router';
import PageQueue from '@/pages/queue/PageQueue.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/queue'
    },
    {
      path: '/queue',
      name: 'queue',
      component: PageQueue
    }
  ]
});

export default router;