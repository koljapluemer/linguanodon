import type { Meta, StoryObj } from '@storybook/vue3';
import TryToRemember from '@/features/practice-vocab/ui/exercises/TryToRemember.vue';
import type { Exercise } from '@/shared/ExerciseTypes';

// Helper to create mock exercises
const createMockExercise = (vocab: string, solution: string): Exercise => ({
  id: `exercise-${Date.now()}`,
  type: 'try-to-remember',
  vocabId: 'vocab-1',
  prompt: 'Try to remember the meaning of this word:',
  solution,
  vocab: {
    content: vocab,
    translations: [solution],
  },
});

const meta: Meta<typeof TryToRemember> = {
  title: 'Features/Exercises/TryToRemember',
  component: TryToRemember,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Try to remember exercise component. Shows vocabulary word and asks user to recall meaning before revealing answer. Used for new vocabulary (level -1) to test initial recognition and memory.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    exercise: {
      description: 'Exercise object with vocab word and solution',
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
    exercise: createMockExercise('perro', 'dog'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic Spanish animal vocabulary for new learners.',
      },
    },
  },
};

export const SpanishFood: Story = {
  args: {
    exercise: createMockExercise('manzana', 'apple'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish food vocabulary for beginners.',
      },
    },
  },
};

export const JapaneseBasic: Story = {
  args: {
    exercise: createMockExercise('猫', 'cat'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese kanji character for animal vocabulary.',
      },
    },
  },
};

export const GermanNoun: Story = {
  args: {
    exercise: createMockExercise('Haus', 'house'),
  },
  parameters: {
    docs: {
      description: {
        story: 'German capitalized noun for basic vocabulary.',
      },
    },
  },
};

export const ArabicVocab: Story = {
  args: {
    exercise: createMockExercise('منزل', 'house'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Arabic vocabulary testing RTL script rendering.',
      },
    },
  },
};

export const FrenchBasic: Story = {
  args: {
    exercise: createMockExercise('eau', 'water'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic French vocabulary with simple pronunciation.',
      },
    },
  },
};

export const LongerWord: Story = {
  args: {
    exercise: createMockExercise('biblioteca', 'library'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Longer Spanish word testing typography and layout.',
      },
    },
  },
};

export const VeryLongWord: Story = {
  args: {
    exercise: createMockExercise('responsabilidad', 'responsibility'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Very long Spanish word testing text wrapping and display.',
      },
    },
  },
};

export const TechnicalTerm: Story = {
  args: {
    exercise: createMockExercise('computadora', 'computer'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical vocabulary for technology context.',
      },
    },
  },
};

export const MedicalTerm: Story = {
  args: {
    exercise: createMockExercise('medicina', 'medicine'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Medical vocabulary for healthcare context.',
      },
    },
  },
};

export const BusinessTerm: Story = {
  args: {
    exercise: createMockExercise('empresa', 'company'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Business vocabulary for professional context.',
      },
    },
  },
};

export const AbstractConcept: Story = {
  args: {
    exercise: createMockExercise('libertad', 'freedom'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Abstract concept vocabulary requiring conceptual understanding.',
      },
    },
  },
};

export const EmotionalWord: Story = {
  args: {
    exercise: createMockExercise('felicidad', 'happiness'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Emotional vocabulary for expressing feelings.',
      },
    },
  },
};

export const CulturalTerm: Story = {
  args: {
    exercise: createMockExercise('siesta', 'afternoon nap'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cultural vocabulary specific to Spanish traditions.',
      },
    },
  },
};

export const Cognate: Story = {
  args: {
    exercise: createMockExercise('hospital', 'hospital'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cognate word that is similar in both languages.',
      },
    },
  },
};

export const FalseFrend: Story = {
  args: {
    exercise: createMockExercise('éxito', 'success'),
  },
  parameters: {
    docs: {
      description: {
        story: 'False friend - looks like "exit" but means "success".',
      },
    },
  },
};

export const CompoundWord: Story = {
  args: {
    exercise: createMockExercise('cumpleaños', 'birthday'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish compound word combining "cumple" (completes) + "años" (years).',
      },
    },
  },
};

export const VerbInfinitive: Story = {
  args: {
    exercise: createMockExercise('hablar', 'to speak'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish verb in infinitive form for basic communication.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    exercise: createMockExercise('recordar', 'to remember'),
  },
  play: async () => {
    console.log('Interactive demo ready - try to remember the meaning, then check and rate');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing memory recall and rating functionality.',
      },
    },
  },
};