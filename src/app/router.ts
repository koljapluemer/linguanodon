import { createRouter, createWebHistory } from 'vue-router';
import PageQueue from '@/pages/queue/PageQueue.vue';
import PageVocabList from '@/pages/vocab/PageVocabList.vue';
import PageVocabForm from '@/pages/vocab/PageVocabForm.vue';
import PageListExamples from '@/pages/examples/PageListExamples.vue';
import PageManageExample from '@/pages/examples/PageManageExample.vue';
import PageListFactCards from '@/pages/fact-cards/PageListFactCards.vue';
import PageManageFactCard from '@/pages/fact-cards/PageManageFactCard.vue';
import PageListResources from '@/pages/resources/PageListResources.vue';
import PageManageResource from '@/pages/resources/PageManageResource.vue';
import PageListGoals from '@/pages/goals/PageListGoals.vue';
import PageManageGoal from '@/pages/goals/PageManageGoal.vue';
import PageTasks from '@/pages/tasks/PageTasks.vue';
import PageDownloads from '@/pages/downloads/PageDownloads.vue';
import PageLanguages from '@/pages/languages/PageLanguages.vue';
import PageTimeTracking from '@/pages/time-tracking/PageTimeTracking.vue';

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
      path: '/fact-cards',
      name: 'fact-cards-list',
      component: PageListFactCards
    },
    {
      path: '/fact-cards/new',
      name: 'fact-cards-new',
      component: PageManageFactCard
    },
    {
      path: '/fact-cards/:uid/edit',
      name: 'fact-cards-edit',
      component: PageManageFactCard
    },
    {
      path: '/resources',
      name: 'resources-list',
      component: PageListResources
    },
    {
      path: '/resources/new',
      name: 'resources-new',
      component: PageManageResource
    },
    {
      path: '/resources/:uid/edit',
      name: 'resources-edit',
      component: PageManageResource
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
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: PageTasks
    },
    {
      path: '/downloads',
      name: 'downloads',
      component: PageDownloads
    },
    {
      path: '/languages',
      name: 'languages',
      component: PageLanguages
    },
    {
      path: '/time-tracking',
      name: 'time-tracking',
      component: PageTimeTracking
    }
  ]
});

export default router;