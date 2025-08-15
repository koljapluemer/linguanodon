import { createRouter, createWebHistory } from 'vue-router';
import PageQueue from '@/pages/queue/PageQueue.vue';
import PageVocabList from '@/pages/vocab-list/PageVocabList.vue';
import PageVocabEdit from '@/pages/vocab-edit/PageVocabEdit.vue';
import PageListFactCards from '@/pages/fact-cards-list/PageListFactCards.vue';
import PageManageFactCard from '@/pages/fact-cards-manage/PageManageFactCard.vue';
import PageListResources from '@/pages/resources-list/PageListResources.vue';
import PageManageResource from '@/pages/resources-manage/PageManageResource.vue';
import PageListImmersionContent from '@/pages/immersion-content-list/PageListImmersionContent.vue';
import PageManageImmersionContent from '@/pages/immersion-content-manage/PageManageImmersionContent.vue';
import PageListGoals from '@/pages/goals-list/PageListGoals.vue';
import PageManageGoal from '@/pages/goals-manage/PageManageGoal.vue';
import PageDownloads from '@/pages/downloads/PageDownloads.vue';
import PageLanguages from '@/pages/languages/PageLanguages.vue';
import PageTimeTracking from '@/pages/time-tracking/PageTimeTracking.vue';
import PageMyMaterial from '@/pages/my-material/PageMyMaterial.vue';

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
      path: '/my-material',
      name: 'my-material',
      component: PageMyMaterial
    },
    {
      path: '/vocab',
      name: 'vocab-list',
      component: PageVocabList
    },
    {
      path: '/vocab/new',
      name: 'vocab-new',
      component: PageVocabEdit
    },
    {
      path: '/vocab/:id/edit',
      name: 'vocab-edit',
      component: PageVocabEdit
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
      path: '/immersion-content/:uid/edit',
      name: 'immersion-content-edit',
      component: PageManageImmersionContent
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