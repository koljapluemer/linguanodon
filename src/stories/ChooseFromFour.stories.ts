import type { Meta, StoryObj } from '@storybook/vue3';
import ChooseFromFour from '@/features/practice-vocab/ui/exercises/ChooseFromFour.vue';
import type { Exercise } from '@/shared/ExerciseTypes';

// Helper to create mock exercises
const createMockExercise = (
  vocab: string,
  correctAnswer: string,
  distractors: string[],
  isReverse: boolean = false,
  targetTranslation?: string
): Exercise => ({
  id: `exercise-${Date.now()}`,
  type: isReverse ? 'choose-from-four-translation-to-vocab' : 'choose-from-four-vocab-to-translation',
  vocabId: 'vocab-1',
  prompt: isReverse ? 'Choose the correct Spanish word:' : 'Choose the correct translation:',
  solution: correctAnswer,
  vocab: {
    content: vocab,
    translations: [correctAnswer],
  },
  isReverse,
  targetTranslation,
  answerOptions: [
    { content: correctAnswer, isCorrect: true },
    ...distractors.map(d => ({ content: d, isCorrect: false })),
  ],
});

const meta: Meta<typeof ChooseFromFour> = {
  title: 'Features/Exercises/ChooseFromFour',
  component: ChooseFromFour,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Choose from four options exercise component. Displays vocabulary or translation and four answer choices in a 2x2 grid. Provides immediate feedback and handles both vocab→translation and translation→vocab directions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    exercise: {
      description: 'Exercise object with vocab, options, and configuration',
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

export const SpanishToEnglish: Story = {
  args: {
    exercise: createMockExercise(
      'casa',
      'house',
      ['car', 'dog', 'water']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish to English translation exercise with basic vocabulary.',
      },
    },
  },
};

export const EnglishToSpanish: Story = {
  args: {
    exercise: createMockExercise(
      'perro',
      'perro',
      ['gato', 'casa', 'agua'],
      true,
      'dog'
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'English to Spanish reverse exercise - choose the Spanish word for "dog".',
      },
    },
  },
};

export const JapaneseVocabulary: Story = {
  args: {
    exercise: createMockExercise(
      '学校',
      'school',
      ['hospital', 'library', 'restaurant']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese kanji vocabulary exercise with English translations.',
      },
    },
  },
};

export const GermanCompounds: Story = {
  args: {
    exercise: createMockExercise(
      'Geschwindigkeitsbegrenzung',
      'speed limit', 
      ['traffic light', 'parking meter', 'road sign']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'German compound word exercise testing complex vocabulary.',
      },
    },
  },
};

export const ArabicVocabulary: Story = {
  args: {
    exercise: createMockExercise(
      'مدرسة',
      'school',
      ['hospital', 'library', 'mosque']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Arabic vocabulary exercise testing RTL script support.',
      },
    },
  },
};

export const TechnicalTerms: Story = {
  args: {
    exercise: createMockExercise(
      'algoritmo',
      'algorithm',
      ['database', 'framework', 'variable']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical programming vocabulary in Spanish.',
      },
    },
  },
};

export const MedicalTerms: Story = {
  args: {
    exercise: createMockExercise(
      'diagnóstico',
      'diagnosis',
      ['treatment', 'symptom', 'prescription']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Medical vocabulary exercise with healthcare terms.',
      },
    },
  },
};

export const SimilarOptions: Story = {
  args: {
    exercise: createMockExercise(
      'banco',
      'bank',
      ['bench', 'office', 'store']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise with similar/related answer options including polysemous word.',
      },
    },
  },
};

export const LongTranslations: Story = {
  args: {
    exercise: createMockExercise(
      'responsabilidad',
      'responsibility',
      ['administration', 'communication', 'documentation']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise with longer words to test button text wrapping.',
      },
    },
  },
};

export const VeryLongOptions: Story = {
  args: {
    exercise: createMockExercise(
      'procedimiento',
      'administrative procedure',
      ['organizational structure', 'communication protocol', 'evaluation methodology']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise with very long answer options to test layout and wrapping.',
      },
    },
  },
};

export const FormalVsInformal: Story = {
  args: {
    exercise: createMockExercise(
      '¿Cómo está usted?',
      'How are you? (formal)',
      ['How are you? (informal)', 'What is your name?', 'Where are you from?']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise distinguishing formal vs informal language registers.',
      },
    },
  },
};

export const CulturalContext: Story = {
  args: {
    exercise: createMockExercise(
      'いただきます',
      'Thank you for the meal (before eating)',
      ['Thank you for the meal (after eating)', 'Excuse me', 'I\'m sorry']
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese cultural expression with context-specific translations.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    exercise: createMockExercise(
      'interactive',
      'interactivo',
      ['pasivo', 'estático', 'automático'],
      true,
      'interactive'
    ),
  },
  play: async () => {
    console.log('Interactive demo ready - try clicking different answer options');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing answer selection and feedback.',
      },
    },
  },
};