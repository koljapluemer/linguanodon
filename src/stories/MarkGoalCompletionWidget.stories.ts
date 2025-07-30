import type { Meta, StoryObj } from '@storybook/vue3';
import MarkGoalCompletionWidget from '@/features/mark-whether-goal-is-completed/MarkGoalCompletionWidget.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { TaskData } from '@/shared/TaskData';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

// Mock milestone data
const createMockMilestone = (title: string): TaskData => ({
  taskType: 'milestone',
  title,
  prompt: `Complete this milestone: ${title}`,
  evaluateAfterDoing: false,
  wantToDoAgain: true,
});

// Mock goal data with various completion states
const createMockGoal = (overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'goal-123',
  taskType: 'learning-goal',
  title: 'Learn Spanish Conversation',
  prompt: 'Master conversational Spanish for everyday situations',
  vocab: [],
  examples: [],
  subGoals: [],
  milestones: [],
  coreTasks: [],
  wantToDoAgain: true, // Default: still working on it
  isUserCreated: true,
  lastDownloadedAt: new Date(),
  ...overrides,
});

// Mock repository
const createMockGoalRepo = (): GoalRepoContract => ({
  async update(id: string, updates: Partial<GoalData>) {
    console.log(`Updated goal ${id}:`, updates);
    return createMockGoal({ ...updates, id });
  },
} as GoalRepoContract);

const meta: Meta<typeof MarkGoalCompletionWidget> = {
  title: 'Features/MarkGoalCompletionWidget',
  component: MarkGoalCompletionWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Goal completion widget for marking learning goals as completed or resuming work. Shows goal statistics (sub-goals, milestones, vocabulary, examples) and provides completion toggle. Uses wantToDoAgain flag to track completion state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goal: {
      description: 'Goal data object containing completion state and statistics',
      control: false,
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: createMockGoalRepo(),
      },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveGoal: Story = {
  args: {
    goal: createMockGoal({
      wantToDoAgain: true, // Still working on it
      subGoals: ['subgoal-1', 'subgoal-2'],
      milestones: [
        createMockMilestone('Have a 5-minute conversation'),
        createMockMilestone('Order food at a restaurant'),
      ],
      vocab: ['vocab-1', 'vocab-2', 'vocab-3'],
      examples: ['example-1'],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Active goal that user is still working on. Shows statistics and completion options.',
      },
    },
  },
};

export const CompletedGoal: Story = {
  args: {
    goal: createMockGoal({
      wantToDoAgain: false, // Completed
      subGoals: ['subgoal-1', 'subgoal-2', 'subgoal-3'],
      milestones: [
        createMockMilestone('Have a 5-minute conversation'),
        createMockMilestone('Order food at a restaurant'),
        createMockMilestone('Ask for directions'),
      ],
      vocab: ['vocab-1', 'vocab-2', 'vocab-3', 'vocab-4', 'vocab-5'],
      examples: ['example-1', 'example-2'],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal that has been marked as completed. Shows completed state with option to resume.',
      },
    },
  },
};

export const MinimalGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Learn Basic Greetings',
      prompt: 'Master hello, goodbye, and basic politeness',
      wantToDoAgain: true,
      subGoals: [],
      milestones: [],
      vocab: [],
      examples: [],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal goal with no sub-components yet. Shows zero statistics.',
      },
    },
  },
};

export const WellDevelopedGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Professional English Mastery',
      prompt: 'Achieve advanced English proficiency for business contexts',
      wantToDoAgain: true,
      subGoals: ['sub1', 'sub2', 'sub3', 'sub4'],
      milestones: [
        createMockMilestone('Lead a 30-minute meeting'),
        createMockMilestone('Write professional emails'),
        createMockMilestone('Give presentations'),
        createMockMilestone('Negotiate contracts'),
        createMockMilestone('Participate in conferences'),
      ],
      vocab: Array(25).fill(0).map((_, i) => `vocab-${i}`), // 25 vocab items
      examples: Array(12).fill(0).map((_, i) => `example-${i}`), // 12 examples
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Well-developed goal with many sub-components showing full statistics.',
      },
    },
  },
};

export const JapaneseStudyGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Intermediate Japanese Proficiency',
      prompt: 'Develop intermediate-level Japanese across all skills',
      wantToDoAgain: true,
      subGoals: ['reading', 'writing', 'listening'],
      milestones: [
        createMockMilestone('Read manga without furigana'),
        createMockMilestone('Write 300 kanji from memory'),
        createMockMilestone('Understand TV dramas'),
      ],
      vocab: Array(50).fill(0).map((_, i) => `kanji-${i}`), // 50 kanji/vocab
      examples: Array(8).fill(0).map((_, i) => `sentence-${i}`), // 8 example sentences
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese learning goal with cultural and media-focused components.',
      },
    },
  },
};

export const TechnicalGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Spanish for Software Development',
      prompt: 'Learn technical Spanish for programming contexts',
      wantToDoAgain: true,
      subGoals: ['concepts', 'debugging', 'interviews'],
      milestones: [
        createMockMilestone('Explain algorithms in Spanish'),
        createMockMilestone('Debug with Spanish error messages'),
        createMockMilestone('Conduct technical interviews'),
      ],
      vocab: Array(30).fill(0).map((_, i) => `tech-term-${i}`), // 30 technical terms
      examples: Array(15).fill(0).map((_, i) => `code-example-${i}`), // 15 code examples
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical goal focused on programming and software development vocabulary.',
      },
    },
  },
};

export const ChildLearningGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'French for Kids (Age 6-8)',
      prompt: 'Build foundational French through fun activities',
      wantToDoAgain: true,
      subGoals: ['songs', 'games'],
      milestones: [
        createMockMilestone('Sing ABC song in French'),
        createMockMilestone('Count to 20'),
        createMockMilestone('Name 10 animals'),
      ],
      vocab: Array(15).fill(0).map((_, i) => `kid-vocab-${i}`), // 15 child-appropriate words
      examples: Array(5).fill(0).map((_, i) => `kid-phrase-${i}`), // 5 simple phrases
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Child-friendly language goal with age-appropriate components and statistics.',
      },
    },
  },
};

export const ExamPreparationGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'DELE B2 Spanish Certification',
      prompt: 'Prepare for and pass DELE B2 exam',
      wantToDoAgain: true,
      subGoals: ['reading', 'writing', 'listening', 'speaking'],
      milestones: [
        createMockMilestone('Score 80%+ on practice tests'),
        createMockMilestone('Write B2-level essays'),
        createMockMilestone('Understand native audio'),
        createMockMilestone('Speak fluently for 15+ minutes'),
      ],
      vocab: Array(100).fill(0).map((_, i) => `b2-vocab-${i}`), // 100 B2-level words
      examples: Array(40).fill(0).map((_, i) => `b2-example-${i}`), // 40 example sentences
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exam preparation goal with comprehensive statistics and test-specific milestones.',
      },
    },
  },
};

export const CulturalIntegrationGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Cultural Integration Through Language',
      prompt: 'Develop deep cultural understanding with language skills',
      wantToDoAgain: false, // Recently completed
      subGoals: ['humor', 'social-norms', 'friendships'],
      milestones: [
        createMockMilestone('Understand local humor'),
        createMockMilestone('Navigate cultural sensitivity'),
        createMockMilestone('Form meaningful friendships'),
      ],
      vocab: Array(35).fill(0).map((_, i) => `cultural-term-${i}`), // 35 cultural terms
      examples: Array(20).fill(0).map((_, i) => `cultural-example-${i}`), // 20 cultural examples
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cultural integration goal that has been completed, showing completed state.',
      },
    },
  },
};

export const LargeScaleGoal: Story = {
  args: {
    goal: createMockGoal({
      title: 'Complete Language Mastery Program',
      prompt: 'Achieve native-level proficiency in all areas',
      wantToDoAgain: true,
      subGoals: Array(12).fill(0).map((_, i) => `major-area-${i}`), // 12 major areas
      milestones: Array(20).fill(0).map((_, i) => createMockMilestone(`Major milestone ${i + 1}`)), // 20 milestones
      vocab: Array(500).fill(0).map((_, i) => `advanced-vocab-${i}`), // 500 vocabulary items
      examples: Array(200).fill(0).map((_, i) => `advanced-example-${i}`), // 200 examples
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Large-scale comprehensive goal with extensive statistics and components.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    goal: createMockGoal({
      wantToDoAgain: true,
      subGoals: ['demo-sub'],
      milestones: [createMockMilestone('Demo milestone')],
      vocab: ['demo-vocab'],
      examples: ['demo-example'],
    }),
  },
  play: async () => {
    console.log('Interactive demo ready - try marking goal as completed or resuming work');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing goal completion toggle functionality.',
      },
    },
  },
};