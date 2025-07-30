import type { Meta, StoryObj } from '@storybook/vue3';
import { createEmptyCard } from 'ts-fsrs';
import TaskAddVocabToGoal from '@/widgets/TaskAddVocabToGoal.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';

// Mock repositories for Storybook
const mockGoalRepo = {
  getById: async (id: string) => {
    console.log(`Getting goal with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return createMockGoal({ id });
  },
  update: async (id: string, updates: Partial<GoalData>) => {
    console.log(`Updating goal ${id}:`, updates);
    await new Promise(resolve => setTimeout(resolve, 800));
    const goal = createMockGoal({ id });
    return { ...goal, ...updates };
  }
};

const mockVocabRepo = {
  getVocabByUID: async (id: string) => {
    console.log(`Getting vocab with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return createMockVocab({ id });
  },
  saveVocab: async (vocab: Partial<VocabData>) => {
    console.log('Saving vocab:', vocab);
    await new Promise(resolve => setTimeout(resolve, 600));
    return createMockVocab({
      id: `vocab-${Date.now()}`,
      ...vocab
    });
  },
  getTranslationsByIds: async (ids: string[]) => {
    console.log(`Getting translations with IDs:`, ids);
    await new Promise(resolve => setTimeout(resolve, 200));
    return ids.map(id => createMockTranslation({ id }));
  }
};

const meta: Meta<typeof TaskAddVocabToGoal> = {
  title: 'Widgets/TaskAddVocabToGoal',
  component: TaskAddVocabToGoal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for adding vocabulary to a learning goal. Combines a task prompt with a vocabulary management interface, allowing users to add, remove, and view vocabulary items with their translations related to the goal.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goalId: {
      description: 'Unique identifier for the goal to add vocabulary to',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: mockGoalRepo,
        vocabRepo: mockVocabRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create mock goal data
const createMockGoal = (overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'goal-1',
  taskType: 'goal',
  title: 'Learn Spanish Colors',
  prompt: 'Master color vocabulary and related expressions in Spanish',
  subGoals: [],
  parentGoal: undefined,
  milestones: [
    {
      taskType: 'milestone',
      title: 'Name 10 colors without hesitation',
      prompt: 'Complete this milestone: Name 10 colors without hesitation',
      evaluateAfterDoing: false,
      wantToDoAgain: true
    }
  ],
  coreTasks: [
    {
      taskType: 'add-vocab-to-goal',
      title: 'Add Vocabulary to Goal',
      prompt: 'Add Spanish color vocabulary that you need to learn for this goal',
      evaluateAfterDoing: false
    },
    {
      taskType: 'add-examples-to-goal',
      title: 'Add Examples',
      prompt: 'Add example sentences using color vocabulary',
      evaluateAfterDoing: false
    }
  ],
  vocab: ['vocab-1', 'vocab-2', 'vocab-3'],
  examples: ['example-1'],
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

// Helper function to create mock vocab data
const createMockVocab = (overrides: Partial<VocabData> = {}): VocabData => {
  const vocabMap = {
    'vocab-1': { content: 'rojo', language: 'es', translations: ['trans-1'] },
    'vocab-2': { content: 'azul', language: 'es', translations: ['trans-2'] },
    'vocab-3': { content: 'verde', language: 'es', translations: ['trans-3'] },
  };
  
  const baseData = vocabMap[overrides.id as keyof typeof vocabMap] || {
    content: 'example',
    language: 'es',
    translations: ['trans-1']
  };

  return {
    id: 'vocab-1',
    priority: 1,
    doNotPractice: false,
    pronunciation: undefined,
    notes: [],
    links: [],
    associatedTasks: [],
    progress: {
      ...createEmptyCard(),
      streak: 0,
      level: 0,
    },
    ...baseData,
    ...overrides,
  };
};

// Helper function to create mock translation data
const createMockTranslation = (overrides: Partial<TranslationData> = {}): TranslationData => {
  const translationMap = {
    'trans-1': { content: 'red' },
    'trans-2': { content: 'blue' },
    'trans-3': { content: 'green' },
  };
  
  const baseData = translationMap[overrides.id as keyof typeof translationMap] || {
    content: 'translation'
  };

  return {
    id: 'trans-1',
    ...baseData,
    ...overrides,
  };
};

export const Default: Story = {
  args: {
    goalId: 'goal-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing the task prompt and vocabulary management interface for a Spanish colors goal.',
      },
    },
  },
};

export const EmptyVocab: Story = {
  args: {
    goalId: 'goal-empty',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return createMockGoal({
              id,
              title: 'Learn French Phrases',
              prompt: 'Master common French phrases for travel',
              vocab: [],
            });
          }
        },
        vocabRepo: mockVocabRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Goal with no vocabulary yet - shows the empty state and add form.',
      },
    },
  },
};

export const GoalWithManyVocab: Story = {
  args: {
    goalId: 'goal-many-vocab',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return createMockGoal({
              id,
              title: 'Master Italian Food Vocabulary',
              prompt: 'Learn essential Italian vocabulary for dining and cooking',
              vocab: ['vocab-food-1', 'vocab-food-2', 'vocab-food-3', 'vocab-food-4', 'vocab-food-5'],
            });
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const foodVocab = {
              'vocab-food-1': { content: 'pasta', translations: ['trans-food-1'] },
              'vocab-food-2': { content: 'formaggio', translations: ['trans-food-2'] },
              'vocab-food-3': { content: 'pomodoro', translations: ['trans-food-3'] },
              'vocab-food-4': { content: 'basilico', translations: ['trans-food-4'] },
              'vocab-food-5': { content: 'olio', translations: ['trans-food-5'] },
            };
            return createMockVocab({
              id,
              language: 'it',
              ...foodVocab[id as keyof typeof foodVocab]
            });
          },
          getTranslationsByIds: async (ids: string[]) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const foodTranslations = {
              'trans-food-1': { content: 'pasta' },
              'trans-food-2': { content: 'cheese' },
              'trans-food-3': { content: 'tomato' },
              'trans-food-4': { content: 'basil' },
              'trans-food-5': { content: 'oil' },
            };
            return ids.map(id => createMockTranslation({
              id,
              ...foodTranslations[id as keyof typeof foodTranslations]
            }));
          }
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Goal with multiple vocabulary items showing how the list scales with more content.',
      },
    },
  },
};

export const GermanVocabGoal: Story = {
  args: {
    goalId: 'goal-german',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return createMockGoal({
              id,
              title: 'Deutsche Artikel lernen',
              prompt: 'Master German articles and their usage with nouns',
              vocab: ['vocab-german-1', 'vocab-german-2'],
            });
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const germanVocab = {
              'vocab-german-1': { content: 'der Hund', translations: ['trans-german-1'] },
              'vocab-german-2': { content: 'die Katze', translations: ['trans-german-2'] },
            };
            return createMockVocab({
              id,
              language: 'de',
              ...germanVocab[id as keyof typeof germanVocab]
            });
          },
          getTranslationsByIds: async (ids: string[]) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const germanTranslations = {
              'trans-german-1': { content: 'the dog (masculine)' },
              'trans-german-2': { content: 'the cat (feminine)' },
            };
            return ids.map(id => createMockTranslation({
              id,
              ...germanTranslations[id as keyof typeof germanTranslations]
            }));
          }
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'German language goal demonstrating article-focused vocabulary with detailed translations.',
      },
    },
  },
};

export const JapaneseVocabGoal: Story = {
  args: {
    goalId: 'goal-japanese',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return createMockGoal({
              id,
              title: '基本的な挨拶を覚える',
              prompt: 'Learn basic Japanese greetings and polite expressions',
              vocab: ['vocab-jp-1', 'vocab-jp-2', 'vocab-jp-3'],
            });
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const japaneseVocab = {
              'vocab-jp-1': { content: 'おはよう', translations: ['trans-jp-1'] },
              'vocab-jp-2': { content: 'こんにちは', translations: ['trans-jp-2'] },
              'vocab-jp-3': { content: 'ありがとう', translations: ['trans-jp-3'] },
            };
            return createMockVocab({
              id,
              language: 'ja',
              ...japaneseVocab[id as keyof typeof japaneseVocab]
            });
          },
          getTranslationsByIds: async (ids: string[]) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const japaneseTranslations = {
              'trans-jp-1': { content: 'good morning (casual)' },
              'trans-jp-2': { content: 'hello / good afternoon' },
              'trans-jp-3': { content: 'thank you' },
            };
            return ids.map(id => createMockTranslation({
              id,
              ...japaneseTranslations[id as keyof typeof japaneseTranslations]
            }));
          }
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Japanese language goal demonstrating Unicode support with hiragana characters and detailed context in translations.',
      },
    },
  },
};

export const VocabWithComplexTranslations: Story = {
  args: {
    goalId: 'goal-complex',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return createMockGoal({
              id,
              title: 'Advanced English Vocabulary',
              prompt: 'Master sophisticated English vocabulary for academic writing',
              vocab: ['vocab-complex-1'],
            });
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return createMockVocab({
              id: 'vocab-complex-1',
              content: 'ubiquitous',
              language: 'en',
              translations: ['trans-complex-1', 'trans-complex-2'],
            });
          },
          getTranslationsByIds: async (ids: string[]) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const complexTranslations = {
              'trans-complex-1': { content: 'existing everywhere' },
              'trans-complex-2': { content: 'omnipresent' },
            };
            return ids.map(id => createMockTranslation({
              id,
              ...complexTranslations[id as keyof typeof complexTranslations]
            }));
          }
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary item with multiple translations showing how the interface handles complex translation relationships.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    goalId: 'goal-loading',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          getById: async (id: string) => {
            // Never resolve to show loading state
            return new Promise(() => {});
          }
        },
        vocabRepo: mockVocabRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading spinner while the goal data is being fetched.',
      },
    },
  },
};