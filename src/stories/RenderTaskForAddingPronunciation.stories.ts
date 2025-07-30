import type { Meta, StoryObj } from '@storybook/vue3';
import { createEmptyCard } from 'ts-fsrs';
import RenderTaskForAddingPronunciation from '@/widgets/task-for-adding-pronunciation/RenderTaskForAddingPronunciation.vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

// Mock vocab repository for Storybook
const mockVocabRepo = {
  addPronunciationToVocab: async (id: string, pronunciation: string) => {
    console.log(`Added pronunciation "${pronunciation}" to vocab ${id}`);
    await new Promise(resolve => setTimeout(resolve, 800));
  },
  getVocabByUID: async (id: string) => {
    console.log(`Getting vocab with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return createMockVocab({ id });
  },
  updateVocab: async (vocab: VocabData) => {
    console.log('Updated vocab:', vocab);
    await new Promise(resolve => setTimeout(resolve, 500));
    return vocab;
  }
};

const meta: Meta<typeof RenderTaskForAddingPronunciation> = {
  title: 'Widgets/RenderTaskForAddingPronunciation',
  component: RenderTaskForAddingPronunciation,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Task renderer that handles the flow from task prompt to actual pronunciation addition. Shows a task prompt first, then transitions to the AddPronunciationWidget.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    vocab: {
      description: 'Vocabulary data object for which pronunciation will be added',
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
  associatedTasks: [
    {
      taskType: 'add-pronunciation',
      title: 'Add Pronunciation',
      prompt: 'Add pronunciation information for this vocabulary word',
      evaluateAfterDoing: false
    }
  ],
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
      content: 'bonjour',
      language: 'fr',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing the task prompt. Click "I\'m Ready" to proceed to the pronunciation input.',
      },
    },
  },
};

export const WithExistingPronunciation: Story = {
  args: {
    vocab: createMockVocab({
      content: 'buenos días',
      language: 'es',
      pronunciation: '/ˈbwenos ˈdias/',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the task flow when vocab already has pronunciation. Users can still update it.',
      },
    },
  },
};

export const LongGermanWord: Story = {
  args: {
    vocab: createMockVocab({
      content: 'Geschwindigkeitsbegrenzung',
      language: 'de',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the task flow with a long German compound word to test layout handling.',
      },
    },
  },
};

export const JapaneseKanji: Story = {
  args: {
    vocab: createMockVocab({
      content: '素晴らしい',
      language: 'ja',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the task flow with Japanese kanji characters to test Unicode support.',
      },
    },
  },
};

export const WithComplexAssociatedTasks: Story = {
  args: {
    vocab: createMockVocab({
      content: 'implementation',
      language: 'en',
      associatedTasks: [
        {
          taskType: 'add-pronunciation',
          title: 'Add Pronunciation',
          prompt: 'Add pronunciation information for this vocabulary word',
          evaluateAfterDoing: false,
          nextShownEarliestAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
        },
        {
          taskType: 'add-example',
          title: 'Add Example',
          prompt: 'Add an example sentence',
          evaluateAfterDoing: true
        }
      ],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocab with multiple associated tasks including a pronunciation task with scheduling.',
      },
    },
  },
};