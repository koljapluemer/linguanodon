import type { Meta, StoryObj } from '@storybook/vue3';
import ManageExamplesOfGoalWidget from '@/features/manage-examples-of-goal/ManageExamplesOfGoalWidget.vue';
import type { GoalData } from '@/entities/goals/GoalData';
import type { ExampleData } from '@/entities/examples/ExampleData';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';

// Mock example data
const createMockExample = (id: string, content: string, language: string, translation?: string): ExampleData => ({
  id,
  language,
  content,
  translation,
  associatedVocab: [],
  associatedTasks: [],
  isUserCreated: true,
  lastDownloadedAt: new Date(),
});

// Mock goal data  
const createMockGoal = (exampleIds: string[] = [], overrides: Partial<GoalData> = {}): GoalData => ({
  id: 'goal-123',
  taskType: 'learning-goal',
  title: 'Learn Spanish Conversation',
  prompt: 'Practice common Spanish phrases and expressions',
  vocab: [],
  examples: exampleIds,
  subGoals: [],
  milestones: [],
  coreTasks: [
    {
      taskType: 'add-examples-to-goal',
      title: 'Add Examples',
      prompt: 'Add example sentences or phrases to practice',
    },
  ],
  isUserCreated: true,
  lastDownloadedAt: new Date(),
  ...overrides,
});

// Mock repositories
const createMockRepos = (examples: ExampleData[] = []) => {
  const goalRepo: GoalRepoContract = {
    async update(id: string, updates: Partial<GoalData>) {
      console.log(`Updated goal ${id}:`, updates);
      return createMockGoal(updates.examples || [], updates);
    },
  } as GoalRepoContract;

  const exampleRepo: ExampleRepoContract = {
    async getExampleById(id: string) {
      return examples.find(e => e.id === id) || null;
    },
    async saveExample(example: Partial<ExampleData>) {
      const newExample = createMockExample(
        'example-' + Date.now(),
        example.content || '',
        example.language || '',
        example.translation
      );
      console.log('Created new example:', newExample);
      return newExample;
    },
  } as ExampleRepoContract;

  return { goalRepo, exampleRepo };
};

const meta: Meta<typeof ManageExamplesOfGoalWidget> = {
  title: 'Features/ManageExamplesOfGoalWidget',
  component: ManageExamplesOfGoalWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Example management widget for learning goals. Allows viewing, adding, and removing example sentences or phrases associated with a specific goal. Supports bilingual examples with translations and contextual learning.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    goal: {
      description: 'Goal data object containing example associations',
      control: false,
    },
  },
  decorators: [
    (story, context) => {
      const examples = context.args.examples || [];
      const { goalRepo, exampleRepo } = createMockRepos(examples);
      
      return {
        components: { story },
        provide: {
          goalRepo,
          exampleRepo,
        },
        template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
      };
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyGoal: Story = {
  args: {
    goal: createMockGoal([]),
    examples: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with no examples attached yet. Shows empty state and add example form.',
      },
    },
  },
};

export const GoalWithBasicExamples: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2', 'example-3']),
    examples: [
      createMockExample('example-1', 'Hola, ¿cómo estás?', 'es', 'Hello, how are you?'),
      createMockExample('example-2', 'Me llamo María', 'es', 'My name is María'),
      createMockExample('example-3', '¿Dónde está el baño?', 'es', 'Where is the bathroom?'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Goal with basic Spanish conversation examples including translations.',
      },
    },
  },
};

export const ExamplesWithoutTranslations: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2']),
    examples: [
      createMockExample('example-1', 'Por favor', 'es'),
      createMockExample('example-2', 'Gracias', 'es'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples without translations - useful for cognates or universally known phrases.',
      },
    },
  },
};

export const MultiLanguageExamples: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2', 'example-3', 'example-4'], {
      title: 'Multilingual Greetings',
      prompt: 'Learn greetings in different languages',
    }),
    examples: [
      createMockExample('example-1', 'Hola', 'es', 'Hello'),
      createMockExample('example-2', 'こんにちは', 'ja', 'Hello'),
      createMockExample('example-3', 'Guten Tag', 'de', 'Good day'),
      createMockExample('example-4', 'مرحبا', 'ar', 'Hello'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-language examples showing various writing systems and greetings.',
      },
    },
  },
};

export const JapaneseExamples: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2', 'example-3'], {
      title: 'Japanese Phrases',
      prompt: 'Learn essential Japanese expressions',
    }),
    examples: [
      createMockExample('example-1', 'はじめまして', 'ja', 'Nice to meet you'),
      createMockExample('example-2', 'お疲れ様でした', 'ja', 'Thank you for your hard work'),
      createMockExample('example-3', 'いただきます', 'ja', 'Thank you for the meal (before eating)'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese examples with cultural context and polite expressions.',
      },
    },
  },
};

export const TechnicalExamples: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2', 'example-3'], {
      title: 'Spanish Programming Terms',
      prompt: 'Learn technical phrases for software development',
    }),
    examples: [
      createMockExample('example-1', 'El código no compila', 'es', 'The code does not compile'),
      createMockExample('example-2', 'Necesitamos depurar este error', 'es', 'We need to debug this error'),
      createMockExample('example-3', 'La base de datos está caída', 'es', 'The database is down'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical examples for programming and software development contexts.',
      },
    },
  },
};

export const FormalAndInformalExamples: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2', 'example-3', 'example-4'], {
      title: 'Spanish Formality Levels',
      prompt: 'Practice formal and informal Spanish expressions',
    }),
    examples: [
      createMockExample('example-1', '¿Cómo está usted?', 'es', 'How are you? (formal)'),
      createMockExample('example-2', '¿Cómo estás?', 'es', 'How are you? (informal)'),
      createMockExample('example-3', 'Disculpe, señor', 'es', 'Excuse me, sir (formal)'),
      createMockExample('example-4', 'Oye, tío', 'es', 'Hey, dude (informal)'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different levels of formality in Spanish conversation.',
      },
    },
  },
};

export const LongSentenceExamples: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2'], {
      title: 'Complex Spanish Sentences',
      prompt: 'Practice with longer, more complex sentence structures',
    }),
    examples: [
      createMockExample(
        'example-1',
        'Aunque llueva mañana, iremos al parque porque los niños quieren jugar y necesitan hacer ejercicio al aire libre',
        'es',
        'Even if it rains tomorrow, we will go to the park because the children want to play and need to exercise outdoors'
      ),
      createMockExample(
        'example-2',
        'El profesor que enseña matemáticas en la universidad donde estudié durante cinco años acaba de publicar un libro muy interesante',
        'es',
        'The professor who teaches mathematics at the university where I studied for five years has just published a very interesting book'
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Long, complex sentences to test text wrapping and layout with extended content.',
      },
    },
  },
};

export const ExamplesWithoutContent: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2']),
    examples: [
      createMockExample('example-1', '', 'es', 'Translation only'),
      createMockExample('example-2', '', 'ja', 'Another translation only'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples with empty content showing "No content" fallback display.',
      },
    },
  },
};

export const IdiomsAndExpressions: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2', 'example-3'], {
      title: 'Spanish Idioms',
      prompt: 'Learn common Spanish idioms and expressions',
    }),
    examples: [
      createMockExample('example-1', 'Estar en las nubes', 'es', 'To be absent-minded (literally: to be in the clouds)'),
      createMockExample('example-2', 'No hay mal que por bien no venga', 'es', 'Every cloud has a silver lining'),
      createMockExample('example-3', 'A caballo regalado no se le mira el diente', 'es', 'Don\'t look a gift horse in the mouth'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Idiomatic expressions with cultural context and literal translations.',
      },
    },
  },
};

export const ConversationalExamples: Story = {
  args: {
    goal: createMockGoal(['example-1', 'example-2', 'example-3', 'example-4'], {
      title: 'Restaurant Conversation',
      prompt: 'Practice ordering food in Spanish restaurants',
    }),
    examples: [
      createMockExample('example-1', '¿Tienen mesa para dos?', 'es', 'Do you have a table for two?'),
      createMockExample('example-2', '¿Cuál es el plato del día?', 'es', 'What is the dish of the day?'),
      createMockExample('example-3', 'La cuenta, por favor', 'es', 'The check, please'),
      createMockExample('example-4', 'Está delicioso', 'es', 'It\'s delicious'),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Situational examples for restaurant conversations and dining contexts.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    goal: createMockGoal(['example-1']),
  },
  decorators: [
    (story) => {
      const { goalRepo } = createMockRepos();
      const exampleRepo = {
        async getExampleById() {
          // Simulate long loading
          await new Promise(resolve => setTimeout(resolve, 10000));
          return createMockExample('example-1', 'loading', 'es');
        },
        async saveExample(example: Partial<ExampleData>) { 
          return createMockExample('new', '', 'es'); 
        },
      } as ExampleRepoContract;

      return {
        components: { story },
        provide: { goalRepo, exampleRepo },
        template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
      };
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching example data for the goal.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    goal: createMockGoal(['example-1']),
    examples: [
      createMockExample('example-1', 'Interactivo', 'es', 'Interactive'),
    ],
  },
  play: async () => {
    console.log('Interactive demo ready - try adding/removing example sentences');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing example management functionality.',
      },
    },
  },
};