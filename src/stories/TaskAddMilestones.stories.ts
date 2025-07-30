import type { Meta, StoryObj } from '@storybook/vue3';
import TaskAddMilestones from '@/widgets/TaskAddMilestones.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { TaskData } from '@/shared/TaskData';

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
  }
};

const meta: Meta<typeof TaskAddMilestones> = {
  title: 'Widgets/TaskAddMilestones',
  component: TaskAddMilestones,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for adding milestones to a learning goal. Combines a task prompt with a milestones management interface, allowing users to add, edit, and remove specific milestones that track progress toward the goal.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goalId: {
      description: 'Unique identifier for the goal to add milestones to',
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
  title: 'Learn French Numbers',
  prompt: 'Master counting and number-related vocabulary in French',
  subGoals: [],
  parentGoal: undefined,
  milestones: [
    {
      taskType: 'milestone',
      title: 'Count from 1 to 20 without hesitation',
      prompt: 'Complete this milestone: Count from 1 to 20 without hesitation',
      evaluateAfterDoing: false,
      wantToDoAgain: true
    },
    {
      taskType: 'milestone',
      title: 'Tell time using French numbers',
      prompt: 'Complete this milestone: Tell time using French numbers',
      evaluateAfterDoing: false,
      wantToDoAgain: true
    }
  ],
  coreTasks: [
    {
      taskType: 'add-milestones',
      title: 'Add Milestones',
      prompt: 'Add specific milestones to track your progress toward mastering French numbers',
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

export const Default: Story = {
  args: {
    goalId: 'goal-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing the task prompt and milestones management interface for a French numbers goal.',
      },
    },
  },
};

export const EmptyMilestones: Story = {
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
              prompt: 'A fresh goal with no milestones yet',
              milestones: [],
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
        story: 'Goal with no milestones yet - shows the empty state and add form.',
      },
    },
  },
};

export const GoalWithManyMilestones: Story = {
  args: {
    goalId: 'goal-many-milestones',
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
              title: 'Master Spanish Conversation',
              prompt: 'Develop fluency in everyday Spanish conversations',
              milestones: [
                {
                  taskType: 'milestone',
                  title: 'Have a 5-minute conversation with a native speaker',
                  prompt: 'Complete this milestone: Have a 5-minute conversation with a native speaker',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                },
                {
                  taskType: 'milestone',
                  title: 'Order food at a restaurant in Spanish',
                  prompt: 'Complete this milestone: Order food at a restaurant in Spanish',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                },
                {
                  taskType: 'milestone',
                  title: 'Ask for directions and understand the response',
                  prompt: 'Complete this milestone: Ask for directions and understand the response',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                },
                {
                  taskType: 'milestone',
                  title: 'Discuss your hobbies and interests',
                  prompt: 'Complete this milestone: Discuss your hobbies and interests',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                },
                {
                  taskType: 'milestone',
                  title: 'Watch a 30-minute Spanish TV show without subtitles',
                  prompt: 'Complete this milestone: Watch a 30-minute Spanish TV show without subtitles',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                }
              ],
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
        story: 'Goal with multiple milestones showing how the list scales with more content.',
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
            return createMockGoal({
              id,
              title: 'Deutsche Grammatik meistern',
              prompt: 'Master German grammar rules and sentence structure',
              milestones: [
                {
                  taskType: 'milestone',
                  title: 'Correctly use der/die/das articles in 10 sentences',
                  prompt: 'Complete this milestone: Correctly use der/die/das articles in 10 sentences',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                },
                {
                  taskType: 'milestone',
                  title: 'Form perfect tense with haben and sein verbs',
                  prompt: 'Complete this milestone: Form perfect tense with haben and sein verbs',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                }
              ],
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
        story: 'German language goal demonstrating grammar-focused milestones with German text.',
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
            return createMockGoal({
              id,
              title: 'ひらがなとカタカナを覚える',
              prompt: 'Master hiragana and katakana writing systems',
              milestones: [
                {
                  taskType: 'milestone',
                  title: 'Write all 46 hiragana characters from memory',
                  prompt: 'Complete this milestone: Write all 46 hiragana characters from memory',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                },
                {
                  taskType: 'milestone',
                  title: 'Read a simple Japanese children\'s book',
                  prompt: 'Complete this milestone: Read a simple Japanese children\'s book',
                  evaluateAfterDoing: false,
                  wantToDoAgain: true
                }
              ],
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
        story: 'Japanese language goal demonstrating Unicode support with Japanese characters in both title and milestones.',
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