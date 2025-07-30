import type { Meta, StoryObj } from '@storybook/vue3';
import PracticeVocabWidget from '@/features/practice-vocab/PracticeVocabWidget.vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

// Mock VocabRepo
const createMockVocabRepo = (mockTranslations: TranslationData[] = []): VocabAndTranslationRepoContract => ({
  async getTranslationsByIds(ids: string[]) {
    return mockTranslations.filter(t => ids.includes(t.id));
  },
  async scoreVocab(vocabId: string, rating: unknown) {
    console.log(`Scored vocab ${vocabId} with rating: ${rating}`);
  },
  async getVocabByUID() {
    return mockVocabData;
  },
  async updateVocab(vocab: VocabData) {
    console.log('Updated vocab:', vocab);
    return vocab;
  },
} as VocabAndTranslationRepoContract);

// Mock vocab data for different levels
const createMockVocab = (level: number, content: string, language: string = 'es'): VocabData => ({
  id: `vocab-${level}-${content}`,
  language,
  content,
  priority: 1,
  doNotPractice: false,
  pronunciation: level >= 1 ? '/pronunciation/' : undefined,
  notes: [],
  translations: ['trans-1', 'trans-2'],
  links: [],
  associatedTasks: [],
  progress: {
    level,
    streak: Math.max(0, level),
    due: new Date(),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: level + 1,
    lapses: 0,
    state: 0,
    last_review: new Date(),
  },
});

const mockVocabData = createMockVocab(1, 'casa', 'es');

const mockTranslations: TranslationData[] = [
  { id: 'trans-1', content: 'house', language: 'en' },
  { id: 'trans-2', content: 'home', language: 'en' },
];

const meta: Meta<typeof PracticeVocabWidget> = {
  title: 'Features/PracticeVocabWidget',
  component: PracticeVocabWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Core vocabulary practice widget that generates exercises based on vocab mastery level. Integrates with spaced repetition algorithm and provides different exercise types based on learning progress.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    vocab: {
      description: 'Vocabulary item to practice with progress tracking',
      control: false,
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(mockTranslations),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BeginnerLevel: Story = {
  args: {
    vocab: createMockVocab(-1, 'perro', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Level -1: "Try to remember" exercise for new vocabulary. Shows word and asks user to recall meaning.',
      },
    },
  },
};

export const BasicLevel: Story = {
  args: {
    vocab: createMockVocab(0, 'gato', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Level 0: Choose from two options (vocab → translation). Simple binary choice exercise.',
      },
    },
  },
};

export const IntermediateLevel: Story = {
  args: {
    vocab: createMockVocab(1, 'biblioteca', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Level 1: Mixed exercises - either choose from four options or reverse translation exercises.',
      },
    },
  },
};

export const AdvancedLevel: Story = {
  args: {
    vocab: createMockVocab(2, 'universidad', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Level 2: Advanced multiple choice with both directions (vocab→translation, translation→vocab).',
      },
    },
  },
};

export const RevealLevel: Story = {
  args: {
    vocab: createMockVocab(3, 'responsabilidad', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Level 3: Reveal exercises where answer is gradually shown. Tests recall without multiple choice.',
      },
    },
  },
};

export const MasterLevel: Story = {
  args: {
    vocab: createMockVocab(4, 'procedimiento', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Level 4+: Mixed reveal exercises in both directions for mastered vocabulary.',
      },
    },
  },
};

export const JapaneseVocab: Story = {
  args: {
    vocab: {
      ...createMockVocab(1, '猫', 'ja'),
      pronunciation: 'ねこ (neko)',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese vocabulary with kanji, hiragana pronunciation, and multiple writing systems.',
      },
    },
  },
};

export const GermanVocab: Story = {
  args: {
    vocab: {
      ...createMockVocab(2, 'Geschwindigkeit', 'de'),
      pronunciation: '/ɡəˈʃvɪndɪçkaɪt/',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'German vocabulary with long compound word and IPA pronunciation.',
      },
    },
  },
};

export const ArabicVocab: Story = {
  args: {
    vocab: {
      ...createMockVocab(1, 'مدرسة', 'ar'),
      pronunciation: 'madrasa',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Arabic vocabulary testing RTL support and non-Latin script handling.',
      },
    },
  },
};

export const VocabWithNotes: Story = {
  args: {
    vocab: {
      ...createMockVocab(2, 'llevar', 'es'),
      notes: [
        {
          content: 'Can mean "to carry", "to wear", or "to take" depending on context',
          showBeforeExercise: true,
        },
        {
          content: 'Related to "llevarse" (to get along)',
          showBeforeExercise: false,
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary with contextual notes that appear before exercises to aid learning.',
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
          async getTranslationsByIds() {
            // Simulate long loading
            await new Promise(resolve => setTimeout(resolve, 10000));
            return mockTranslations;
          },
          async scoreVocab() {},
          async getVocabByUID() { return mockVocabData; },
          async updateVocab(vocab: VocabData) { return vocab; },
        } as VocabAndTranslationRepoContract,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  args: {
    vocab: createMockVocab(1, 'cargando', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading spinner while exercise is being generated from vocabulary data.',
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
          async getTranslationsByIds() {
            throw new Error('Failed to load translations');
          },
          async scoreVocab() {},
          async getVocabByUID() { return mockVocabData; },
          async updateVocab(vocab: VocabData) { return vocab; },
        } as VocabAndTranslationRepoContract,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  args: {
    vocab: createMockVocab(1, 'error', 'es'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when exercise generation fails. Shows warning with skip option.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    vocab: createMockVocab(1, 'interactive', 'es'),
  },
  play: async () => {
    console.log('Interactive demo ready - practice vocabulary with different difficulty ratings');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing vocabulary practice flow and rating system.',
      },
    },
  },
};