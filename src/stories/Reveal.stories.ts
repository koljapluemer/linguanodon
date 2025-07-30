import type { Meta, StoryObj } from '@storybook/vue3';
import Reveal from '@/features/practice-vocab/ui/exercises/Reveal.vue';
import type { Exercise } from '@/shared/ExerciseTypes';

// Helper to create mock exercises
const createMockExercise = (
  vocab: string,
  solution: string,
  isReverse: boolean = false,
  targetTranslation?: string
): Exercise => ({
  id: `exercise-${Date.now()}`,
  type: 'reveal',
  vocabId: 'vocab-1',
  prompt: isReverse ? 'What Spanish word means this?' : 'What does this word mean?',
  solution,
  vocab: {
    content: vocab,
    translations: [solution],
  },
  isReverse,
  targetTranslation,
});

const meta: Meta<typeof Reveal> = {
  title: 'Features/Exercises/Reveal',
  component: Reveal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Reveal exercise component. Shows vocabulary word and gradually reveals the answer when user clicks. Tests recall without multiple choice options. Used for higher mastery levels.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    exercise: {
      description: 'Exercise object with vocab and solution to reveal',
      control: false,
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="max-width: 600px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicSpanish: Story = {
  args: {
    exercise: createMockExercise('biblioteca', 'library'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic Spanish vocabulary reveal exercise.',
      },
    },
  },
};

export const ReverseDirection: Story = {
  args: {
    exercise: createMockExercise('universidad', 'universidad', true, 'university'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Reverse reveal: show English, reveal Spanish word.',
      },
    },
  },
};

export const JapaneseKanji: Story = {
  args: {
    exercise: createMockExercise('図書館', 'library'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese kanji compound word reveal exercise.',
      },
    },
  },
};

export const GermanCompound: Story = {
  args: {
    exercise: createMockExercise('Bibliothek', 'library'),
  },
  parameters: {
    docs: {
      description: {
        story: 'German vocabulary with clear pronunciation.',
      },
    },
  },
};

export const ArabicVocabulary: Story = {
  args: {
    exercise: createMockExercise('مكتبة', 'library'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Arabic vocabulary testing RTL script support.',
      },
    },
  },
};

export const TechnicalTerm: Story = {
  args: {
    exercise: createMockExercise('algoritmo', 'algorithm'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical programming vocabulary in Spanish.',
      },
    },
  },
};

export const MedicalTerm: Story = {
  args: {
    exercise: createMockExercise('diagnóstico', 'diagnosis'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Medical vocabulary with healthcare terminology.',
      },
    },
  },
};

export const LongWord: Story = {
  args: {
    exercise: createMockExercise('responsabilidad', 'responsibility'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Long Spanish word testing layout and typography.',
      },
    },
  },
};

export const VeryLongWord: Story = {
  args: {
    exercise: createMockExercise('Geschwindigkeitsbegrenzung', 'speed limit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Very long German compound word testing text wrapping.',
      },
    },
  },
};

export const ComplexTranslation: Story = {
  args: {
    exercise: createMockExercise('procedimiento administrativo', 'administrative procedure'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex phrase with multi-word translation.',
      },
    },
  },
};

export const CulturalExpression: Story = {
  args: {
    exercise: createMockExercise('いただきます', 'thank you for the meal (said before eating)'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese cultural expression with detailed contextual meaning.',
      },
    },
  },
};

export const BusinessTerm: Story = {
  args: {
    exercise: createMockExercise('negociación', 'negotiation'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Business vocabulary with professional context.',
      },
    },
  },
};

export const AbstractConcept: Story = {
  args: {
    exercise: createMockExercise('sostenibilidad', 'sustainability'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Abstract concept vocabulary requiring deeper understanding.',
      },
    },
  },
};

export const ScientificTerm: Story = {
  args: {
    exercise: createMockExercise('fotosíntesis', 'photosynthesis'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Scientific vocabulary with technical precision.',
      },
    },
  },
};

export const EmotionalExpression: Story = {
  args: {
    exercise: createMockExercise('nostalgia', 'longing for the past; wistfulness'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Emotional vocabulary with nuanced meaning explanation.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    exercise: createMockExercise('revelar', 'to reveal'),
  },
  play: async () => {
    console.log('Interactive demo ready - click to reveal the answer');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing reveal functionality and rating.',
      },
    },
  },
};