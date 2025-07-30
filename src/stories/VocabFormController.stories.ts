import type { Meta, StoryObj } from '@storybook/vue3';
import VocabFormController from '@/features/vocab-form/VocabFormController.vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

// Mock vocabulary data
const createMockVocab = (overrides: Partial<VocabData> = {}): VocabData => ({
  id: 'vocab-123',
  language: 'es',
  content: 'casa',
  priority: 1,
  doNotPractice: false,
  pronunciation: '/ˈkasa/',
  notes: [
    {
      content: 'Basic noun, very common in everyday conversation',
      showBeforeExercise: true,
    },
  ],
  translations: ['translation-1', 'translation-2'],
  links: [
    {
      label: 'Wiktionary',
      url: 'https://en.wiktionary.org/wiki/casa',
    },
  ],
  associatedTasks: [],
  progress: {
    level: 1,
    streak: 3,
    due: new Date(),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 4,
    lapses: 0,
    state: 0,
    last_review: new Date(),
  },
  ...overrides,
});

// Mock repository
const createMockVocabRepo = (mockVocab?: VocabData): VocabAndTranslationRepoContract => ({
  async getVocabByUID(id: string) {
    console.log(`Loading vocab with ID: ${id}`);
    if (mockVocab && mockVocab.id === id) {
      return mockVocab;
    }
    return null;
  },
  async updateVocab(vocab: VocabData) {
    console.log('Updated vocab:', vocab);
    return vocab;
  },
  async addVocab(vocab: Partial<VocabData>) {
    console.log('Added new vocab:', vocab);
    return createMockVocab({ ...vocab, id: 'new-vocab-' + Date.now() } as VocabData);
  },
} as VocabAndTranslationRepoContract);

const meta: Meta<typeof VocabFormController> = {
  title: 'Features/VocabFormController',
  component: VocabFormController,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Vocabulary form controller that manages vocabulary creation and editing. Handles form state, validation, auto-save functionality, and integrates with the vocabulary repository. Supports notes, links, pronunciation, and various metadata.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    vocabId: {
      description: 'ID of vocabulary to edit. If not provided, creates new vocabulary.',
      control: 'text',
    },
  },
  decorators: [
    (story, context) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(context.args.vocabId ? createMockVocab({ id: context.args.vocabId }) : undefined),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateNew: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Create new vocabulary form with empty fields and default values.',
      },
    },
  },
};

export const EditExisting: Story = {
  args: {
    vocabId: 'vocab-123',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-123',
          content: 'biblioteca',
          pronunciation: '/bi.βli.oˈte.ka/',
          language: 'es',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Edit existing vocabulary with pre-populated form fields.',
      },
    },
  },
};

export const JapaneseVocab: Story = {
  args: {
    vocabId: 'vocab-japanese',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-japanese',
          content: '図書館',
          pronunciation: 'としょかん (toshokan)',
          language: 'ja',
          notes: [
            {
              content: 'Kanji compound: 図 (figure/drawing) + 書 (book/writing) + 館 (building)',
              showBeforeExercise: true,
            },
            {
              content: 'Alternative readings possible in different contexts',
              showBeforeExercise: false,
            },
          ],
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Japanese vocabulary with kanji, hiragana pronunciation, and cultural notes.',
      },
    },
  },
};

export const GermanCompound: Story = {
  args: {
    vocabId: 'vocab-german',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-german',
          content: 'Geschwindigkeitsbegrenzung',
          pronunciation: '/ɡəˈʃvɪndɪçkaɪtsbəˌɡʁɛnt͡sʊŋ/',
          language: 'de',
          notes: [
            {
              content: 'Compound word: Geschwindigkeit (speed) + Begrenzung (limitation)',
              showBeforeExercise: true,
            },
          ],
          links: [
            {
              label: 'German Compound Words Guide',
              url: 'https://example.com/german-compounds',
            },
          ],
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'German compound word with IPA pronunciation and explanatory notes.',
      },
    },
  },
};

export const ArabicVocab: Story = {
  args: {
    vocabId: 'vocab-arabic',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-arabic',
          content: 'مكتبة',
          pronunciation: 'maktaba',
          language: 'ar',
          notes: [
            {
              content: 'Root: ك-ت-ب (k-t-b) related to writing and books',
              showBeforeExercise: true,
            },
          ],
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Arabic vocabulary testing RTL support and root-based morphology notes.',
      },
    },
  },
};

export const WithMultipleNotes: Story = {
  args: {
    vocabId: 'vocab-notes',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-notes',
          content: 'banco',
          pronunciation: '/ˈbaŋko/',
          language: 'es',
          notes: [
            {
              content: 'Can mean "bank" (financial institution)',
              showBeforeExercise: true,
            },
            {
              content: 'Also means "bench" (to sit on)',
              showBeforeExercise: true,
            },
            {
              content: 'Context is crucial for determining meaning',
              showBeforeExercise: false,
            },
            {
              content: 'Etymology from Italian "banco" (counter, table)',
              showBeforeExercise: false,
            },
          ],
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary with multiple notes demonstrating polysemy and context sensitivity.',
      },
    },
  },
};

export const WithMultipleLinks: Story = {
  args: {
    vocabId: 'vocab-links',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-links',
          content: 'algoritmo',
          pronunciation: '/al.ɡoˈɾit.mo/',
          language: 'es',
          links: [
            {
              label: 'RAE Dictionary',
              url: 'https://dle.rae.es/algoritmo',
            },
            {
              label: 'Etymology',
              url: 'https://etymonline.com/word/algorithm',
            },
            {
              label: 'Usage Examples',
              url: 'https://linguee.com/spanish-english/translation/algoritmo.html',
            },
            {
              label: 'Technical Context',
              url: 'https://es.wikipedia.org/wiki/Algoritmo',
            },
          ],
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Technical vocabulary with multiple reference links for comprehensive learning.',
      },
    },
  },
};

export const HighPriorityVocab: Story = {
  args: {
    vocabId: 'vocab-priority',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-priority',
          content: 'emergencia',
          pronunciation: '/e.meɾˈxen.θja/',
          language: 'es',
          priority: 5,
          notes: [
            {
              content: 'Essential vocabulary for emergency situations',
              showBeforeExercise: true,
            },
          ],
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'High-priority vocabulary with emergency/essential classification.',
      },
    },
  },
};

export const DoNotPracticeVocab: Story = {
  args: {
    vocabId: 'vocab-no-practice',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: createMockVocabRepo(createMockVocab({
          id: 'vocab-no-practice',
          content: 'cognado',
          pronunciation: '/koɣˈna.ðo/',
          language: 'es',
          doNotPractice: true,
          notes: [
            {
              content: 'Cognate - already known from English "cognate"',
              showBeforeExercise: false,
            },
          ],
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary marked as "do not practice" - typically cognates or already known words.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    vocabId: 'vocab-loading',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          async getVocabByUID() {
            // Simulate long loading
            await new Promise(resolve => setTimeout(resolve, 10000));
            return createMockVocab({ id: 'vocab-loading' });
          },
          async updateVocab(vocab: VocabData) { return vocab; },
          async addVocab(vocab: Partial<VocabData>) { return createMockVocab(vocab as VocabData); },
        } as VocabAndTranslationRepoContract,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
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
  args: {
    vocabId: 'vocab-error',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          async getVocabByUID() {
            throw new Error('Failed to load vocabulary');
          },
          async updateVocab() { throw new Error('Save failed'); },
          async addVocab() { throw new Error('Create failed'); },
        } as VocabAndTranslationRepoContract,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Error state when vocabulary loading or saving fails.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {},
  play: async () => {
    console.log('Interactive demo ready - try filling out the vocabulary form');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing form validation, auto-save, and user interactions.',
      },
    },
  },
};