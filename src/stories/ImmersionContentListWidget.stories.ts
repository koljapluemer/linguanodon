import type { Meta, StoryObj } from '@storybook/vue3';
import ImmersionContentListWidget from '@/features/immersion-content-list/ImmersionContentListWidget.vue';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

// Mock immersion content data
const createMockContent = (uid: string, title: string, language: string, priority: number = 3, vocabIds: string[] = []): ImmersionContentData => ({
  uid,
  language,
  taskType: 'immersion-content',
  title,
  prompt: `Practice ${language} with this content: ${title}`,
  priority,
  associatedUnits: vocabIds,
  evaluateAfterDoing: true,
  lastShownAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
  wantToDoAgain: Math.random() > 0.3,
  nextShownEarliestAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within next week
  lastDifficultyRating: Math.floor(Math.random() * 5) + 1,
  lastCorrectnessRating: Math.floor(Math.random() * 5) + 1,
  isUserCreated: Math.random() > 0.5,
  lastDownloadedAt: Math.random() > 0.5 ? new Date() : null,
});

// Mock vocabulary for readiness calculation
const createMockVocab = (id: string, isTopOfMind: boolean = false): VocabData => ({
  id,
  language: 'es',
  content: `vocab-${id}`,
  priority: 1,
  doNotPractice: false,
  notes: [],
  translations: [],
  links: [],
  associatedTasks: [],
  progress: {
    level: isTopOfMind ? 3 : 1,
    streak: isTopOfMind ? 5 : 1,
    due: isTopOfMind ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date(), // Due tomorrow vs now
    stability: isTopOfMind ? 10 : 2,
    difficulty: isTopOfMind ? 3 : 6,
    elapsed_days: isTopOfMind ? 5 : 0,
    scheduled_days: isTopOfMind ? 7 : 1,
    reps: isTopOfMind ? 8 : 1,
    lapses: 0,
    state: isTopOfMind ? 2 : 0, // Learning vs New
    last_review: isTopOfMind ? new Date(Date.now() - 5 * 60 * 60 * 1000) : new Date(), // 5 hours ago vs now
  },
});

// Content collections for different scenarios
const basicSpanishContent = [
  createMockContent('content-1', 'Spanish News Article: Climate Change', 'es', 4, ['vocab-1', 'vocab-2']),
  createMockContent('content-2', 'Podcast: Spanish History', 'es', 3, ['vocab-3', 'vocab-4']),
  createMockContent('content-3', 'Recipe: Paella Valenciana', 'es', 2, ['vocab-5']),
];

const multiLanguageContent = [
  createMockContent('content-es', 'El Quixote - Chapter 1', 'es', 5, ['vocab-es-1', 'vocab-es-2']),
  createMockContent('content-ja', '日本の文化について', 'ja', 4, ['vocab-ja-1']),
  createMockContent('content-de', 'Deutsche Wirtschaftsnachrichten', 'de', 3, ['vocab-de-1', 'vocab-de-2']),
  createMockContent('content-ar', 'الأدب العربي الحديث', 'ar', 4, ['vocab-ar-1']),
  createMockContent('content-fr', 'Cuisine française traditionnelle', 'fr', 2, []),
];

const largeContentLibrary = Array.from({ length: 25 }, (_, i) => 
  createMockContent(
    `large-content-${i}`,
    ['News Article', 'Podcast Episode', 'Video Tutorial', 'Academic Paper', 'Short Story'][i % 5] + ` #${i + 1}`,
    ['es', 'ja', 'de', 'fr', 'ar'][i % 5],
    (i % 5) + 1,
    [`vocab-${i}-1`, `vocab-${i}-2`]
  )
);

// Mock repositories
const createMockRepos = (contentList: ImmersionContentData[] = [], vocabList: VocabData[] = []) => {
  const immersionRepo: ImmersionContentRepoContract = {
    async getAllImmersionContent() {
      console.log('Loading all immersion content');
      return contentList;
    },
    async deleteImmersionContent(uid: string) {
      console.log(`Deleted immersion content: ${uid}`);
    },
  } as ImmersionContentRepoContract;

  const vocabRepo: VocabAndTranslationRepoContract = {
    async getVocabByUID(id: string) {
      return vocabList.find(v => v.id === id) || null;
    },
  } as VocabAndTranslationRepoContract;

  return { immersionRepo, vocabRepo };
};

const meta: Meta<typeof ImmersionContentListWidget> = {
  title: 'Features/ImmersionContentListWidget',
  component: ImmersionContentListWidget,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Immersion content library widget for browsing, searching, and managing immersion learning materials. Features search, pagination, vocabulary readiness tracking, and CRUD operations. Supports various content types like articles, podcasts, videos, and academic papers.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (story, context) => {
      const contentList = context.args.contentList || [];
      const vocabList = context.args.vocabList || [];
      const { immersionRepo, vocabRepo } = createMockRepos(contentList, vocabList);
      
      return {
        components: { story },
        provide: {
          immersionRepo,
          vocabRepo,
        },
        // Mock router-link for storybook
        template: `
          <div>
            <story />
          </div>
        `,
      };
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyLibrary: Story = {
  args: {
    contentList: [],
    vocabList: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty immersion content library showing get started message.',
      },
    },
  },
};

export const BasicSpanishContent: Story = {
  args: {
    contentList: basicSpanishContent,
    vocabList: [
      createMockVocab('vocab-1', true),  // Ready
      createMockVocab('vocab-2', false), // Not ready
      createMockVocab('vocab-3', true),  // Ready
      createMockVocab('vocab-4', true),  // Ready
      createMockVocab('vocab-5', false), // Not ready
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic Spanish immersion content with vocabulary readiness indicators.',
      },
    },
  },
};

export const MultiLanguageLibrary: Story = {
  args: {
    contentList: multiLanguageContent,
    vocabList: [
      createMockVocab('vocab-es-1', true),
      createMockVocab('vocab-es-2', false),
      createMockVocab('vocab-ja-1', true),
      createMockVocab('vocab-de-1', false),
      createMockVocab('vocab-de-2', true),
      createMockVocab('vocab-ar-1', true),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-language content library with various writing systems and content types.',
      },
    },
  },
};

export const LargeContentLibrary: Story = {
  args: {
    contentList: largeContentLibrary,
    vocabList: Array.from({ length: 50 }, (_, i) => 
      createMockVocab(`vocab-${i}-1`, Math.random() > 0.5)
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Large content library (25+ items) for testing pagination and performance.',
      },
    },
  },
};

export const ContentWithoutVocab: Story = {
  args: {
    contentList: [
      createMockContent('no-vocab-1', 'Beginner Spanish Phrases', 'es', 1, []),
      createMockContent('no-vocab-2', 'Common Japanese Greetings', 'ja', 2, []),
      createMockContent('no-vocab-3', 'German Pronunciation Guide', 'de', 1, []),
    ],
    vocabList: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Content without associated vocabulary (no progress bars shown).',
      },
    },
  },
};

export const HighPriorityContent: Story = {
  args: {
    contentList: [
      createMockContent('priority-1', 'Emergency Spanish Phrases', 'es', 5, ['emergency-1']),
      createMockContent('priority-2', 'Business Japanese Essentials', 'ja', 5, ['business-1', 'business-2']),
      createMockContent('priority-3', 'Medical German Vocabulary', 'de', 4, ['medical-1']),
    ],
    vocabList: [
      createMockVocab('emergency-1', true),
      createMockVocab('business-1', false),
      createMockVocab('business-2', true),
      createMockVocab('medical-1', false),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'High-priority content for essential/emergency vocabulary and skills.',
      },
    },
  },
};

export const TechnicalContent: Story = {
  args: {
    contentList: [
      createMockContent('tech-1', 'Introducción a la Inteligencia Artificial', 'es', 4, ['ai-1', 'ai-2']),
      createMockContent('tech-2', 'Programming Concepts in German', 'de', 3, ['prog-1']),
      createMockContent('tech-3', 'Japanese Software Development Terms', 'ja', 4, ['dev-1', 'dev-2']),
    ],
    vocabList: [
      createMockVocab('ai-1', true),
      createMockVocab('ai-2', false),
      createMockVocab('prog-1', true),
      createMockVocab('dev-1', false),
      createMockVocab('dev-2', false),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical content for specialized vocabulary in programming and technology.',
      },
    },
  },
};

export const ContentWithComplexTitles: Story = {
  args: {
    contentList: [
      createMockContent(
        'complex-1',
        'Análisis completo del impacto del cambio climático en la biodiversidad de los ecosistemas marinos del Mediterráneo: perspectivas y soluciones sostenibles',
        'es',
        4,
        ['env-1', 'env-2']
      ),
      createMockContent(
        'complex-2', 
        'Die Auswirkungen der digitalen Transformation auf die traditionellen Geschäftsmodelle in der deutschen Automobilindustrie',
        'de',
        3,
        ['auto-1']
      ),
    ],
    vocabList: [
      createMockVocab('env-1', true),
      createMockVocab('env-2', false),
      createMockVocab('auto-1', true),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Content with very long titles to test text wrapping and layout.',
      },
    },
  },
};

export const AllVocabReady: Story = {
  args: {
    contentList: [
      createMockContent('ready-1', 'Spanish Conversation Practice', 'es', 3, ['ready-vocab-1', 'ready-vocab-2']),
      createMockContent('ready-2', 'Advanced German Reading', 'de', 4, ['ready-vocab-3']),
    ],
    vocabList: [
      createMockVocab('ready-vocab-1', true),
      createMockVocab('ready-vocab-2', true),
      createMockVocab('ready-vocab-3', true),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Content where all associated vocabulary is ready (100% progress bars).',
      },
    },
  },
};

export const NoVocabReady: Story = {
  args: {
    contentList: [
      createMockContent('not-ready-1', 'Advanced Spanish Literature', 'es', 5, ['not-ready-1', 'not-ready-2']),
      createMockContent('not-ready-2', 'Business Japanese Negotiations', 'ja', 4, ['not-ready-3', 'not-ready-4']),
    ],
    vocabList: [
      createMockVocab('not-ready-1', false),
      createMockVocab('not-ready-2', false),
      createMockVocab('not-ready-3', false),
      createMockVocab('not-ready-4', false),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Content where no associated vocabulary is ready yet (0% progress bars).',
      },
    },
  },
};

export const LoadingState: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionRepo: {
          async getAllImmersionContent() {
            // Simulate long loading
            await new Promise(resolve => setTimeout(resolve, 10000));
            return basicSpanishContent;
          },
          async deleteImmersionContent() {},
        } as ImmersionContentRepoContract,
        vocabRepo: {
          async getVocabByUID() { return null; },
        } as VocabAndTranslationRepoContract,
      },
      template: '<story />',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching immersion content from repository.',
      },
    },
  },
};

export const ErrorState: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionRepo: {
          async getAllImmersionContent() {
            throw new Error('Failed to load immersion content');
          },
          async deleteImmersionContent() { throw new Error('Delete failed'); },
        } as ImmersionContentRepoContract,
        vocabRepo: {
          async getVocabByUID() { return null; },
        } as VocabAndTranslationRepoContract,
      },
      template: '<story />',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Error state when content loading fails.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    contentList: basicSpanishContent,
    vocabList: [
      createMockVocab('vocab-1', true),
      createMockVocab('vocab-2', false),
      createMockVocab('vocab-3', true),
      createMockVocab('vocab-4', true),
      createMockVocab('vocab-5', false),
    ],
  },
  play: async () => {
    console.log('Interactive demo ready - try searching, pagination, and content management');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing search, pagination, vocabulary readiness, and content management.',
      },
    },
  },
};