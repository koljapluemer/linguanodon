import type { Meta, StoryObj } from '@storybook/vue3';
import DoTaskWidget from '@/features/do-task/DoTaskWidget.vue';

const meta: Meta<typeof DoTaskWidget> = {
  title: 'Features/DoTaskWidget',
  component: DoTaskWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Simple task prompt widget that displays a title and instructions, with completion and skip options. Used as a building block for more complex task flows.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Task title displayed prominently',
      control: 'text',
    },
    prompt: {
      description: 'Task instructions or description',
      control: 'text',
    },
    extraInfo: {
      description: 'Optional additional information displayed in a card',
      control: 'text',
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

export const Default: Story = {
  args: {
    title: 'Practice Spanish Vocabulary',
    prompt: 'Review your Spanish vocabulary words and practice pronunciation',
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic task widget with title and prompt only.',
      },
    },
  },
};

export const WithExtraInfo: Story = {
  args: {
    title: 'Complete Grammar Exercise',
    prompt: 'Work through the present tense conjugation exercises',
    extraInfo: 'Focus on regular -ar, -er, and -ir verbs. Pay special attention to stem-changing verbs like "dormir" and "poder".',
  },
  parameters: {
    docs: {
      description: {
        story: 'Task widget with additional information displayed in a highlighted card.',
      },
    },
  },
};

export const LongInstructions: Story = {
  args: {
    title: 'Advanced Conversation Practice',
    prompt: 'Engage in a 10-minute conversation with a native speaker focusing on professional topics. Practice using formal register, business vocabulary, and complex grammatical structures.',
    extraInfo: 'This exercise will help you develop confidence in professional settings. Remember to:\n• Use formal pronouns (usted/ustedes)\n• Employ conditional and subjunctive moods when appropriate\n• Ask clarifying questions if you dont understand\n• Take notes on new vocabulary you encounter',
  },
  parameters: {
    docs: {
      description: {
        story: 'Task with lengthy instructions to test text wrapping and layout.',
      },
    },
  },
};

export const ShortTask: Story = {
  args: {
    title: 'Quick Review',
    prompt: 'Review today\'s lesson',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal task with short title and prompt.',
      },
    },
  },
};

export const JapaneseTask: Story = {
  args: {
    title: 'ひらがな練習',
    prompt: 'ひらがなの文字を練習して、正しい書き順で書いてください。',
    extraInfo: '今日の目標：あ行からな行までの文字を覚える。',
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese language task demonstrating Unicode support.',
      },
    },
  },
};

export const GermanTask: Story = {
  args: {
    title: 'Deutsche Artikel üben',
    prompt: 'Üben Sie die deutschen Artikel (der, die, das) mit den gegebenen Substantiven.',
    extraInfo: 'Merksatz: Der Artikel muss mit dem Geschlecht des Substantivs übereinstimmen. Achten Sie besonders auf die unregelmäßigen Artikel.',
  },
  parameters: {
    docs: {
      description: {
        story: 'German language task with grammatical focus.',
      },
    },
  },
};

export const EmotionalTask: Story = {
  args: {
    title: 'Expressing Emotions in French',
    prompt: 'Practice expressing various emotions and feelings using appropriate French vocabulary and expressions.',
    extraInfo: '💫 Remember: French has many nuanced ways to express emotions. Don\'t just translate directly from English - think about the cultural context! 🇫🇷',
  },
  parameters: {
    docs: {
      description: {
        story: 'Task with emotional context and emoji usage in extra info.',
      },
    },
  },
};

export const TechnicalTask: Story = {
  args: {
    title: 'API Documentation Translation',
    prompt: 'Translate this technical documentation from English to Spanish, maintaining accuracy and clarity for developers.',
    extraInfo: 'Technical Terms to Preserve:\n• HTTP methods (GET, POST, PUT, DELETE)\n• Status codes (200, 404, 500)\n• JSON, XML, API endpoints\n\nFocus on clarity and consistency in technical terminology.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical/professional task with specialized vocabulary requirements.',
      },
    },
  },
};

export const UrgentTask: Story = {
  args: {
    title: 'URGENT: Exam Preparation',
    prompt: 'Final review before tomorrow\'s Spanish proficiency exam. Focus on areas where you scored lowest in practice tests.',
    extraInfo: '⚠️ EXAM TOMORROW ⚠️\nPriority topics:\n1. Subjunctive mood\n2. Por vs. Para\n3. Ser vs. Estar\n4. Time expressions',
  },
  parameters: {
    docs: {
      description: {
        story: 'Urgent task with warning styling and prioritized content.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    title: 'Interactive Task Demo',
    prompt: 'This is an interactive demo. Try clicking the buttons to see the emitted events.',
  },
  play: async ({ canvasElement }) => {
    console.log('Interactive demo ready - try clicking Skip or Mark as Completed');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing button clicks and event emission.',
      },
    },
  },
};