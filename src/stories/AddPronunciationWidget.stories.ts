import type { Meta, StoryObj } from '@storybook/vue3';
import { createEmptyCard } from 'ts-fsrs';
import AddPronunciationWidget from '@/features/add-pronunciation-to-vocab/AddPronunciationWidget.vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

// Mock vocab repository for Storybook
const mockVocabRepo = {
  addPronunciationToVocab: async (id: string, pronunciation: string) => {
    console.log(`Added pronunciation "${pronunciation}" to vocab ${id}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

const meta: Meta<typeof AddPronunciationWidget> = {
  title: 'Features/AddPronunciationWidget',
  component: AddPronunciationWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for adding pronunciation to vocabulary items. Allows users to input phonetic pronunciation for vocabulary words.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    vocab: {
      description: 'Vocabulary data object containing the word and optional existing pronunciation',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: mockVocabRepo,
      },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create mock vocab data
const createMockVocab = (overrides: Partial<VocabData> = {}): VocabData => ({
  id: 'vocab-1',
  language: 'it',
  content: 'ciao',
  priority: 1,
  doNotPractice: false,
  pronunciation: undefined,
  notes: [],
  translations: ['trans-1'],
  links: [],
  associatedTasks: [],
  progress: {
    ...createEmptyCard(),
    streak: 0,
    level: 0,
  },
  ...overrides,
});

export const Default: Story = {
  args: {
    vocab: createMockVocab({
      content: 'ciao',
      language: 'it',
    }),
  },
};

export const WithExistingPronunciation: Story = {
  args: {
    vocab: createMockVocab({
      content: 'bonjour',
      language: 'fr',
      pronunciation: '/bon.ˈʒuʁ/',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the widget when the vocabulary item already has pronunciation. Users can update or replace the existing pronunciation.',
      },
    },
  },
};

export const LongWord: Story = {
  args: {
    vocab: createMockVocab({
      content: 'Sehenswürdigkeit',
      language: 'de',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the widget with a longer German word to test layout and responsiveness.',
      },
    },
  },
};

export const JapaneseWord: Story = {
  args: {
    vocab: createMockVocab({
      content: 'こんにちは',
      language: 'ja',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the widget with Japanese characters to test Unicode support and font rendering.',
      },
    },
  },
};

export const InteractionDemo: Story = {
  args: {
    vocab: createMockVocab({
      content: 'example',
      language: 'en',
    }),
  },
  play: async ({ canvasElement }) => {
    // This could be extended with testing-library interactions
    // for more complex interaction testing
    console.log('Interactive demo ready - try typing in the pronunciation field');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing user interactions. Try typing in the pronunciation field and clicking Save/Skip.',
      },
    },
  },
};