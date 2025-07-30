import type { Meta, StoryObj } from '@storybook/vue3';
import { createEmptyCard } from 'ts-fsrs';
import RenderTaskForImmersionContent from '@/widgets/task-for-immersion-content/RenderTaskForImmersionContent.vue';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

// Mock repositories for Storybook
const mockVocabRepo = {
  getVocabByUID: async (id: string) => {
    console.log(`Getting vocab with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return createMockVocab({ id });
  },
  saveVocab: async (vocab: Partial<VocabData>) => {
    console.log('Saving vocab:', vocab);
    await new Promise(resolve => setTimeout(resolve, 600));
    return createMockVocab({
      id: `vocab-${Date.now()}`,
      ...vocab
    });
  }
};

const mockImmersionRepo = {
  getImmersionContentById: async (id: string) => {
    console.log(`Getting immersion content with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return createMockImmersionContent({ uid: id });
  },
  updateImmersionContent: async (content: ImmersionContentData) => {
    console.log('Updating immersion content:', content);
    await new Promise(resolve => setTimeout(resolve, 500));
    return content;
  }
};

const meta: Meta<typeof RenderTaskForImmersionContent> = {
  title: 'Widgets/RenderTaskForImmersionContent',
  component: RenderTaskForImmersionContent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Widget for rendering immersion content tasks. Displays content with markdown support, allows vocabulary management, and provides task completion with evaluation. Supports two-phase interaction: task completion and evaluation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      description: 'Immersion content data with title, prompt, and associated vocabulary',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: mockVocabRepo,
        immersionRepo: mockImmersionRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create mock immersion content
const createMockImmersionContent = (overrides: Partial<ImmersionContentData> = {}): ImmersionContentData => ({
  uid: 'immersion-1',
  language: 'it',
  priority: 1,
  associatedUnits: ['vocab-1', 'vocab-2'],
  taskType: 'consume-immersion-content',
  title: 'Watch Italian Cooking Video',
  prompt: 'Watch this Italian cooking video and try to understand the instructions without subtitles. Focus on cooking vocabulary and imperative verbs.',
  extraInfo: '**Video Topic**: Making Fresh Pasta\n\n**Focus Areas**:\n- Cooking verbs (mescolare, aggiungere, impastare)\n- Kitchen utensils (forchetta, ciotola, mattarello)\n- Ingredients (farina, uova, sale)\n\n**Tips**: Pay attention to hand gestures and visual cues to help with comprehension.',
  evaluateAfterDoing: true,
  isUserCreated: true,
  lastDownloadedAt: null,
  ...overrides,
});

// Helper function to create mock vocab data
const createMockVocab = (overrides: Partial<VocabData> = {}): VocabData => {
  const vocabMap = {
    'vocab-1': { content: 'mescolare', language: 'it' },
    'vocab-2': { content: 'farina', language: 'it' },
  };
  
  const baseData = vocabMap[overrides.id as keyof typeof vocabMap] || {
    content: 'example',
    language: 'it'
  };

  return {
    id: 'vocab-1',
    priority: 1,
    doNotPractice: false,
    pronunciation: undefined,
    notes: [],
    translations: ['trans-1'],
    links: [],
    associatedTasks: [],
    progress: {
      ...createEmptyCard(),
      streak: 0,
      level: 0,
    },
    ...baseData,
    ...overrides,
  };
};

export const Default: Story = {
  args: {
    content: createMockImmersionContent(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default Italian cooking video immersion task with markdown instructions and vocabulary management.',
      },
    },
  },
};

export const SpanishPodcast: Story = {
  args: {
    content: createMockImmersionContent({
      uid: 'immersion-spanish',
      language: 'es',
      title: 'Listen to Spanish News Podcast',
      prompt: 'Listen to today\'s Spanish news podcast and identify key vocabulary related to current events.',
      extraInfo: '**Podcast Topic**: Current Events in Latin America\n\n**Duration**: 15 minutes\n\n**Difficulty**: Intermediate\n\n**Focus**: News vocabulary, formal register, past tense usage',
      associatedUnits: [],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish news podcast immersion task with no existing vocabulary - shows empty state.',
      },
    },
  },
};

export const FrenchMovie: Story = {
  args: {
    content: createMockImmersionContent({
      uid: 'immersion-french',
      language: 'fr',
      title: 'French Film Analysis',
      prompt: 'Watch this French short film and analyze the dialogue, focusing on colloquial expressions and cultural references.',
      extraInfo: '**Film**: "Le Petit Déjeuner" (15 min)\n\n**Genre**: Drama/Comedy\n\n**Language Level**: Advanced\n\n**Cultural Context**: Modern Parisian life\n\n**Key Themes**:\n- Family relationships\n- Daily routines\n- Social interactions',
      associatedUnits: ['vocab-french-1', 'vocab-french-2', 'vocab-french-3'],
    }),
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const frenchVocab = {
              'vocab-french-1': { content: 'petit déjeuner', language: 'fr' },
              'vocab-french-2': { content: 'se dépêcher', language: 'fr' },
              'vocab-french-3': { content: 'en retard', language: 'fr' },
            };
            return createMockVocab({
              id,
              ...frenchVocab[id as keyof typeof frenchVocab]
            });
          }
        },
        immersionRepo: mockImmersionRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'French film analysis task with complex markdown formatting and multiple associated vocabulary items.',
      },
    },
  },
};

export const JapaneseAnime: Story = {
  args: {
    content: createMockImmersionContent({
      uid: 'immersion-japanese',
      language: 'ja',
      title: 'アニメエピソード分析',
      prompt: 'このアニメエピソードを見て、日常会話の表現と敬語の使い方に注目してください。',
      extraInfo: '**アニメ**: 日常系アニメ (20分)\n\n**レベル**: 中級\n\n**学習ポイント**:\n- 日常会話\n- 敬語と丁寧語\n- 感情表現\n- 若者言葉',
      associatedUnits: ['vocab-jp-1', 'vocab-jp-2'],
    }),
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const japaneseVocab = {
              'vocab-jp-1': { content: 'おつかれさま', language: 'ja' },
              'vocab-jp-2': { content: 'よろしくお願いします', language: 'ja' },
            };
            return createMockVocab({
              id,
              ...japaneseVocab[id as keyof typeof japaneseVocab]
            });
          }
        },
        immersionRepo: mockImmersionRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Japanese anime analysis task demonstrating full Unicode support with Japanese characters throughout.',
      },
    },
  },
};

export const GermanReadingTask: Story = {
  args: {
    content: createMockImmersionContent({
      uid: 'immersion-german',
      language: 'de',
      title: 'Deutsche Nachrichten lesen',
      prompt: 'Lesen Sie diesen deutschen Nachrichtenartikel und identifizieren Sie neue Vokabeln sowie grammatische Strukturen.',
      extraInfo: '**Artikel**: Umweltschutz in Deutschland\n\n**Länge**: 500 Wörter\n\n**Schwierigkeit**: Fortgeschritten\n\n**Grammatik-Fokus**:\n- Passiv-Konstruktionen\n- Nominalisierungen\n- Konjunktiv II',
      associatedUnits: [],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'German reading comprehension task with complex grammar focus and no existing vocabulary.',
      },
    },
  },
};

export const MinimalContent: Story = {
  args: {
    content: createMockImmersionContent({
      uid: 'immersion-minimal',
      language: 'en',
      title: 'Simple Listening Task',
      prompt: 'Listen to this short audio clip.',
      extraInfo: undefined, // No extra info
      associatedUnits: [],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal immersion content with just title and prompt - no extra info or vocabulary.',
      },
    },
  },
};

export const LongComplexContent: Story = {
  args: {
    content: createMockImmersionContent({
      uid: 'immersion-complex',
      language: 'es',
      title: 'Análisis Literario Avanzado: García Márquez',
      prompt: 'Analiza este fragmento de "Cien años de soledad" prestando atención al realismo mágico, el uso del tiempo narrativo, y el simbolismo cultural latinoamericano.',
      extraInfo: `**Fragmento**: Capítulo 3, páginas 45-52

**Contexto Histórico**: 
La novela fue publicada en 1967 durante el boom latinoamericano. García Márquez utiliza elementos del realismo mágico para explorar la historia de Colombia y América Latina.

**Elementos Literarios a Identificar**:
- **Realismo Mágico**: Eventos extraordinarios presentados como normales
- **Tiempo Cíclico**: La repetición de nombres y eventos familiares
- **Simbolismo**: Los elementos naturales como metáforas políticas
- **Narrativa Omnisciente**: El narrador que conoce el pasado y futuro

**Vocabulario Especializado**:
- Términos literarios (metáfora, alegoría, simbolismo)
- Vocabulario histórico-político
- Expresiones regionales colombianas
- Lenguaje poético y descriptivo

**Preguntas de Reflexión**:
1. ¿Cómo se manifiesta el realismo mágico en este fragmento?
2. ¿Qué elementos cíclicos puedes identificar?
3. ¿Cómo refleja el texto la realidad sociopolítica de América Latina?

**Duración Estimada**: 45-60 minutos`,
      associatedUnits: ['vocab-lit-1', 'vocab-lit-2', 'vocab-lit-3', 'vocab-lit-4'],
    }),
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          ...mockVocabRepo,
          getVocabByUID: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const literaryVocab = {
              'vocab-lit-1': { content: 'realismo mágico', language: 'es' },
              'vocab-lit-2': { content: 'narrativa omnisciente', language: 'es' },
              'vocab-lit-3': { content: 'simbolismo', language: 'es' },
              'vocab-lit-4': { content: 'alegoría', language: 'es' },
            };
            return createMockVocab({
              id,
              ...literaryVocab[id as keyof typeof literaryVocab]
            });
          }
        },
        immersionRepo: mockImmersionRepo,
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Complex literary analysis task with extensive markdown formatting, multiple sections, and academic vocabulary.',
      },
    },
  },
};

export const InteractiveFlow: Story = {
  args: {
    content: createMockImmersionContent({
      uid: 'immersion-interactive',
      language: 'en',
      title: 'Interactive Language Task',
      prompt: 'Complete this language immersion task and provide feedback.',
      extraInfo: '**Instructions**: Follow the complete flow from task completion to evaluation.',
      associatedUnits: [],
    }),
  },
  play: async ({ canvasElement }) => {
    console.log('Interactive demo ready - try completing the task and going through the evaluation');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing the complete task flow: task completion → evaluation → finish. Try clicking "Mark as Completed" and following through the evaluation.',
      },
    },
  },
};