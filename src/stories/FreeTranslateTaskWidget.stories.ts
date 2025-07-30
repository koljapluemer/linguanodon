import type { Meta, StoryObj } from '@storybook/vue3';
import FreeTranslateTaskWidget from '@/widgets/free-translate-task/FreeTranslateTaskWidget.vue';
import type { ExampleData } from '@/entities/examples/ExampleData';

// Mock example repository for Storybook
const mockExampleRepo = {
  updateExample: async (example: ExampleData) => {
    console.log('Updating example:', example);
    await new Promise(resolve => setTimeout(resolve, 500));
    return example;
  },
  getExampleById: async (id: string) => {
    console.log(`Getting example with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return createMockExample({ id });
  }
};

const meta: Meta<typeof FreeTranslateTaskWidget> = {
  title: 'Widgets/FreeTranslateTaskWidget',
  component: FreeTranslateTaskWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for free translation tasks. Users attempt to translate a sentence, can reveal the answer, and rate the difficulty. The widget tracks task completion and updates scheduling based on user performance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    taskData: {
      description: 'Task data containing example ID and example object with content and translation',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: mockExampleRepo,
      },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create mock example data
const createMockExample = (overrides: Partial<ExampleData> = {}): ExampleData => ({
  id: 'example-1',
  language: 'es',
  content: 'Me gusta mucho la música clásica',
  translation: 'I really like classical music',
  associatedVocab: ['vocab-1', 'vocab-2'],
  associatedTasks: [
    {
      taskType: 'free-translate',
      title: 'Free Translation',
      prompt: 'Attempt to translate this sentence',
      evaluateAfterDoing: true,
      lastShownAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      wantToDoAgain: true,
      lastDifficultyRating: 2,
    }
  ],
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

export const Default: Story = {
  args: {
    taskData: {
      exampleId: 'example-1',
      example: createMockExample({
        content: 'Me gusta mucho la música clásica',
        translation: 'I really like classical music',
        language: 'es'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing a Spanish to English translation task. Users can type their translation and reveal the answer.',
      },
    },
  },
};

export const FrenchTranslation: Story = {
  args: {
    taskData: {
      exampleId: 'example-french',
      example: createMockExample({
        id: 'example-french',
        content: 'Je voudrais une table pour deux personnes, s\'il vous plaît',
        translation: 'I would like a table for two people, please',
        language: 'fr'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'French to English translation task demonstrating restaurant vocabulary.',
      },
    },
  },
};

export const GermanTranslation: Story = {
  args: {
    taskData: {
      exampleId: 'example-german',
      example: createMockExample({
        id: 'example-german',
        content: 'Können Sie mir bitte helfen?',
        translation: 'Can you please help me?',
        language: 'de'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'German to English translation task showing a polite request.',
      },
    },
  },
};

export const JapaneseTranslation: Story = {
  args: {
    taskData: {
      exampleId: 'example-japanese',
      example: createMockExample({
        id: 'example-japanese',
        content: 'この料理はとても美味しいです',
        translation: 'This dish is very delicious',
        language: 'ja'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese to English translation task demonstrating Unicode support and food-related vocabulary.',
      },
    },
  },
};

export const LongSentence: Story = {
  args: {
    taskData: {
      exampleId: 'example-long',
      example: createMockExample({
        id: 'example-long',
        content: 'Después de terminar mis estudios universitarios, me gustaría viajar por toda Europa para conocer diferentes culturas y practicar los idiomas que he aprendido',
        translation: 'After finishing my university studies, I would like to travel throughout Europe to learn about different cultures and practice the languages I have learned',
        language: 'es'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Long, complex Spanish sentence to test layout handling and text wrapping.',
      },
    },
  },
};

export const NoTranslationProvided: Story = {
  args: {
    taskData: {
      exampleId: 'example-no-translation',
      example: createMockExample({
        id: 'example-no-translation',
        content: 'Bonjour, comment allez-vous?',
        translation: undefined,
        language: 'fr'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with missing translation to test error handling and fallback display.',
      },
    },
  },
};

export const NoContentProvided: Story = {
  args: {
    taskData: {
      exampleId: 'example-no-content',
      example: createMockExample({
        id: 'example-no-content',
        content: undefined,
        translation: 'Hello, how are you?',
        language: 'fr'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with missing content to test error handling and fallback display.',
      },
    },
  },
};

export const ReverseTranslation: Story = {
  args: {
    taskData: {
      exampleId: 'example-reverse',
      example: createMockExample({
        id: 'example-reverse',
        content: 'Good morning, would you like some coffee?',
        translation: 'Buenos días, ¿te gustaría un poco de café?',
        language: 'en'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'English to Spanish translation (reverse direction) showing the widget\'s flexibility.',
      },
    },
  },
};

export const ComplexGrammar: Story = {
  args: {
    taskData: {
      exampleId: 'example-complex',
      example: createMockExample({
        id: 'example-complex',
        content: 'Si hubiéramos llegado más temprano, habríamos conseguido mejores asientos',
        translation: 'If we had arrived earlier, we would have gotten better seats',
        language: 'es'
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex Spanish sentence with subjunctive and conditional tenses to test advanced grammar translation.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    taskData: {
      exampleId: 'example-interactive',
      example: createMockExample({
        id: 'example-interactive',
        content: 'La vida es bella',
        translation: 'Life is beautiful',
        language: 'es'
      }),
    },
  },
  play: async ({ canvasElement }) => {
    console.log('Interactive demo ready - try typing a translation and clicking reveal');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing user interactions. Try typing a translation, revealing the answer, and rating the difficulty.',
      },
    },
  },
};

export const WithExistingTask: Story = {
  args: {
    taskData: {
      exampleId: 'example-with-task',
      example: createMockExample({
        id: 'example-with-task',
        content: 'Estoy aprendiendo español',
        translation: 'I am learning Spanish',
        language: 'es',
        associatedTasks: [
          {
            taskType: 'free-translate',
            title: 'Free Translation',
            prompt: 'Attempt to translate this sentence',
            evaluateAfterDoing: true,
            lastShownAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            wantToDoAgain: false,
            lastDifficultyRating: 4, // Easy
            nextShownEarliestAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
          }
        ]
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with an existing free-translate task showing how the widget handles task updates.',
      },
    },
  },
};