import { createRouter, createWebHistory } from 'vue-router';
import PracticeOverview from '@/pages/practice/PracticeOverview.vue';
import FactCardGrindWidget from '@/pages/practice/modes/modes/fact-card-grind/FactCardGrindWidget.vue';
import GoalGetterWidget from '@/pages/practice/modes/modes/goal-getter/GoalGetterWidget.vue';
import SisyphosWidget from '@/pages/practice/modes/modes/sisyphos/SisyphosWidget.vue';
import InsertImagesWidget from '@/pages/practice/modes/modes/insert-images/InsertImagesWidget.vue';
import EyesAndEarsWidget from '@/pages/practice/modes/modes/eyes-and-ears/EyesAndEarsWidget.vue';
import UltraRandomWidget from '@/pages/practice/modes/modes/ultrarandom/UltraRandomWidget.vue';
import IllegalImmersionWidget from '@/pages/practice/modes/modes/illegal-immersion/IllegalImmersionWidget.vue';
import SentenceSlideWidget from '@/pages/practice/modes/modes/sentence-slide/SentenceSlideWidget.vue';
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
import PageTimeTracking from '@/pages/time-tracking/PageTimeTracking.vue';
import PageMyMaterial from '@/pages/my-material/PageMyMaterial.vue';
import PageSettings from '@/pages/settings/PageSettings.vue';

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
      component: PracticeOverview,
      children: [
        {
          path: 'fact-card-grind',
          name: 'practice-mode-fact-card-grind',
          component: FactCardGrindWidget
        },
        {
          path: 'goal-getter',
          name: 'practice-mode-goal-getter',
          component: GoalGetterWidget
        },
        {
          path: 'sisyphos',
          name: 'practice-mode-sisyphos',
          component: SisyphosWidget
        },
        {
          path: 'insert-images',
          name: 'practice-mode-insert-images',
          component: InsertImagesWidget
        },
        {
          path: 'eyes-and-ears',
          name: 'practice-mode-eyes-and-ears',
          component: EyesAndEarsWidget
        },
        {
          path: 'ultrarandom',
          name: 'practice-mode-ultrarandom',
          component: UltraRandomWidget
        },
        {
          path: 'illegal-immersion',
          name: 'practice-mode-illegal-immersion',
          component: IllegalImmersionWidget
        },
        {
          path: 'sentence-slide',
          name: 'practice-mode-sentence-slide',
          component: SentenceSlideWidget
        }
      ]
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
      component: PageDownloads,
      children: [
        {
          path: ':language/:setName',
          name: 'set-overview',
          component: () => import('@/pages/downloads/PageSetOverview.vue')
        }
      ]
    },
    {
      path: '/settings',
      name: 'settings',
      component: PageSettings
    },
    {
      path: '/time-tracking',
      name: 'time-tracking',
      component: PageTimeTracking
    }
  ]
});

export default router;