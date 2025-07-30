import type { Meta, StoryObj } from '@storybook/vue3';
import TaskAddSubGoals from '@/widgets/TaskAddSubGoals.vue';
import type { GoalData } from '@/entities/goals/GoalData';

// Mock goal repository for Storybook
const mockGoalRepo = {
  getById: async (id: string) => {
    console.log(`Getting goal with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return different goals based on ID for sub-goals
    if (id.startsWith('sub-goal-')) {
      return createMockSubGoal({
        id,
        title: id === 'sub-goal-1' ? 'Count to 10' : 
               id === 'sub-goal-2' ? 'Learn basic colors' :
               id === 'sub-goal-3' ? 'Master greetings' : 'Practice pronunciation',
        parentGoal: 'goal-1'
      });
    }
    
    return createMockGoal({ id });
  },
  update: async (id: string, updates: Partial<GoalData>) => {
    console.log(`Updating goal ${id}:`, updates);
    await new Promise(resolve => setTimeout(resolve, 800));
    const goal = id.startsWith('sub-goal-') ? 
      createMockSubGoal({ id, parentGoal: 'goal-1' }) : 
      createMockGoal({ id });
    return { ...goal, ...updates };
  },
  create: async (goalData: Partial<GoalData>) => {
    console.log('Creating sub-goal:', goalData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return createMockSubGoal({
      id: `sub-goal-${Date.now()}`,
      ...goalData
    });
  },
  delete: async (id: string) => {
    console.log(`Deleting goal ${id}`);
    await new Promise(resolve => setTimeout(resolve, 600));
  }
};

const meta: Meta<typeof TaskAddSubGoals> = {
  title: 'Widgets/TaskAddSubGoals',
  component: TaskAddSubGoals,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for adding sub-goals to a learning goal. Allows users to break down larger goals into smaller, more manageable sub-goals. Shows the parent goal prominently and provides an interface to add, edit, and remove sub-goals.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goalId: {
      description: 'Unique identifier for the goal to add sub-goals to',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: mockGoalRepo,
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
  title: 'Learn Basic Spanish',
  prompt: 'Master fundamental Spanish vocabulary and phrases for everyday conversation',
  description: 'This goal covers essential Spanish skills including numbers, colors, greetings, and basic conversational phrases. Perfect for beginners starting their Spanish learning journey.',
  subGoals: ['sub-goal-1', 'sub-goal-2'],
  parentGoal: undefined,
  milestones: [
    {
      taskType: 'milestone',
      title: 'Have a 2-minute conversation in Spanish',
      prompt: 'Complete this milestone: Have a 2-minute conversation in Spanish',
      evaluateAfterDoing: false,
      wantToDoAgain: true
    }
  ],
  coreTasks: [
    {
      taskType: 'add-sub-goals',
      title: 'Add Sub-Goals',
      prompt: 'Break down this goal into smaller, more specific learning objectives',
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
  examples: ['example-1'],
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

// Helper function to create mock sub-goal data
const createMockSubGoal = (overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'sub-goal-1',
  taskType: 'complete-goal',
  title: 'Count to 10',
  prompt: 'Count to 10',
  subGoals: [],
  parentGoal: 'goal-1',
  milestones: [],
  coreTasks: [],
  vocab: [],
  examples: [],
  isUserCreated: true,
  lastDownloadedAt: null,
  wantToDoAgain: true,
  ...overrides,
});

export const Default: Story = {
  args: {
    goalId: 'goal-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing the parent goal and its existing sub-goals with management interface.',
      },
    },
  },
};

export const EmptySubGoals: Story = {
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
              title: 'Master French Pronunciation',
              prompt: 'Develop clear and accurate French pronunciation skills',
              description: 'Focus on mastering French phonetics, accent patterns, and speaking rhythm.',
              subGoals: [],
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
        story: 'Goal with no sub-goals yet - shows the empty state and add form.',
      },
    },
  },
};

export const GoalWithManySubGoals: Story = {
  args: {
    goalId: 'goal-many-subgoals',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          ...mockGoalRepo,
          getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (id.startsWith('sub-goal-advanced-')) {
              const subGoalTitles = {
                'sub-goal-advanced-1': 'Master business vocabulary',
                'sub-goal-advanced-2': 'Understand cultural references',
                'sub-goal-advanced-3': 'Use idiomatic expressions naturally',
                'sub-goal-advanced-4': 'Discuss complex topics fluently',
                'sub-goal-advanced-5': 'Read literature without translation'
              };
              return createMockSubGoal({
                id,
                title: subGoalTitles[id as keyof typeof subGoalTitles] || 'Advanced sub-goal',
                parentGoal: 'goal-many-subgoals'
              });
            }
            
            return createMockGoal({
              id,
              title: 'Achieve Advanced Spanish Fluency',
              prompt: 'Reach near-native proficiency in Spanish language skills',
              description: 'This comprehensive goal aims to develop advanced Spanish skills including professional communication, cultural understanding, and literary appreciation.',
              subGoals: ['sub-goal-advanced-1', 'sub-goal-advanced-2', 'sub-goal-advanced-3', 'sub-goal-advanced-4', 'sub-goal-advanced-5'],
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
        story: 'Goal with multiple sub-goals showing how the interface scales with more content.',
      },
    },
  },
};

export const GermanLearningGoal: Story = {
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
            
            if (id.startsWith('sub-goal-german-')) {
              const subGoalTitles = {
                'sub-goal-german-1': 'Die Artikel (der, die, das) richtig verwenden',
                'sub-goal-german-2': 'Perfekt mit haben und sein bilden'
              };
              return createMockSubGoal({
                id,
                title: subGoalTitles[id as keyof typeof subGoalTitles] || 'German sub-goal',
                parentGoal: 'goal-german'
              });
            }
            
            return createMockGoal({
              id,
              title: 'Deutsche Grammatik verstehen',
              prompt: 'Master German grammar rules and sentence structure',
              description: 'Comprehensive understanding of German grammatical concepts including cases, verb conjugations, and sentence construction.',
              subGoals: ['sub-goal-german-1', 'sub-goal-german-2'],
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
        story: 'German language goal demonstrating Unicode support and German-specific learning objectives.',
      },
    },
  },
};

export const JapaneseLearningGoal: Story = {
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
            
            if (id.startsWith('sub-goal-jp-')) {
              const subGoalTitles = {
                'sub-goal-jp-1': 'ひらがなを覚える',
                'sub-goal-jp-2': 'カタカナを覚える',
                'sub-goal-jp-3': '基本的な漢字を学ぶ'
              };
              return createMockSubGoal({
                id,
                title: subGoalTitles[id as keyof typeof subGoalTitles] || 'Japanese sub-goal',
                parentGoal: 'goal-japanese'
              });
            }
            
            return createMockGoal({
              id,
              title: '日本語の文字システムをマスターする',
              prompt: 'Master Japanese writing systems (hiragana, katakana, kanji)',
              description: 'Learn to read and write using all three Japanese writing systems effectively.',
              subGoals: ['sub-goal-jp-1', 'sub-goal-jp-2', 'sub-goal-jp-3'],
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
        story: 'Japanese language goal demonstrating full Unicode support with Japanese characters in both parent and sub-goals.',
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