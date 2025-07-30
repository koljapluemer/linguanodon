import type { Meta, StoryObj } from '@storybook/vue3';
import TaskAddExamplesToGoal from '@/widgets/TaskAddExamplesToGoal.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { ExampleData } from '@/entities/examples/ExampleData';

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

const mockExampleRepo = {
  getExampleById: async (id: string) => {
    console.log(`Getting example with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return createMockExample({ id });
  },
  saveExample: async (example: Partial<ExampleData>) => {
    console.log('Saving example:', example);
    await new Promise(resolve => setTimeout(resolve, 600));
    return createMockExample({
      id: `example-${Date.now()}`,
      ...example
    });
  }
};

const meta: Meta<typeof TaskAddExamplesToGoal> = {
  title: 'Widgets/TaskAddExamplesToGoal',
  component: TaskAddExamplesToGoal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for adding examples to a learning goal. Combines a task prompt with an examples management interface, allowing users to add, remove, and view example sentences or phrases related to the goal.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goalId: {
      description: 'Unique identifier for the goal to add examples to',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: mockGoalRepo,
        exampleRepo: mockExampleRepo,
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
  title: 'Learn Spanish Greetings',
  prompt: 'Master common greetings and polite expressions in Spanish',
  subGoals: [],
  parentGoal: undefined,
  milestones: [
    {
      taskType: 'milestone',
      title: 'Practice Daily Greetings',
      prompt: 'Use Spanish greetings in daily conversations',
      evaluateAfterDoing: true
    }
  ],
  coreTasks: [
    {
      taskType: 'add-examples-to-goal',
      title: 'Add Examples to Goal',
      prompt: 'Add example sentences or phrases that demonstrate Spanish greetings in context',
      evaluateAfterDoing: false
    },
    {
      taskType: 'add-vocab-to-goal',
      title: 'Add Vocabulary',
      prompt: 'Add vocabulary words related to this goal',
      evaluateAfterDoing: false
    }
  ],
  vocab: ['vocab-1', 'vocab-2'],
  examples: ['example-1', 'example-2'],
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

// Helper function to create mock example data
const createMockExample = (overrides: Partial<ExampleData> = {}): ExampleData => ({
  id: 'example-1',
  language: 'es',
  content: 'Hola, ¿cómo estás?',
  translation: 'Hello, how are you?',
  associatedVocab: ['vocab-1'],
  associatedTasks: [],
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

export const Default: Story = {
  args: {
    goalId: 'goal-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing the task prompt and examples management interface for a Spanish greetings goal.',
      },
    },
  },
};

export const EmptyGoal: Story = {
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
              title: 'New Learning Goal',
              prompt: 'A fresh goal with no examples yet',
              examples: [],
              vocab: [],
            });
          }
        },
        exampleRepo: mockExampleRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Goal with no examples yet - shows the empty state and add form.',
      },
    },
  },
};

export const GoalWithManyExamples: Story = {
  args: {
    goalId: 'goal-many-examples',
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
              title: 'Advanced Conversation Skills',
              prompt: 'Develop fluency in complex conversational topics',
              examples: ['ex-1', 'ex-2', 'ex-3', 'ex-4', 'ex-5'],
            });
          }
        },
        exampleRepo: {
          ...mockExampleRepo,
          getExampleById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const examples = {
              'ex-1': { content: 'Me gustaría hacer una reserva para dos personas', translation: 'I would like to make a reservation for two people' },
              'ex-2': { content: '¿Podrías ayudarme con este problema?', translation: 'Could you help me with this problem?' },
              'ex-3': { content: 'Estoy interesado en aprender más sobre la cultura local', translation: 'I am interested in learning more about the local culture' },
              'ex-4': { content: 'No estoy seguro de haber entendido correctamente', translation: 'I am not sure I understood correctly' },
              'ex-5': { content: 'Me encantaría visitar ese lugar algún día', translation: 'I would love to visit that place someday' },
            };
            return createMockExample({
              id,
              language: 'es',
              ...examples[id as keyof typeof examples]
            });
          }
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Goal with multiple examples showing how the list scales with more content.',
      },
    },
  },
};

export const JapaneseGoal: Story = {
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
              title: 'Learn Japanese Politeness',
              prompt: 'Master polite expressions and honorific language in Japanese',
              examples: ['jp-1', 'jp-2'],
            });
          }
        },
        exampleRepo: {
          ...mockExampleRepo,
          getExampleById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const examples = {
              'jp-1': { content: 'すみません、お忙しいところを申し訳ございません', translation: 'Excuse me, I apologize for interrupting when you are busy' },
              'jp-2': { content: 'お疲れ様でした', translation: 'Thank you for your hard work (said when someone finishes work)' },
            };
            return createMockExample({
              id,
              language: 'ja',
              ...examples[id as keyof typeof examples]
            });
          }
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Japanese language goal demonstrating Unicode support and complex character handling.',
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
        exampleRepo: mockExampleRepo,
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