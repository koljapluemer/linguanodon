import type { Meta, StoryObj } from '@storybook/vue3';
import ExampleListWidget from '@/features/example-list/ExampleListWidget.vue';
import type { ExampleData } from '@/entities/examples/ExampleData';
import type { VocabData } from '@/entities/vocab/VocabData';

// Mock router for Storybook
const mockRouter = {
  push: (path: string) => {
    console.log(`Navigating to: ${path}`);
  }
};

// Mock example repository for Storybook
const mockExampleRepo = {
  getAllExamples: async () => {
    console.log('Loading all examples...');
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      createMockExample({
        id: 'example-1',
        language: 'es',
        content: 'Hola, ¿cómo estás?',
        translation: 'Hello, how are you?',
        associatedVocab: ['vocab-greeting-1', 'vocab-greeting-2']
      }),
      createMockExample({
        id: 'example-2',
        language: 'es',
        content: 'Me gustaría una mesa para dos personas, por favor',
        translation: 'I would like a table for two people, please',
        associatedVocab: ['vocab-restaurant-1', 'vocab-restaurant-2', 'vocab-politeness-1']
      }),
      createMockExample({
        id: 'example-3',
        language: 'fr',
        content: 'Où se trouve la gare?',
        translation: 'Where is the train station?',
        associatedVocab: ['vocab-directions-1', 'vocab-transport-1']
      })
    ];
  },
  deleteExample: async (id: string) => {
    console.log(`Deleting example with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    // Success - no return value needed
  }
};

// Mock vocab repository for readiness calculation
const mockVocabRepo = {
  getVocabByUID: async (uid: string) => {
    console.log(`Getting vocab with UID: ${uid}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate different readiness levels
    const readinessMap: Record<string, boolean> = {
      'vocab-greeting-1': true,
      'vocab-greeting-2': true,
      'vocab-restaurant-1': false,
      'vocab-restaurant-2': true,
      'vocab-politeness-1': false,
      'vocab-directions-1': true,
      'vocab-transport-1': true,
    };
    
    return createMockVocab({
      uid,
      // Use card schedule to simulate readiness
      card: readinessMap[uid] ? { due: new Date(Date.now() - 86400000) } : { due: new Date(Date.now() + 86400000) }
    });
  }
};

const meta: Meta<typeof ExampleListWidget> = {
  title: 'Features/ExampleListWidget',
  component: ExampleListWidget,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Widget for displaying and managing a list of language learning examples. Shows content, translations, associated vocabulary, readiness progress, and provides edit/delete actions. Includes empty state, loading state, and error handling.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: mockExampleRepo,
        vocabRepo: mockVocabRepo,
      },
      setup() {
        // Mock Vue Router
        return {
          $router: mockRouter
        };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create mock example data
const createMockExample = (overrides: Partial<ExampleData> = {}): ExampleData => ({
  id: 'example-1',
  language: 'es',
  content: 'Hola, ¿cómo estás?',
  translation: 'Hello, how are you?',
  associatedVocab: ['vocab-1', 'vocab-2'],
  associatedTasks: [
    {
      taskType: 'free-translate',
      title: 'Free Translation',
      prompt: 'Attempt to translate this sentence',
      evaluateAfterDoing: true,
    }
  ],
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

// Helper function to create mock vocab data
const createMockVocab = (overrides: any = {}): VocabData => ({
  uid: 'vocab-1',
  language: 'es',
  card: { due: new Date() },
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default state showing a list of mixed Spanish and French examples with vocabulary readiness indicators.',
      },
    },
  },
};

export const EmptyState: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [];
          }
        },
        vocabRepo: mockVocabRepo,
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no examples exist yet, encouraging users to create their first example.',
      },
    },
  },
};

export const LoadingState: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            // Never resolve to show persistent loading state
            return new Promise(() => {});
          }
        },
        vocabRepo: mockVocabRepo,
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while examples are being fetched from the repository.',
      },
    },
  },
};

export const ErrorState: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            throw new Error('Failed to load examples - network error');
          }
        },
        vocabRepo: mockVocabRepo,
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Error state when examples fail to load from the repository.',
      },
    },
  },
};

export const JapaneseExamples: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
              createMockExample({
                id: 'jp-1',
                language: 'ja',
                content: 'おはようございます',
                translation: 'Good morning (polite)',
                associatedVocab: ['vocab-jp-greeting-1']
              }),
              createMockExample({
                id: 'jp-2',
                language: 'ja',
                content: 'このレストランの料理はとても美味しいです',
                translation: 'The food at this restaurant is very delicious',
                associatedVocab: ['vocab-jp-food-1', 'vocab-jp-restaurant-1', 'vocab-jp-adjective-1']
              }),
              createMockExample({
                id: 'jp-3',
                language: 'ja',
                content: 'すみません、駅はどこですか？',
                translation: 'Excuse me, where is the station?',
                associatedVocab: ['vocab-jp-directions-1', 'vocab-jp-transport-1']
              })
            ];
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (uid: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return createMockVocab({
              uid,
              language: 'ja',
              card: { due: new Date(Date.now() - 86400000) } // All ready
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Japanese language examples demonstrating Unicode support and complex character handling.',
      },
    },
  },
};

export const MixedLanguages: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
              createMockExample({
                id: 'multi-1',
                language: 'es',
                content: 'La vida es muy corta para aprender alemán',
                translation: 'Life is too short to learn German',
                associatedVocab: ['vocab-es-philosophy-1']
              }),
              createMockExample({
                id: 'multi-2',
                language: 'de',
                content: 'Ich spreche kein Deutsch, aber ich lerne es',
                translation: 'I don\'t speak German, but I\'m learning it',
                associatedVocab: ['vocab-de-learning-1', 'vocab-de-negation-1']
              }),
              createMockExample({
                id: 'multi-3',
                language: 'fr',
                content: 'La programmation est un art autant qu\'une science',
                translation: 'Programming is as much an art as it is a science',
                associatedVocab: ['vocab-fr-tech-1', 'vocab-fr-philosophy-1']
              }),
              createMockExample({
                id: 'multi-4',
                language: 'it',
                content: 'Il caffè italiano è il migliore del mondo',
                translation: 'Italian coffee is the best in the world',
                associatedVocab: ['vocab-it-food-1', 'vocab-it-superlative-1']
              })
            ];
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (uid: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            // Mixed readiness levels
            const isReady = Math.random() > 0.5;
            return createMockVocab({
              uid,
              card: { due: isReady ? new Date(Date.now() - 86400000) : new Date(Date.now() + 86400000) }
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Mixed language examples (Spanish, German, French, Italian) showing the widget\'s multilingual capabilities.',
      },
    },
  },
};

export const NoVocabAssociated: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
              createMockExample({
                id: 'no-vocab-1',
                language: 'es',
                content: 'Esta es una oración sin vocabulario asociado',
                translation: 'This is a sentence without associated vocabulary',
                associatedVocab: []
              }),
              createMockExample({
                id: 'no-vocab-2',
                language: 'fr',
                content: 'Une autre phrase sans mots de vocabulaire',
                translation: 'Another sentence without vocabulary words',
                associatedVocab: []
              })
            ];
          }
        },
        vocabRepo: mockVocabRepo,
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Examples without associated vocabulary - no readiness progress bars are shown.',
      },
    },
  },
};

export const ExternalExamples: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
              createMockExample({
                id: 'external-1',
                language: 'es',
                content: 'Esta es una oración importada de una fuente externa',
                translation: 'This is a sentence imported from an external source',
                associatedVocab: ['vocab-ext-1', 'vocab-ext-2'],
                isUserCreated: false,
                lastDownloadedAt: new Date()
              }),
              createMockExample({
                id: 'user-1',
                language: 'es',
                content: 'Esta es una oración creada por el usuario',
                translation: 'This is a sentence created by the user',
                associatedVocab: ['vocab-user-1'],
                isUserCreated: true,
                lastDownloadedAt: null
              })
            ];
          }
        },
        vocabRepo: mockVocabRepo,
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Mix of user-created and external examples, showing the "External" badge for imported content.',
      },
    },
  },
};

export const ComplexExamples: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
              createMockExample({
                id: 'complex-1',
                language: 'es',
                content: 'Si hubiéramos estudiado más intensivamente durante los últimos meses, probablemente habríamos conseguido mejores resultados en el examen de certificación internacional',
                translation: 'If we had studied more intensively during the last months, we probably would have achieved better results on the international certification exam',
                associatedVocab: ['vocab-subjunctive-1', 'vocab-conditional-1', 'vocab-time-1', 'vocab-education-1', 'vocab-certification-1'],
                associatedTasks: [
                  {
                    taskType: 'grammar-analysis',
                    title: 'Grammar Analysis',
                    prompt: 'Analyze the subjunctive and conditional structures',
                    evaluateAfterDoing: true
                  },
                  {
                    taskType: 'free-translate',
                    title: 'Free Translation',
                    prompt: 'Translate without looking at the answer',
                    evaluateAfterDoing: true
                  }
                ]
              })
            ];
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (uid: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            // Mixed readiness for complex example
            const readinessMap: Record<string, boolean> = {
              'vocab-subjunctive-1': false,
              'vocab-conditional-1': true,
              'vocab-time-1': true,
              'vocab-education-1': true,
              'vocab-certification-1': false,
            };
            return createMockVocab({
              uid,
              card: { due: readinessMap[uid] ? new Date(Date.now() - 86400000) : new Date(Date.now() + 86400000) }
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Complex example with long text, multiple vocabulary items, and associated tasks.',
      },
    },
  },
};

export const HighReadinessExample: Story = {
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getAllExamples: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
              createMockExample({
                id: 'ready-1',
                language: 'es',
                content: 'Hola amigo, ¿cómo estás hoy?',
                translation: 'Hello friend, how are you today?',
                associatedVocab: ['vocab-ready-1', 'vocab-ready-2', 'vocab-ready-3', 'vocab-ready-4']
              })
            ];
          }
        },
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (uid: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            // All vocab is ready (100% progress)
            return createMockVocab({
              uid,
              card: { due: new Date(Date.now() - 86400000) }
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Example with 100% vocabulary readiness, showing full green progress bar.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  play: async ({ canvasElement }) => {
    console.log('Interactive demo ready - try using the edit/delete buttons');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing edit and delete functionality. Try clicking the action buttons to see console logs.',
      },
    },
  },
};