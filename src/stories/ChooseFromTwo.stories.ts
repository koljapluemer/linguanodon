import type { Meta, StoryObj } from '@storybook/vue3';
import ChooseFromTwo from '@/features/practice-vocab/ui/exercises/ChooseFromTwo.vue';
import type { Exercise } from '@/shared/ExerciseTypes';

// Helper to create mock exercises
const createMockExercise = (
  vocab: string,
  correctAnswer: string,
  distractor: string,
  isReverse: boolean = false,
  targetTranslation?: string
): Exercise => ({
  id: `exercise-${Date.now()}`,
  type: isReverse ? 'choose-from-two-translation-to-vocab' : 'choose-from-two-vocab-to-translation',
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
    { content: distractor, isCorrect: false },
  ],
});

const meta: Meta<typeof ChooseFromTwo> = {
  title: 'Features/Exercises/ChooseFromTwo',
  component: ChooseFromTwo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Choose from two options exercise component. Simple binary choice between correct answer and one distractor. Used for easier exercises or when vocabulary has clear distinctions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    exercise: {
      description: 'Exercise object with vocab and two answer options',
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
    exercise: createMockExercise('gato', 'cat', 'dog'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic Spanish animal vocabulary with clear distinction.',
      },
    },
  },
};

export const ReverseDirection: Story = {
  args: {
    exercise: createMockExercise('agua', 'agua', 'fuego', true, 'water'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Reverse direction: English to Spanish translation exercise.',
      },
    },
  },
};

export const JapaneseBasic: Story = {
  args: {
    exercise: createMockExercise('猫', 'cat', 'dog'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese kanji vocabulary with animal terms.',
      },
    },
  },
};

export const GermanNouns: Story = {
  args: {
    exercise: createMockExercise('Hund', 'dog', 'cat'),
  },
  parameters: {
    docs: {
      description: {
        story: 'German noun exercise with capitalized nouns.',
      },
    },
  },
};

export const ArabicVocab: Story = {
  args: {
    exercise: createMockExercise('قطة', 'cat', 'bird'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Arabic vocabulary testing RTL script rendering.',
      },
    },
  },
};

export const TechnicalTerms: Story = {
  args: {
    exercise: createMockExercise('variable', 'variable', 'function'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Programming vocabulary with technical distinctions.',
      },
    },
  },
};

export const FormalVsInformal: Story = {
  args: {
    exercise: createMockExercise('usted', 'you (formal)', 'you (informal)'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish formal vs informal pronoun distinction.',
      },
    },
  },
};

export const SimilarMeanings: Story = {
  args: {
    exercise: createMockExercise('casa', 'house', 'home'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise with similar but distinct meanings requiring precision.',
      },
    },
  },
};

export const Opposites: Story = {
  args: {
    exercise: createMockExercise('grande', 'big', 'small'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise with opposite meanings as distractor.',
      },
    },
  },
};

export const LongTranslations: Story = {
  args: {
    exercise: createMockExercise('responsabilidad', 'responsibility', 'administration'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise with longer words testing button layout.',
      },
    },
  },
};

export const VeryLongOptions: Story = {
  args: {
    exercise: createMockExercise(
      'procedimiento administrativo',
      'administrative procedure',
      'organizational methodology'
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Exercise with very long phrases testing text wrapping.',
      },
    },
  },
};

export const CulturalExpression: Story = {
  args: {
    exercise: createMockExercise('おつかれさまでした', 'thank you for your hard work', 'good morning'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese cultural expression with context-specific meaning.',
      },
    },
  },
};

export const MedicalTerms: Story = {
  args: {
    exercise: createMockExercise('síntoma', 'symptom', 'treatment'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Medical vocabulary with healthcare terminology.',
      },
    },
  },
};

export const BusinessTerms: Story = {
  args: {
    exercise: createMockExercise('reunión', 'meeting', 'conference'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Business vocabulary with professional context.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    exercise: createMockExercise('demo', 'demonstration', 'example'),
  },
  play: async () => {
    console.log('Interactive demo ready - try both answer options');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing binary choice selection.',
      },
    },
  },
};