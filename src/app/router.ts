import { createRouter, createWebHistory } from 'vue-router';
import PracticeOverview from '@/pages/practice-overview/PracticeOverview.vue';
import PracticeModeClassicQueue from '@/pages/practice-mode-classic-queue/PracticeModeClassicQueue.vue';
import PracticeModeFactCardGrind from '@/pages/practice-mode-fact-card-grind/PracticeModeFactCardGrind.vue';
import PageVocabList from '@/pages/vocab-list/PageVocabList.vue';
import PageVocabEdit from '@/pages/vocab-edit/PageVocabEdit.vue';
import PageVocabAdd from '@/pages/vocab-add/PageVocabAdd.vue';
import PageListFactCards from '@/pages/fact-cards-list/PageListFactCards.vue';
import PageFactCardAdd from '@/pages/fact-cards-add/PageFactCardAdd.vue';
import PageFactCardEdit from '@/pages/fact-cards-edit/PageFactCardEdit.vue';
import PageListResources from '@/pages/resources-list/PageListResources.vue';
import PageResourceAdd from '@/pages/resource-add/PageResourceAdd.vue';
import PageResourceEdit from '@/pages/resource-edit/PageResourceEdit.vue';
import PageListGoals from '@/pages/goals-list/PageListGoals.vue';
import PageGoalAdd from '@/pages/goal-add/PageGoalAdd.vue';
import PageGoalEdit from '@/pages/goal-edit/PageGoalEdit.vue';
import PageDownloads from '@/pages/downloads/PageDownloads.vue';
import PageLanguages from '@/pages/languages/PageLanguages.vue';
import PageTimeTracking from '@/pages/time-tracking/PageTimeTracking.vue';
import PageMyMaterial from '@/pages/my-material/PageMyMaterial.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/practice'
    },
    {
      path: '/practice',
      name: 'practice-overview',
      component: PracticeOverview
    },
    {
      path: '/practice/classic-queue',
      name: 'practice-mode-classic-queue',
      component: PracticeModeClassicQueue,
      props: route => ({ focusOnVocab: route.query.focusOnVocab as string })
    },
    {
      path: '/practice/fact-card-grind',
      name: 'practice-mode-fact-card-grind',
      component: PracticeModeFactCardGrind
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
      component: PageVocabAdd
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
      component: PageFactCardAdd
    },
    {
      path: '/fact-cards/:id/edit',
      name: 'fact-cards-edit',
      component: PageFactCardEdit
    },
    {
      path: '/resources',
      name: 'resources-list',
      component: PageListResources
    },
    {
      path: '/resources/new',
      name: 'resources-new',
      component: PageResourceAdd
    },
    {
      path: '/resources/:uid/edit',
      name: 'resources-edit',
      component: PageResourceEdit
    },
    {
      path: '/goals',
      name: 'goals-list',
      component: PageListGoals
    },
    {
      path: '/goals/add',
      name: 'goals-add',
      component: PageGoalAdd
    },
    {
      path: '/goals/:id/edit',
      name: 'goals-edit',
      component: PageGoalEdit
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