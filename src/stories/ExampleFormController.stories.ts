import type { Meta, StoryObj } from '@storybook/vue3';
import ExampleFormController from '@/features/example-form/ExampleFormController.vue';
import type { ExampleData } from '@/entities/examples/ExampleData';

// Mock router for Storybook
const mockRouter = {
  push: (path: string) => {
    console.log(`Navigating to: ${path}`);
  }
};

// Mock example repository for Storybook
const mockExampleRepo = {
  getExampleById: async (id: string) => {
    console.log(`Getting example with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (id === 'example-not-found') {
      return undefined;
    }
    
    return createMockExample({ id });
  },
  saveExample: async (example: Partial<ExampleData>) => {
    console.log('Saving new example:', example);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return createMockExample({
      id: `example-${Date.now()}`,
      ...example
    });
  },
  updateExample: async (example: ExampleData) => {
    console.log('Updating example:', example);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return example;
  }
};

const meta: Meta<typeof ExampleFormController> = {
  title: 'Features/ExampleFormController',
  component: ExampleFormController,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Form controller for creating and editing language learning examples. Handles form validation, loading existing examples for editing, and saving changes. Includes fields for language, content, translation, and associated vocabulary.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    exampleId: {
      description: 'ID of the example to edit (omit or use "new" for creating new examples)',
      control: 'text',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: mockExampleRepo,
      },
      setup() {
        // Mock Vue Router
        return {
          $router: mockRouter
        };
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
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
  associatedVocab: ['vocab-music-1', 'vocab-music-2'],
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

export const CreateNew: Story = {
  args: {
    exampleId: undefined, // or 'new'
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for creating a new example. All fields are empty and ready for input.',
      },
    },
  },
};

export const EditExisting: Story = {
  args: {
    exampleId: 'example-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for editing an existing Spanish music example. Shows loading state then populated fields.',
      },
    },
  },
};

export const EditFrenchExample: Story = {
  args: {
    exampleId: 'example-french',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getExampleById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return createMockExample({
              id,
              language: 'fr',
              content: 'Je voudrais une table pour deux personnes, s\'il vous plaît',
              translation: 'I would like a table for two people, please',
              associatedVocab: ['vocab-restaurant-1', 'vocab-restaurant-2', 'vocab-politeness-1'],
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Editing a French restaurant vocabulary example with multiple associated vocabulary items.',
      },
    },
  },
};

export const EditJapaneseExample: Story = {
  args: {
    exampleId: 'example-japanese',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getExampleById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return createMockExample({
              id,
              language: 'ja',
              content: 'このレストランの料理はとても美味しいです',
              translation: 'The food at this restaurant is very delicious',
              associatedVocab: ['vocab-jp-restaurant', 'vocab-jp-food', 'vocab-jp-adjectives'],
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Editing a Japanese example demonstrating Unicode support and restaurant vocabulary.',
      },
    },
  },
};

export const LongComplexExample: Story = {
  args: {
    exampleId: 'example-complex',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getExampleById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return createMockExample({
              id,
              language: 'es',
              content: 'Si hubiéramos llegado más temprano a la estación, habríamos conseguido mejores asientos en el tren y no habríamos tenido que estar de pie durante todo el viaje tan largo y agotador',
              translation: 'If we had arrived earlier at the station, we would have gotten better seats on the train and wouldn\'t have had to stand during the entire long and exhausting journey',
              associatedVocab: ['vocab-transport-1', 'vocab-transport-2', 'vocab-time-1', 'vocab-subjunctive-1', 'vocab-conditional-1'],
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Editing a long, complex Spanish sentence with advanced grammar (subjunctive/conditional) and multiple vocabulary associations.',
      },
    },
  },
};

export const MinimalExample: Story = {
  args: {
    exampleId: 'example-minimal',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getExampleById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return createMockExample({
              id,
              language: 'de',
              content: undefined, // Only language is set
              translation: undefined,
              associatedVocab: [],
            });
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Editing an example with only language field populated - shows minimal data handling.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    exampleId: 'example-loading',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          getExampleById: async (id: string) => {
            // Never resolve to show persistent loading state
            return new Promise(() => {});
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading spinner while example data is being fetched.',
      },
    },
  },
};

export const ErrorLoadingExample: Story = {
  args: {
    exampleId: 'example-not-found',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error state when the example cannot be found or fails to load.',
      },
    },
  },
};

export const ErrorSavingExample: Story = {
  args: {
    exampleId: undefined,
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        exampleRepo: {
          ...mockExampleRepo,
          saveExample: async (example: Partial<ExampleData>) => {
            console.log('Attempting to save example:', example);
            await new Promise(resolve => setTimeout(resolve, 1000));
            throw new Error('Failed to save example - network error');
          }
        },
      },
      setup() {
        return { $router: mockRouter };
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling when saving fails. Try filling out the form and clicking save.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    exampleId: undefined,
  },
  play: async ({ canvasElement }) => {
    console.log('Interactive demo ready - try filling out the form and saving');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing form functionality. Try filling out all fields, including comma-separated vocabulary IDs, and clicking save.',
      },
    },
  },
};