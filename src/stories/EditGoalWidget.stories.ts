import type { Meta, StoryObj } from '@storybook/vue3';
import EditGoalWidget from '@/features/edit-goal/EditGoalWidget.vue';
import type { GoalData } from '@/entities/goals/GoalData';

// Mock goal repository for Storybook
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
  },
  create: async (goalData: Partial<GoalData>) => {
    console.log('Creating new goal:', goalData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return createMockGoal({
      id: `goal-${Date.now()}`,
      ...goalData
    });
  }
};

const meta: Meta<typeof EditGoalWidget> = {
  title: 'Features/EditGoalWidget',
  component: EditGoalWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for editing goal title and prompt. Provides a simple form with automatic saving on blur or enter key. Used for both creating new goals and updating existing ones.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goal: {
      description: 'Goal data object to edit',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: mockGoalRepo,
      },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create mock goal data
const createMockGoal = (overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'goal-1',
  taskType: 'complete-goal',
  title: 'Learn Spanish Conversational Skills',
  prompt: 'Master basic conversational Spanish for travel and daily interactions',
  subGoals: [],
  parentGoal: undefined,
  milestones: [
    {
      taskType: 'milestone',
      title: 'Complete Basic Vocabulary',
      prompt: 'Learn 100 common Spanish words and phrases',
      evaluateAfterDoing: true
    }
  ],
  coreTasks: [
    {
      taskType: 'add-examples-to-goal',
      title: 'Add Examples to Goal',
      prompt: 'Add example sentences or phrases that demonstrate conversational skills',
      evaluateAfterDoing: false
    }
  ],
  vocab: ['vocab-1', 'vocab-2'],
  examples: ['example-1', 'example-2'],
  isUserCreated: true,
  lastDownloadedAt: null,
  wantToDoAgain: true,
  ...overrides,
});

export const Default: Story = {
  args: {
    goal: createMockGoal(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default goal editing form with existing Spanish goal data. Form auto-saves on blur or enter.',
      },
    },
  },
};

export const EmptyGoal: Story = {
  args: {
    goal: createMockGoal({
      title: '',
      prompt: '',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty goal form for creating a new goal from scratch.',
      },
    },
  },
};

export const ShortGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Practice pronunciation',
      prompt: '',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple goal with just a title and no additional details.',
      },
    },
  },
};

export const DetailedGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Master French business communication',
      prompt: 'Develop professional-level French language skills for business meetings, emails, presentations, and networking events. Focus on formal register, industry-specific vocabulary, and cultural nuances in professional settings.',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with detailed prompt showing how longer text is handled in the textarea.',
      },
    },
  },
};

export const JapaneseGoal: Story = {
  args: {
    goal: createMockGoal({
      title: '日本語の会話スキルを向上させる',
      prompt: '日常会話から敬語まで、様々な場面で使える日本語会話能力を身につける。特に、ビジネス場面や友達との会話で自然に話せるようになることを目指す。',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese language goal demonstrating Unicode support and proper handling of complex characters.',
      },
    },
  },
};

export const GermanGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Deutsche Grammatik verstehen und anwenden',
      prompt: 'Die komplexe deutsche Grammatik beherrschen, einschließlich der vier Fälle, Konjunktionen und Zeitformen. Besondere Aufmerksamkeit auf die korrekte Verwendung von Artikeln und Adjektivdeklinationen.',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'German language goal with focus on grammar and complex linguistic structures.',
      },
    },
  },
};

export const LongTitle: Story = {
  args: {
    goal: createMockGoal({
      title: 'Develop comprehensive multilingual communication skills across Spanish, French, and Italian for professional, academic, and personal contexts',
      prompt: 'A very comprehensive goal that spans multiple languages and contexts, requiring advanced planning and structured learning approach.',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with a very long title to test text wrapping and input field behavior.',
      },
    },
  },
};

export const NewGoalCreation: Story = {
  args: {
    goal: createMockGoal({
      id: '', // No ID indicates new goal
      title: '',
      prompt: '',
    }),
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          create: async (goalData: Partial<GoalData>) => {
            console.log('Creating brand new goal:', goalData);
            await new Promise(resolve => setTimeout(resolve, 1200));
            return createMockGoal({
              id: `new-goal-${Date.now()}`,
              title: goalData.title || 'New Goal',
              prompt: goalData.prompt || goalData.title || 'New Goal',
              ...goalData
            });
          }
        },
      },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Creating a completely new goal. The form will call the create method instead of update.',
      },
    },
  },
};

export const SaveError: Story = {
  args: {
    goal: createMockGoal({
      title: 'Goal that will fail to save',
      prompt: 'This goal will encounter a save error for testing purposes',
    }),
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          update: async (id: string, updates: Partial<GoalData>) => {
            console.log(`Attempting to update goal ${id}:`, updates);
            await new Promise(resolve => setTimeout(resolve, 1000));
            throw new Error('Failed to save goal - network error');
          }
        },
      },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Goal that will encounter an error when trying to save. Try editing the title or prompt to see error handling.',
      },
    },
  },
};

export const SlowSaving: Story = {
  args: {
    goal: createMockGoal({
      title: 'Slow saving goal',
      prompt: 'This goal will take a while to save, showing the saving indicator',
    }),
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          update: async (id: string, updates: Partial<GoalData>) => {
            console.log(`Slowly updating goal ${id}:`, updates);
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
            const goal = createMockGoal({ id });
            return { ...goal, ...updates };
          }
        },
      },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Goal with slow saving to demonstrate the saving indicator. Edit the title or prompt to see the "Saving..." text.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    goal: createMockGoal({
      title: 'Interactive Demo Goal',
      prompt: 'Try editing this goal to see the auto-save functionality in action',
    }),
  },
  play: async ({ canvasElement }) => {
    console.log('Interactive demo ready - try editing the title or prompt to see auto-saving');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing form functionality. Try editing the title or prompt and notice the auto-save behavior.',
      },
    },
  },
};