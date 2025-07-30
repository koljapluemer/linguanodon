import type { Meta, StoryObj } from '@storybook/vue3';
import ManageSubGoalsWidget from '@/features/manage-sub-goals-of-goal/ManageSubGoalsWidget.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';

// Mock sub-goal data
const createMockSubGoal = (id: string, title: string, parentId: string): GoalData => ({
  id,
  taskType: 'complete-goal',
  title,
  prompt: title,
  parentGoal: parentId,
  subGoals: [],
  milestones: [],
  coreTasks: [],
  vocab: [],
  examples: [],
  wantToDoAgain: true,
  isUserCreated: true,
  lastDownloadedAt: new Date(),
});

// Mock main goal data
const createMockGoal = (subGoalIds: string[] = [], overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'goal-123',
  taskType: 'learning-goal',
  title: 'Learn Spanish Conversation',
  prompt: 'Master conversational Spanish for everyday situations',
  vocab: [],
  examples: [],
  subGoals: subGoalIds,
  milestones: [],
  coreTasks: [
    {
      taskType: 'add-sub-goals',
      title: 'Add Sub-Goals',
      prompt: 'Break down this goal into smaller, manageable steps',
    },
  ],
  isUserCreated: true,
  lastDownloadedAt: new Date(),
  ...overrides,
});

// Mock repository
const createMockGoalRepo = (subGoalList: GoalData[] = []): GoalRepoContract => ({
  async getById(id: string) {
    return subGoalList.find(sg => sg.id === id) || null;
  },
  
  async create(goal: Partial<GoalData>) {
    const newGoal = createMockSubGoal(
      'subgoal-' + Date.now(),
      goal.title || 'New Sub-Goal',
      goal.parentGoal || 'goal-123'
    );
    console.log('Created new sub-goal:', newGoal);
    return newGoal;
  },
  
  async update(id: string, updates: Partial<GoalData>) {
    console.log(`Updated goal ${id}:`, updates);
    const existingGoal = subGoalList.find(sg => sg.id === id) || createMockGoal();
    return { ...existingGoal, ...updates };
  },
  
  async delete(id: string) {
    console.log(`Deleted goal: ${id}`);
  },
} as GoalRepoContract);

const meta: Meta<typeof ManageSubGoalsWidget> = {
  title: 'Features/ManageSubGoalsWidget',
  component: ManageSubGoalsWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Sub-goal management widget for breaking down learning goals into smaller, manageable steps. Allows creating, editing, and removing hierarchical sub-goals that contribute to the main learning objective. Supports goal decomposition and progress tracking.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goal: {
      description: 'Goal data object containing sub-goal relationships',
      control: false,
    },
  },
  decorators: [
    (story, context) => {
      const subGoalList = context.args.subGoalList || [];
      
      return {
        components: { story },
        provide: {
          goalRepo: createMockGoalRepo(subGoalList),
        },
        template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
      };
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptySubGoals: Story = {
  args: {
    goal: createMockGoal([]),
    subGoalList: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with no sub-goals yet. Shows empty state and add sub-goal form.',
      },
    },
  },
};

export const BasicSpanishSubGoals: Story = {
  args: {
    goal: createMockGoal(['subgoal-1', 'subgoal-2', 'subgoal-3']),
    subGoalList: [
      createMockSubGoal('subgoal-1', 'greet people in common situations', 'goal-123'),
      createMockSubGoal('subgoal-2', 'order food at restaurants', 'goal-123'),
      createMockSubGoal('subgoal-3', 'ask for directions and understand responses', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish conversation goal broken down into practical sub-goals.',
      },
    },
  },
};

export const BusinessEnglishSubGoals: Story = {
  args: {
    goal: createMockGoal(['business-1', 'business-2', 'business-3', 'business-4'], {
      title: 'Professional English Mastery',
      prompt: 'Achieve advanced English proficiency for business contexts',
    }),
    subGoalList: [
      createMockSubGoal('business-1', 'write professional emails without errors', 'goal-123'),
      createMockSubGoal('business-2', 'participate confidently in meetings', 'goal-123'),
      createMockSubGoal('business-3', 'give presentations to international audiences', 'goal-123'),
      createMockSubGoal('business-4', 'negotiate contracts and agreements', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Business English goal with professional skill-based sub-goals.',
      },
    },
  },
};

export const JapaneseStudySubGoals: Story = {
  args: {
    goal: createMockGoal(['japanese-1', 'japanese-2', 'japanese-3'], {
      title: 'Intermediate Japanese Proficiency',
      prompt: 'Develop intermediate-level Japanese skills across all areas',
    }),
    subGoalList: [
      createMockSubGoal('japanese-1', 'read and understand manga without furigana', 'goal-123'),
      createMockSubGoal('japanese-2', 'write 300 kanji from memory with correct stroke order', 'goal-123'),
      createMockSubGoal('japanese-3', 'understand Japanese TV dramas at normal speed', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese learning goal with culture and media-focused sub-goals.',
      },
    },
  },
};

export const AcademicGermanSubGoals: Story = {
  args: {
    goal: createMockGoal(['academic-1', 'academic-2', 'academic-3'], {
      title: 'German for University Studies',
      prompt: 'Achieve academic-level German for higher education',
    }),
    subGoalList: [
      createMockSubGoal('academic-1', 'read academic papers in my field with full comprehension', 'goal-123'),
      createMockSubGoal('academic-2', 'write research papers with proper academic style', 'goal-123'),
      createMockSubGoal('academic-3', 'participate actively in university seminars and discussions', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Academic German goal with scholarly and research-focused sub-goals.',
      },
    },
  },
};

export const TechnicalSubGoals: Story = {
  args: {
    goal: createMockGoal(['tech-1', 'tech-2', 'tech-3'], {
      title: 'Spanish for Software Development',
      prompt: 'Learn technical Spanish for programming and IT contexts',
    }),
    subGoalList: [
      createMockSubGoal('tech-1', 'explain programming concepts in Spanish', 'goal-123'),
      createMockSubGoal('tech-2', 'debug code with Spanish error messages and documentation', 'goal-123'),
      createMockSubGoal('tech-3', 'conduct technical interviews and code reviews in Spanish', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical vocabulary goal with programming-specific sub-goals.',
      },
    },
  },
};

export const ProgressiveSkillSubGoals: Story = {
  args: {
    goal: createMockGoal(['progressive-1', 'progressive-2', 'progressive-3', 'progressive-4'], {
      title: 'French Language Journey',
      prompt: 'Progress from beginner to advanced French proficiency',
    }),
    subGoalList: [
      createMockSubGoal('progressive-1', 'have basic survival conversations (A2 level)', 'goal-123'),
      createMockSubGoal('progressive-2', 'discuss complex topics and express opinions (B1 level)', 'goal-123'),
      createMockSubGoal('progressive-3', 'understand native speakers in natural contexts (B2 level)', 'goal-123'),
      createMockSubGoal('progressive-4', 'express myself fluently and spontaneously (C1 level)', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Progressive language learning with CEFR level-based sub-goals.',
      },
    },
  },
};

export const CulturalIntegrationSubGoals: Story = {
  args: {
    goal: createMockGoal(['cultural-1', 'cultural-2', 'cultural-3'], {
      title: 'Cultural Integration Through Language',
      prompt: 'Develop deep cultural understanding alongside language skills',
    }),
    subGoalList: [
      createMockSubGoal('cultural-1', 'understand and appreciate local humor and cultural references', 'goal-123'),
      createMockSubGoal('cultural-2', 'navigate social situations with appropriate cultural sensitivity', 'goal-123'),
      createMockSubGoal('cultural-3', 'form meaningful friendships with native speakers', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Cultural integration goal with social and interpersonal sub-goals.',
      },
    },
  },
};

export const ComplexLongSubGoals: Story = {
  args: {
    goal: createMockGoal(['complex-1', 'complex-2'], {
      title: 'Advanced Professional Communication',
      prompt: 'Master sophisticated communication for senior professional roles',
    }),
    subGoalList: [
      createMockSubGoal('complex-1', 'successfully lead cross-cultural teams through complex projects while managing conflicting viewpoints and maintaining team cohesion', 'goal-123'),
      createMockSubGoal('complex-2', 'deliver compelling presentations to C-level executives that influence strategic business decisions and secure budget approval for international initiatives', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex sub-goals with very long descriptions to test text wrapping and layout.',
      },
    },
  },
};

export const ChildLearningSubGoals: Story = {
  args: {
    goal: createMockGoal(['child-1', 'child-2', 'child-3'], {
      title: 'Spanish for Young Learners (Age 8-10)',
      prompt: 'Build foundational Spanish skills through fun, age-appropriate activities',
    }),
    subGoalList: [
      createMockSubGoal('child-1', 'sing simple songs and nursery rhymes in Spanish', 'goal-123'),
      createMockSubGoal('child-2', 'play games with Spanish-speaking children', 'goal-123'),
      createMockSubGoal('child-3', 'read picture books and understand the main story', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Child-friendly language goal with age-appropriate sub-goals.',
      },
    },
  },
};

export const ExamPreparationSubGoals: Story = {
  args: {
    goal: createMockGoal(['exam-1', 'exam-2', 'exam-3', 'exam-4'], {
      title: 'DELE B2 Spanish Certification',
      prompt: 'Prepare for and pass the DELE B2 Spanish proficiency exam',
    }),
    subGoalList: [
      createMockSubGoal('exam-1', 'score 80%+ on reading comprehension practice tests', 'goal-123'),
      createMockSubGoal('exam-2', 'write well-structured essays meeting B2 criteria', 'goal-123'),
      createMockSubGoal('exam-3', 'understand audio passages at normal native speed', 'goal-123'),
      createMockSubGoal('exam-4', 'speak fluently for 15+ minutes on various topics', 'goal-123'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Exam preparation goal with test-specific skill sub-goals.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    goal: createMockGoal(['loading-subgoal']),
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        goalRepo: {
          async getById() {
            // Simulate long loading
            await new Promise(resolve => setTimeout(resolve, 10000));
            return createMockSubGoal('loading-subgoal', 'Loading sub-goal', 'goal-123');
          },
          async create(goal: Partial<GoalData>) { return createMockSubGoal('new', goal.title || 'New', 'goal-123'); },
          async update() { return createMockGoal(); },
          async delete() {},
        } as GoalRepoContract,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching sub-goal data.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    goal: createMockGoal(['demo-subgoal']),
    subGoalList: [
      createMockSubGoal('demo-subgoal', 'interactive sub-goal example', 'goal-123'),
    ],
  },
  play: async () => {
    console.log('Interactive demo ready - try adding, editing, and removing sub-goals');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing sub-goal management functionality.',
      },
    },
  },
};