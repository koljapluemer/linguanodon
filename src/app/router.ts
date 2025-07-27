import { createRouter, createWebHistory } from 'vue-router';
import PageQueue from '@/pages/queue/PageQueue.vue';
import PageVocabList from '@/pages/vocab/PageVocabList.vue';
import PageVocabForm from '@/pages/vocab/PageVocabForm.vue';
import PageListImmersionContent from '@/pages/immersion-content/PageListImmersionContent.vue';
import PageManageImmersionContent from '@/pages/immersion-content/PageManageImmersionContent.vue';

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
    },
    {
      path: '/vocab',
      name: 'vocab-list',
      component: PageVocabList
    },
    {
      path: '/vocab/new',
      name: 'vocab-new',
      component: PageVocabForm
    },
    {
      path: '/vocab/:id/edit',
      name: 'vocab-edit',
      component: PageVocabForm
    },
    {
      path: '/immersion-content',
      name: 'immersion-content-list',
      component: PageListImmersionContent
    },
    {
      path: '/immersion-content/new',
      name: 'immersion-content-new',
      component: PageManageImmersionContent
    },
    {
      path: '/immersion-content/:uid',
      name: 'immersion-content-edit',
      component: PageManageImmersionContent
    }
  ]
});

export default router;