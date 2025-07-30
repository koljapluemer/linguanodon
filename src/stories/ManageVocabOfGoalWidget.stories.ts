import type { Meta, StoryObj } from '@storybook/vue3';
import ManageVocabOfGoalWidget from '@/features/manage-vocab-of-goal/ManageVocabOfGoalWidget.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

// Mock vocab data
const createMockVocab = (id: string, content: string, language: string, translationIds: string[] = []): VocabData => ({
  id,
  language,
  content,
  priority: 1,
  doNotPractice: false,
  pronunciation: '',
  notes: [],
  translations: translationIds,
  links: [],
  associatedTasks: [],
  progress: {
    level: 1,
    streak: 0,
    due: new Date(),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 1,
    lapses: 0,
    state: 0,
    last_review: new Date(),
  },
});

// Mock translation data
const createMockTranslation = (id: string, content: string, language: string = 'en'): TranslationData => ({
  id,
  content,
  language,
});

// Mock goal data
const createMockGoal = (vocabIds: string[] = [], overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'goal-123',
  taskType: 'learning-goal',
  title: 'Learn Spanish Basics',
  prompt: 'Master fundamental Spanish vocabulary and phrases',
  vocab: vocabIds,
  examples: [],
  subGoals: [],
  milestones: [],
  coreTasks: [
    {
      taskType: 'add-vocab-to-goal',
      title: 'Add Vocabulary',
      prompt: 'Add relevant vocabulary to this goal',
    },
  ],
  isUserCreated: true,
  lastDownloadedAt: new Date(),
  ...overrides,
});

// Mock repositories
const createMockRepos = (vocabList: VocabData[] = [], translations: TranslationData[] = []) => {
  const goalRepo: GoalRepoContract = {
    async update(id: string, updates: Partial<GoalData>) {
      console.log(`Updated goal ${id}:`, updates);
      return createMockGoal(updates.vocab || [], updates);
    },
  } as GoalRepoContract;

  const vocabRepo: VocabAndTranslationRepoContract = {
    async getVocabByUID(id: string) {
      return vocabList.find(v => v.id === id) || null;
    },
    async getTranslationsByIds(ids: string[]) {
      return translations.filter(t => ids.includes(t.id));
    },
    async saveVocab(vocab: Partial<VocabData>) {
      const newVocab = createMockVocab(
        'new-vocab-' + Date.now(),
        vocab.content || '',
        vocab.language || '',
        vocab.translations || []
      );
      console.log('Created new vocab:', newVocab);
      return newVocab;
    },
  } as VocabAndTranslationRepoContract;

  return { goalRepo, vocabRepo };
};

const meta: Meta<typeof ManageVocabOfGoalWidget> = {
  title: 'Features/ManageVocabOfGoalWidget',
  component: ManageVocabOfGoalWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Vocabulary management widget for learning goals. Allows viewing, adding, and removing vocabulary items associated with a specific goal. Supports creating new vocabulary entries and managing goal-vocabulary relationships.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goal: {
      description: 'Goal data object containing vocabulary associations',
      control: false,
    },
  },
  decorators: [
    (story, context) => {
      const vocabList = context.args.vocabList || [];
      const translations = context.args.translations || [];
      const { goalRepo, vocabRepo } = createMockRepos(vocabList, translations);
      
      return {
        components: { story },
        provide: {
          goalRepo,
          vocabRepo,
        },
        template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
      };
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyGoal: Story = {
  args: {
    goal: createMockGoal([]),
    vocabList: [],
    translations: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with no vocabulary items attached yet. Shows empty state and add vocabulary form.',
      },
    },
  },
};

export const GoalWithBasicVocab: Story = {
  args: {
    goal: createMockGoal(['vocab-1', 'vocab-2', 'vocab-3']),
    vocabList: [
      createMockVocab('vocab-1', 'casa', 'es', ['trans-1']),
      createMockVocab('vocab-2', 'perro', 'es', ['trans-2']),
      createMockVocab('vocab-3', 'agua', 'es', ['trans-3']),
    ],
    translations: [
      createMockTranslation('trans-1', 'house'),
      createMockTranslation('trans-2', 'dog'),
      createMockTranslation('trans-3', 'water'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with basic Spanish vocabulary showing vocab items with translations.',
      },
    },
  },
};

export const GoalWithMultipleTranslations: Story = {
  args: {
    goal: createMockGoal(['vocab-1', 'vocab-2']),
    vocabList: [
      createMockVocab('vocab-1', 'banco', 'es', ['trans-1', 'trans-2']),
      createMockVocab('vocab-2', 'carta', 'es', ['trans-3', 'trans-4', 'trans-5']),
    ],
    translations: [
      createMockTranslation('trans-1', 'bank'),
      createMockTranslation('trans-2', 'bench'),
      createMockTranslation('trans-3', 'letter'),
      createMockTranslation('trans-4', 'menu'),
      createMockTranslation('trans-5', 'card'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary items with multiple translations showing polysemy (multiple meanings).',
      },
    },
  },
};

export const MultiLanguageGoal: Story = {
  args: {
    goal: createMockGoal(['vocab-1', 'vocab-2', 'vocab-3', 'vocab-4']),
    vocabList: [
      createMockVocab('vocab-1', 'casa', 'es', ['trans-1']),
      createMockVocab('vocab-2', '家', 'ja', ['trans-2']),
      createMockVocab('vocab-3', 'Haus', 'de', ['trans-3']),  
      createMockVocab('vocab-4', 'منزل', 'ar', ['trans-4']),
    ],
    translations: [
      createMockTranslation('trans-1', 'house'),
      createMockTranslation('trans-2', 'home'),
      createMockTranslation('trans-3', 'house'),
      createMockTranslation('trans-4', 'house'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-language vocabulary in one goal (Spanish, Japanese, German, Arabic).',
      },
    },
  },
};

export const TechnicalVocabulary: Story = {
  args: {
    goal: createMockGoal(['vocab-1', 'vocab-2', 'vocab-3'], {
      title: 'Spanish Programming Terms',
      prompt: 'Learn technical vocabulary for software development',
    }),
    vocabList: [
      createMockVocab('vocab-1', 'algoritmo', 'es', ['trans-1']),
      createMockVocab('vocab-2', 'programación', 'es', ['trans-2']),
      createMockVocab('vocab-3', 'base de datos', 'es', ['trans-3']),
    ],
    translations: [
      createMockTranslation('trans-1', 'algorithm'),
      createMockTranslation('trans-2', 'programming'),
      createMockTranslation('trans-3', 'database'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal focused on technical/programming vocabulary in Spanish.',
      },
    },
  },
};

export const VocabWithoutTranslations: Story = {
  args: {
    goal: createMockGoal(['vocab-1', 'vocab-2']),
    vocabList: [
      createMockVocab('vocab-1', 'cognado', 'es', []),
      createMockVocab('vocab-2', 'similar', 'es', []),
    ],
    translations: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary items without translations (cognates or known words).',
      },
    },
  },
};

export const VocabWithMissingTranslations: Story = {
  args: {
    goal: createMockGoal(['vocab-1', 'vocab-2']),
    vocabList: [
      createMockVocab('vocab-1', 'palabra', 'es', ['missing-trans-1']),
      createMockVocab('vocab-2', 'frase', 'es', ['missing-trans-2']),
    ],
    translations: [], // No translations found
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary with missing/broken translation references showing "Unknown" fallback.',
      },
    },
  },
};

export const LongVocabularyList: Story = {
  args: {
    goal: createMockGoal([
      'vocab-1', 'vocab-2', 'vocab-3', 'vocab-4', 'vocab-5',
      'vocab-6', 'vocab-7', 'vocab-8', 'vocab-9', 'vocab-10',
    ]),
    vocabList: [
      createMockVocab('vocab-1', 'administración', 'es', ['trans-1']),
      createMockVocab('vocab-2', 'responsabilidad', 'es', ['trans-2']),
      createMockVocab('vocab-3', 'procedimiento', 'es', ['trans-3']),
      createMockVocab('vocab-4', 'investigación', 'es', ['trans-4']),
      createMockVocab('vocab-5', 'comunicación', 'es', ['trans-5']),
      createMockVocab('vocab-6', 'documentación', 'es', ['trans-6']),
      createMockVocab('vocab-7', 'organización', 'es', ['trans-7']),
      createMockVocab('vocab-8', 'coordinación', 'es', ['trans-8']),
      createMockVocab('vocab-9', 'implementación', 'es', ['trans-9']),
      createMockVocab('vocab-10', 'evaluación', 'es', ['trans-10']),
    ],
    translations: [
      createMockTranslation('trans-1', 'administration'),
      createMockTranslation('trans-2', 'responsibility'),
      createMockTranslation('trans-3', 'procedure'),
      createMockTranslation('trans-4', 'research'),
      createMockTranslation('trans-5', 'communication'),
      createMockTranslation('trans-6', 'documentation'),
      createMockTranslation('trans-7', 'organization'),
      createMockTranslation('trans-8', 'coordination'),
      createMockTranslation('trans-9', 'implementation'),
      createMockTranslation('trans-10', 'evaluation'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with many vocabulary items to test scrolling and performance.',
      },
    },
  },
};

export const VocabWithoutContent: Story = {
  args: {
    goal: createMockGoal(['vocab-1', 'vocab-2']),
    vocabList: [
      createMockVocab('vocab-1', '', 'es', ['trans-1']),
      createMockVocab('vocab-2', '', 'ja', ['trans-2']),
    ],
    translations: [
      createMockTranslation('trans-1', 'placeholder'),
      createMockTranslation('trans-2', 'empty content'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary items with empty content showing "No content" fallback.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    goal: createMockGoal(['vocab-1']),
  },
  decorators: [
    (story) => {
      const { goalRepo } = createMockRepos();
      const vocabRepo = {
        async getVocabByUID() {
          // Simulate long loading
          await new Promise(resolve => setTimeout(resolve, 10000));
          return createMockVocab('vocab-1', 'loading', 'es');
        },
        async getTranslationsByIds() { return []; },
        async saveVocab(vocab: Partial<VocabData>) { return createMockVocab('new', '', 'es'); },
      } as VocabAndTranslationRepoContract;

      return {
        components: { story },
        provide: { goalRepo, vocabRepo },
        template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
      };
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching vocabulary data for the goal.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    goal: createMockGoal(['vocab-1']),
    vocabList: [
      createMockVocab('vocab-1', 'interactivo', 'es', ['trans-1']),
    ],
    translations: [
      createMockTranslation('trans-1', 'interactive'),
    ],
  },
  play: async () => {
    console.log('Interactive demo ready - try adding/removing vocabulary items');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing vocabulary management functionality.',
      },
    },
  },
};