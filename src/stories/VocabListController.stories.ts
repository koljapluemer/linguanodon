import type { Meta, StoryObj } from '@storybook/vue3';
import VocabListController from '@/features/vocab-list/VocabListController.vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

// Mock vocabulary data with different mastery levels
const createMockVocab = (id: string, content: string, language: string, level: number = 1): VocabData => ({
  id,
  language,
  content,
  priority: 1,
  doNotPractice: false,
  pronunciation: level >= 2 ? `/pronunciation-${id}/` : undefined,
  notes: level >= 3 ? [{ content: `Note for ${content}`, showBeforeExercise: true }] : [],
  translations: [`trans-${id}-1`, `trans-${id}-2`],
  links: level >= 4 ? [{ label: 'Reference', url: `https://example.com/${id}` }] : [],
  associatedTasks: [],
  progress: {
    level,
    streak: Math.max(0, level - 1),
    due: new Date(Date.now() + level * 24 * 60 * 60 * 1000), // Due in 'level' days
    stability: level,
    difficulty: Math.max(1, 6 - level),
    elapsed_days: level,
    scheduled_days: level + 1,
    reps: level + 2,
    lapses: Math.max(0, level - 3),
    state: level >= 2 ? 2 : 0, // Learning vs New
    last_review: new Date(Date.now() - level * 60 * 60 * 1000), // Reviewed 'level' hours ago
  },
});

// Generate vocabulary lists for different scenarios
const spanishBasics = [
  createMockVocab('vocab-1', 'casa', 'es', 0),
  createMockVocab('vocab-2', 'perro', 'es', 1),
  createMockVocab('vocab-3', 'agua', 'es', 2),
  createMockVocab('vocab-4', 'biblioteca', 'es', 3),
  createMockVocab('vocab-5', 'universidad', 'es', 4),
];

const multiLanguageVocab = [
  createMockVocab('vocab-es-1', 'hola', 'es', 2),
  createMockVocab('vocab-ja-1', 'こんにちは', 'ja', 3),
  createMockVocab('vocab-de-1', 'Hallo', 'de', 1),
  createMockVocab('vocab-ar-1', 'مرحبا', 'ar', 2),
  createMockVocab('vocab-fr-1', 'bonjour', 'fr', 1),
];

const largeTechnicalVocab = Array.from({ length: 50 }, (_, i) => 
  createMockVocab(
    `tech-${i}`,
    ['algoritmo', 'programación', 'base de datos', 'servidor', 'aplicación', 'desarrollo', 'framework', 'biblioteca'][i % 8],
    'es',
    (i % 5) + 1
  )
);

// Mock repository
const createMockVocabRepo = (vocabList: VocabData[] = [], searchResults?: VocabData[]): VocabAndTranslationRepoContract => ({
  async getVocabPaginated(cursor?: string, limit = 20, searchQuery?: string) {
    console.log(`Loading vocab: cursor=${cursor}, limit=${limit}, search="${searchQuery}"`);
    
    const resultVocab = searchQuery ? (searchResults || []) : vocabList;
    
    // Simple pagination simulation
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = Math.min(startIndex + limit, resultVocab.length);
    const pageVocab = resultVocab.slice(startIndex, endIndex);
    
    return {
      vocab: pageVocab,
      nextCursor: endIndex < resultVocab.length ? endIndex.toString() : undefined,
      hasMore: endIndex < resultVocab.length,
    };
  },
  
  async getTotalVocabCount(searchQuery?: string) {
    return searchQuery ? (searchResults?.length || 0) : vocabList.length;
  },
  
  async deleteVocab(id: string) {
    console.log(`Deleted vocab: ${id}`);
  },
} as VocabAndTranslationRepoContract);

const meta: Meta<typeof VocabListController> = {
  title: 'Features/VocabListController',
  component: VocabListController,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Vocabulary list controller with pagination, search, and management features. Displays vocabulary items with mastery levels, translations count, and provides CRUD operations. Supports infinite scrolling and real-time search.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (story, context) => {
      const vocabList = context.args.vocabList || [];
      const searchResults = context.args.searchResults;
      
      return {
        components: { story },
        provide: {
          vocabRepo: createMockVocabRepo(vocabList, searchResults),
        },
        template: '<div style="padding: 20px;"><story /></div>',
      };
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyList: Story = {
  args: {
    vocabList: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty vocabulary list showing no items found state.',
      },
    },
  },
};

export const BasicSpanishVocab: Story = {
  args: {
    vocabList: spanishBasics,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic Spanish vocabulary list with different mastery levels (0-4).',
      },
    },
  },
};

export const MultiLanguageVocab: Story = {
  args: {
    vocabList: multiLanguageVocab,
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-language vocabulary demonstrating various writing systems and language support.',
      },
    },
  },
};

export const LargeTechnicalVocabList: Story = {
  args: {
    vocabList: largeTechnicalVocab,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large vocabulary list (50+ items) for testing pagination and scrolling performance.',
      },
    },
  },
};

export const DifferentMasteryLevels: Story = {
  args: {
    vocabList: [
      createMockVocab('beginner-1', 'nuevo', 'es', -1), // Brand new
      createMockVocab('beginner-2', 'fácil', 'es', 0),  // Just started
      createMockVocab('learning-1', 'medio', 'es', 1),  // Learning
      createMockVocab('learning-2', 'normal', 'es', 2), // Progressing  
      createMockVocab('advanced-1', 'difícil', 'es', 3), // Advanced
      createMockVocab('mastered-1', 'experto', 'es', 4), // Mastered
      createMockVocab('master-1', 'dominado', 'es', 5),  // Fully mastered
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary items showing all mastery levels from beginner (-1) to fully mastered (5+).',
      },
    },
  },
};

export const VocabWithComplexData: Story = {
  args: {
    vocabList: [
      {
        ...createMockVocab('complex-1', 'procedimiento', 'es', 3),
        pronunciation: '/pro.θe.ði.ˈmjen.to/',
        notes: [
          { content: 'Formal term used in legal and business contexts', showBeforeExercise: true },
          { content: 'Synonym: proceso', showBeforeExercise: false },
        ],
        links: [
          { label: 'RAE Dictionary', url: 'https://dle.rae.es/procedimiento' },
          { label: 'Usage Examples', url: 'https://example.com/procedimiento' },
        ],
      },
      {
        ...createMockVocab('complex-2', 'responsabilidad', 'es', 4),
        pronunciation: '/res.pon.sa.βi.li.ˈðað/',
        notes: [
          { content: 'Abstract noun, important in professional settings', showBeforeExercise: true },
        ],
        links: [
          { label: 'Etymology', url: 'https://example.com/etymology' },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary with complex data including pronunciation, multiple notes, and reference links.',
      },
    },
  },
};

export const SearchResults: Story = {
  args: {
    vocabList: spanishBasics,
    searchResults: [
      createMockVocab('search-1', 'casa', 'es', 2),
      createMockVocab('search-2', 'casita', 'es', 1),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Search results showing filtered vocabulary matching "casa" query.',
      },
    },
  },
};

export const NoSearchResults: Story = {
  args: {
    vocabList: spanishBasics,
    searchResults: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty search results when no vocabulary matches the search query.',
      },
    },
  },
};

export const VocabWithoutTranslations: Story = {
  args: {
    vocabList: [
      {
        ...createMockVocab('no-trans-1', 'cognado', 'es', 1),
        translations: [],
      },
      {
        ...createMockVocab('no-trans-2', 'similar', 'es', 2),
        translations: [],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary items without translations (translation count = 0).',
      },
    },
  },
};

export const HighPriorityVocab: Story = {
  args: {
    vocabList: [
      {
        ...createMockVocab('priority-1', 'emergencia', 'es', 2),
        priority: 5,
      },
      {
        ...createMockVocab('priority-2', 'hospital', 'es', 1),
        priority: 5,
      },
      {
        ...createMockVocab('priority-3', 'ayuda', 'es', 3),
        priority: 4,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'High-priority vocabulary items (emergency/essential words).',
      },
    },
  },
};

export const DoNotPracticeVocab: Story = {
  args: {
    vocabList: [
      {
        ...createMockVocab('no-practice-1', 'similar', 'es', 1),
        doNotPractice: true,
      },
      {
        ...createMockVocab('no-practice-2', 'natural', 'es', 2),
        doNotPractice: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary marked as "do not practice" (typically cognates).',
      },
    },
  },
};

export const LoadingState: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          async getVocabPaginated() {
            // Simulate long loading
            await new Promise(resolve => setTimeout(resolve, 10000));
            return { vocab: spanishBasics, nextCursor: undefined, hasMore: false };
          },
          async getTotalVocabCount() { return spanishBasics.length; },
          async deleteVocab() {},
        } as VocabAndTranslationRepoContract,
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching vocabulary data from repository.',
      },
    },
  },
};

export const ErrorState: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          async getVocabPaginated() {
            throw new Error('Failed to load vocabulary');
          },
          async getTotalVocabCount() { throw new Error('Count failed'); },
          async deleteVocab() { throw new Error('Delete failed'); },
        } as VocabAndTranslationRepoContract,
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Error state when vocabulary loading fails.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    vocabList: spanishBasics,
  },
  play: async () => {
    console.log('Interactive demo ready - try searching, pagination, and delete operations');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing search, pagination, and vocabulary management.',
      },
    },
  },
};