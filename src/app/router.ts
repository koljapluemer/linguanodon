import { createRouter, createWebHistory } from 'vue-router';
import PageQueue from '@/pages/queue/PageQueue.vue';
import PageVocabList from '@/pages/vocab/PageVocabList.vue';
import PageVocabForm from '@/pages/vocab/PageVocabForm.vue';
import PageListImmersionContent from '@/pages/immersion-content/PageListImmersionContent.vue';
import PageManageImmersionContent from '@/pages/immersion-content/PageManageImmersionContent.vue';
import PageListExamples from '@/pages/examples/PageListExamples.vue';
import PageManageExample from '@/pages/examples/PageManageExample.vue';
import PageListGoals from '@/pages/goals/PageListGoals.vue';
import PageManageGoal from '@/pages/goals/PageManageGoal.vue';

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
    },
    {
      path: '/examples',
      name: 'examples-list',
      component: PageListExamples
    },
    {
      path: '/examples/new',
      name: 'examples-new',
      component: PageManageExample
    },
    {
      path: '/examples/:id',
      name: 'examples-edit',
      component: PageManageExample
    },
    {
      path: '/goals',
      name: 'goals-list',
      component: PageListGoals
    },
    {
      path: '/goals/new',
      name: 'goals-new',
      component: PageManageGoal
    },
    {
      path: '/goals/:id',
      name: 'goals-edit',
      component: PageManageGoal
    }
  ]
});

export default router;