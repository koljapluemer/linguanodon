import type { Meta, StoryObj } from '@storybook/vue3';
import ManageMilestonesWidget from '@/features/manage-milestones/ManageMilestonesWidget.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { TaskData } from '@/shared/TaskData';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

// Mock milestone data
const createMockMilestone = (title: string, completed: boolean = false): TaskData => ({
  taskType: 'milestone',
  title,
  prompt: `Complete this milestone: ${title}`,
  evaluateAfterDoing: false,
  wantToDoAgain: !completed,
  lastShownAt: completed ? new Date(Date.now() - 24 * 60 * 60 * 1000) : undefined, // Yesterday if completed
  lastDifficultyRating: completed ? 3 : undefined,
  lastCorrectnessRating: completed ? 4 : undefined,
});

// Mock goal data with milestones
const createMockGoal = (milestones: TaskData[] = [], overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'goal-123',
  taskType: 'learning-goal',
  title: 'Learn Spanish Conversation',
  prompt: 'Master basic Spanish conversation skills',
  vocab: [],
  examples: [],
  subGoals: [],
  milestones,
  coreTasks: [
    {
      taskType: 'add-milestones',
      title: 'Add Milestones',
      prompt: 'Set specific, measurable milestones for this goal',
    },
  ],
  isUserCreated: true,
  lastDownloadedAt: new Date(),
  ...overrides,
});

// Mock repository
const createMockGoalRepo = (): GoalRepoContract => ({
  async update(id: string, updates: Partial<GoalData>) {
    console.log(`Updated goal ${id}:`, updates);
    return createMockGoal(updates.milestones || [], updates);
  },
} as GoalRepoContract);

const meta: Meta<typeof ManageMilestonesWidget> = {
  title: 'Features/ManageMilestonesWidget',
  component: ManageMilestonesWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Milestone management widget for learning goals. Allows adding, editing, and removing specific measurable milestones that define goal completion criteria. Milestones should be concrete, actionable tasks that demonstrate progress.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goal: {
      description: 'Goal data object containing milestone information',
      control: false,
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: createMockGoalRepo(),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyMilestones: Story = {
  args: {
    goal: createMockGoal([]),
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with no milestones yet. Shows empty state and add milestone form.',
      },
    },
  },
};

export const BasicSpanishMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Have a 5-minute conversation with a native speaker'),
      createMockMilestone('Order food at a restaurant without English'),
      createMockMilestone('Ask for directions and understand the response'),
    ]),
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish conversation goal with practical, measurable milestones.',
      },
    },
  },
};

export const BusinessEnglishMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Lead a 30-minute meeting entirely in English'),
      createMockMilestone('Write a professional email without translation tools'),
      createMockMilestone('Present quarterly results to international team'),
      createMockMilestone('Negotiate a contract with English-speaking client'),
    ], {
      title: 'Business English Proficiency',
      prompt: 'Achieve professional-level English for business contexts',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Business English goal with professional milestones and workplace scenarios.',
      },
    },
  },
};

export const JapaneseLearningMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Read a simple manga chapter without dictionary'),
      createMockMilestone('Write 50 kanji from memory'),
      createMockMilestone('Have a phone conversation lasting 10 minutes'),
      createMockMilestone('Watch a Japanese drama episode with Japanese subtitles'),
    ], {
      title: 'Intermediate Japanese Skills',
      prompt: 'Develop intermediate Japanese reading, writing, and listening skills',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese learning goal with cultural and media-based milestones.',
      },
    },
  },
};

export const AcademicGermanMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Read and summarize a 10-page academic paper'),
      createMockMilestone('Participate in a university seminar discussion'),
      createMockMilestone('Write a 500-word essay on German history'),
      createMockMilestone('Pass TestDaF with score of 4 in all sections'),
    ], {
      title: 'Academic German Proficiency',
      prompt: 'Achieve academic-level German for university studies',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Academic German goal with formal assessment and scholarly milestones.',
      },
    },
  },
};

export const TechnicalVocabularyMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Explain a programming concept in Spanish'),
      createMockMilestone('Debug code with Spanish error messages'),
      createMockMilestone('Participate in Spanish-language tech forum'),
      createMockMilestone('Give a 15-minute technical presentation'),
    ], {
      title: 'Spanish for Software Development',
      prompt: 'Learn technical Spanish vocabulary for programming',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical vocabulary goal with programming and development milestones.',
      },
    },
  },
};

export const ConversationalMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Tell a funny story in the target language'),
      createMockMilestone('Disagree politely in a discussion'),
      createMockMilestone('Express complex emotions and feelings'),
      createMockMilestone('Use idioms naturally in conversation'),
      createMockMilestone('Switch between formal and informal registers'),
    ], {
      title: 'Advanced Conversation Skills',
      prompt: 'Master nuanced conversation and emotional expression',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced conversation goal with nuanced communication milestones.',
      },
    },
  },
};

export const ChildLanguageMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Sing the ABC song in French'),
      createMockMilestone('Count to 20 out loud'),
      createMockMilestone('Name 10 animals and their sounds'),
      createMockMilestone('Ask "Where is the bathroom?" politely'),
      createMockMilestone('Say please and thank you automatically'),
    ], {
      title: 'French for Kids (Age 6-8)',
      prompt: 'Basic French skills for young learners',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Child-friendly language goal with age-appropriate milestones.',
      },
    },
  },
};

export const LongComplexMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Successfully complete a comprehensive job interview entirely in the target language, including technical questions about your field, salary negotiations, and cultural fit discussions, while maintaining professional demeanor throughout'),
      createMockMilestone('Write and publish a detailed blog post of at least 1000 words on a complex topic in your field, demonstrating advanced vocabulary, proper grammar, and cultural awareness'),
      createMockMilestone('Serve as a volunteer translator for a community organization for at least 3 months, helping non-native speakers navigate important services like healthcare, legal aid, or education'),
    ], {
      title: 'Professional Language Mastery',
      prompt: 'Achieve native-level proficiency for professional contexts',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex milestones with very long descriptions to test text wrapping and layout.',
      },
    },
  },
};

export const MilestonesWithDifferentComplexity: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Say hello', true), // Simple, completed
      createMockMilestone('Order coffee at a café'), // Simple, not completed
      createMockMilestone('Discuss current events for 20 minutes'), // Medium complexity
      createMockMilestone('Understand and explain abstract philosophical concepts'), // Complex
      createMockMilestone('Mentor someone else learning the language'), // Advanced/Meta
    ], {
      title: 'Progressive Language Journey',
      prompt: 'Milestones of increasing difficulty and complexity',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Milestones showing progression from simple to complex language tasks.',
      },
    },
  },
};

export const CulturalIntegrationMilestones: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Understand and laugh at local humor and jokes'),
      createMockMilestone('Navigate cultural taboos and sensitive topics appropriately'),
      createMockMilestone('Participate in traditional cultural celebrations'),
      createMockMilestone('Form genuine friendships with native speakers'),
      createMockMilestone('Feel comfortable consuming media without translation'),
    ], {
      title: 'Cultural Integration Through Language',
      prompt: 'Develop deep cultural understanding alongside language skills',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cultural integration milestones focusing on social and cultural competency.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    goal: createMockGoal([
      createMockMilestone('Interactive milestone example'),
    ]),
  },
  play: async () => {
    console.log('Interactive demo ready - try adding, editing, and removing milestones');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing milestone management functionality.',
      },
    },
  },
};