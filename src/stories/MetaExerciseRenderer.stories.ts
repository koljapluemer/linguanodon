import type { Meta, StoryObj } from '@storybook/vue3';
import MetaExerciseRenderer from '@/features/practice-vocab/ui/MetaExerciseRenderer.vue';
import type { Exercise } from '@/shared/ExerciseTypes';

// Mock exercises for different types
const createMockExercise = (
  type: Exercise['type'],
  vocab: string,
  translations: string[],
  options?: { isReverse?: boolean; targetTranslation?: string }
): Exercise => {
  const baseExercise: Exercise = {
    id: `exercise-${type}-${Date.now()}`,
    type,
    vocabId: 'vocab-1',
    prompt: getPromptForType(type, options?.isReverse),
    solution: options?.isReverse ? vocab : translations[0],
    vocab: {
      content: vocab,
      translations,
    },
    isReverse: options?.isReverse,
    targetTranslation: options?.targetTranslation,
  };

  // Add answer options for choice exercises
  if (type.includes('choose-from')) {
    const correctAnswer = options?.isReverse ? vocab : translations[0];
    const answerCount = type.includes('four') ? 4 : 2;
    
    baseExercise.answerOptions = [
      { content: correctAnswer, isCorrect: true },
      ...generateDistractors(correctAnswer, answerCount - 1, options?.isReverse ? 'vocab' : 'translation'),
    ];
  }

  return baseExercise;
};

const getPromptForType = (type: Exercise['type'], isReverse?: boolean): string => {
  switch (type) {
    case 'try-to-remember':
      return 'Try to remember the meaning of this word:';
    case 'reveal':
      return isReverse ? 'What word means this in Spanish?' : 'What does this word mean?';
    case 'choose-from-two-vocab-to-translation':
      return 'Choose the correct translation:';
    case 'choose-from-two-translation-to-vocab':
      return 'Choose the correct Spanish word:';
    case 'choose-from-four-vocab-to-translation':
      return 'Select the best translation:';
    case 'choose-from-four-translation-to-vocab':
      return 'Select the correct Spanish word:';
    default:
      return 'Complete this exercise:';
  }
};

const generateDistractors = (correct: string, count: number, type: 'vocab' | 'translation') => {
  const vocabDistractors = ['perro', 'gato', 'casa', 'agua', 'libro', 'mesa', 'silla', 'ventana'];
  const translationDistractors = ['dog', 'cat', 'house', 'water', 'book', 'table', 'chair', 'window'];
  
  const pool = type === 'vocab' ? vocabDistractors : translationDistractors;
  const filtered = pool.filter(item => item !== correct);
  
  return filtered.slice(0, count).map(content => ({
    content,
    isCorrect: false,
  }));
};

const meta: Meta<typeof MetaExerciseRenderer> = {
  title: 'Features/MetaExerciseRenderer',
  component: MetaExerciseRenderer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Meta exercise renderer that displays different exercise types based on vocabulary mastery level. Routes to appropriate exercise components (TryToRemember, Reveal, ChooseFromTwo, ChooseFromFour) and handles rating events.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    exercise: {
      description: 'Exercise object containing type, content, and configuration',
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

export const TryToRememberExercise: Story = {
  args: {
    exercise: createMockExercise('try-to-remember', 'casa', ['house', 'home']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Level -1 exercise: Shows vocabulary word and asks user to recall meaning without options.',
      },
    },
  },
};

export const RevealExercise: Story = {
  args: {
    exercise: createMockExercise('reveal', 'biblioteca', ['library']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Reveal exercise: Gradually shows the answer to test recall without multiple choice.',
      },
    },
  },
};

export const ReverseRevealExercise: Story = {
  args: {
    exercise: createMockExercise('reveal', 'hospital', ['hospital'], { 
      isReverse: true, 
      targetTranslation: 'hospital' 
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Reverse reveal exercise: Shows translation and asks for the vocabulary word.',
      },
    },
  },
};

export const ChooseFromTwoVocabToTranslation: Story = {
  args: {
    exercise: createMockExercise('choose-from-two-vocab-to-translation', 'perro', ['dog']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Binary choice exercise: Choose correct translation from two options.',
      },
    },
  },
};

export const ChooseFromTwoTranslationToVocab: Story = {
  args: {
    exercise: createMockExercise('choose-from-two-translation-to-vocab', 'gato', ['cat'], { 
      isReverse: true,
      targetTranslation: 'cat',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Reverse binary choice: Shows translation, choose correct vocabulary word.',
      },
    },
  },
};

export const ChooseFromFourVocabToTranslation: Story = {
  args: {
    exercise: createMockExercise('choose-from-four-vocab-to-translation', 'universidad', ['university']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple choice with four options: Choose correct translation from four choices.',
      },
    },
  },
};

export const ChooseFromFourTranslationToVocab: Story = {
  args: {
    exercise: createMockExercise('choose-from-four-translation-to-vocab', 'restaurante', ['restaurant'], {
      isReverse: true,
      targetTranslation: 'restaurant',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Reverse multiple choice: Shows translation, choose correct vocabulary word from four options.',
      },
    },
  },
};

export const JapaneseExercise: Story = {
  args: {
    exercise: createMockExercise('choose-from-two-vocab-to-translation', '学校', ['school', 'education']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese vocabulary exercise with kanji characters and multiple translations.',
      },
    },
  },
};

export const GermanLongWord: Story = {
  args: {
    exercise: createMockExercise('try-to-remember', 'Geschwindigkeitsbegrenzung', ['speed limit']),
  },
  parameters: {
    docs: {
      description: {
        story: 'German compound word exercise testing layout with very long vocabulary.',
      },
    },
  },
};

export const ArabicExercise: Story = {
  args: {
    exercise: createMockExercise('choose-from-four-vocab-to-translation', 'مدرسة', ['school']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Arabic vocabulary exercise testing RTL script support and layout.',
      },
    },
  },
};

export const MultipleTranslations: Story = {
  args: {
    exercise: createMockExercise('reveal', 'banco', ['bank', 'bench']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary with multiple valid translations showing polysemy handling.',
      },
    },
  },
};

export const TechnicalVocabulary: Story = {
  args: {
    exercise: createMockExercise('choose-from-four-vocab-to-translation', 'algoritmo', ['algorithm']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical/specialized vocabulary exercise with domain-specific terms.',
      },
    },
  },
};

export const EmotionalVocabulary: Story = {
  args: {
    exercise: createMockExercise('try-to-remember', 'nostalgia', ['nostalgia', 'longing']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Abstract emotional vocabulary that may be harder to visualize.',
      },
    },
  },
};

export const VerbConjugation: Story = {
  args: {
    exercise: createMockExercise('choose-from-four-vocab-to-translation', 'corremos', ['we run']),
  },
  parameters: {
    docs: {
      description: {
        story: 'Conjugated verb form exercise testing grammatical understanding.',
      },
    },
  },
};

export const UnknownExerciseType: Story = {
  args: {
    exercise: {
      id: 'unknown-exercise',
      type: 'unknown-type' as any,
      vocabId: 'vocab-1',
      prompt: 'This should show an error',
      solution: 'error',
      vocab: {
        content: 'error',
        translations: ['error'],
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state for unknown exercise types showing fallback error message.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    exercise: createMockExercise('choose-from-two-vocab-to-translation', 'interactive', ['interactive']),
  },
  play: async () => {
    console.log('Interactive demo ready - try clicking different rating buttons');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing exercise completion and rating flow.',
      },
    },
  },
};