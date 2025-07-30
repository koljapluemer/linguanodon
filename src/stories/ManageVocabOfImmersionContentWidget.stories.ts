import type { Meta, StoryObj } from '@storybook/vue3';
import ManageVocabOfImmersionContentWidget from '@/features/manage-vocab-of-immersion-content/ManageVocabOfImmersionContentWidget.vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';

// Mock vocabulary data
const createMockVocab = (id: string, content: string, language: string, translations: string[] = []): VocabData => ({
  id,
  language,
  content,
  pronunciation: `/${content}/`,
  priority: 1,
  doNotPractice: false,
  notes: [],
  translations: translations.map((_, i) => `trans-${id}-${i}`),
  links: [],
  associatedTasks: [],
  progress: {
    level: 1,
    streak: 0,
    due: new Date(),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 1,
    lapses: 0,
    state: 0,
    last_review: new Date(),
  },
});

// Mock immersion content data
const createMockContent = (uid: string, vocabIds: string[] = []): ImmersionContentData => ({
  uid,
  language: 'es',
  taskType: 'immersion-content',
  title: 'Spanish News Article',
  prompt: 'Read this article and learn new vocabulary',
  priority: 3,
  associatedUnits: vocabIds,
  evaluateAfterDoing: true,
  isUserCreated: true,
  lastDownloadedAt: new Date(),
});

// Mock repositories
const createMockRepos = (contentData?: ImmersionContentData, vocabList: VocabData[] = []) => {
  const vocabRepo: VocabAndTranslationRepoContract = {
    async getVocabByUID(id: string) {
      return vocabList.find(v => v.id === id) || null;
    },
    async saveVocab(vocab: Partial<VocabData>) {
      const newVocab = createMockVocab(
        'vocab-' + Date.now(),
        vocab.content || '',
        vocab.language || '',
        []
      );
      console.log('Created new vocab:', newVocab);
      return newVocab;
    },
  } as VocabAndTranslationRepoContract;

  const immersionRepo: ImmersionContentRepoContract = {
    async getImmersionContentById(uid: string) {
      if (contentData && contentData.uid === uid) {
        return contentData;
      }
      return null;
    },
    async updateImmersionContent(content: ImmersionContentData) {
      console.log('Updated immersion content:', content);
      return content;
    },
  } as ImmersionContentRepoContract;

  return { vocabRepo, immersionRepo };
};

const meta: Meta<typeof ManageVocabOfImmersionContentWidget> = {
  title: 'Features/ManageVocabOfImmersionContentWidget',
  component: ManageVocabOfImmersionContentWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Vocabulary management widget for immersion content. Allows associating vocabulary items with specific immersion materials like articles, podcasts, or videos. Supports batch vocabulary creation and content-vocabulary relationships.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    contentUid: {
      description: 'UID of immersion content to manage vocabulary for',
      control: 'text',
    },
    showExistingAssociatedVocab: {
      description: 'Whether to show existing associated vocabulary',
      control: 'boolean',
    },
  },
  decorators: [
    (story, context) => {
      const contentData = context.args.contentData;
      const vocabList = context.args.vocabList || [];
      const { vocabRepo, immersionRepo } = createMockRepos(contentData, vocabList);
      
      return {
        components: { story },
        provide: {
          vocabRepo,
          immersionRepo,
        },
        template: '<div style="max-width: 1000px; padding: 20px;"><story /></div>',
      };
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AddVocabOnly: Story = {
  args: {
    contentUid: undefined,
    showExistingAssociatedVocab: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Widget in add-vocab-only mode without content association. Shows dynamic form entries for vocabulary creation.',
      },
    },
  },
};

export const EmptyImmersionContent: Story = {
  args: {
    contentUid: 'content-123',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('content-123', []),
    vocabList: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Immersion content with no associated vocabulary yet. Shows empty state and add vocabulary form.',
      },
    },
  },
};

export const SpanishNewsArticle: Story = {
  args: {
    contentUid: 'news-123',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('news-123', ['vocab-1', 'vocab-2', 'vocab-3']),
    vocabList: [
      createMockVocab('vocab-1', 'economía', 'es', ['economy']),
      createMockVocab('vocab-2', 'gobierno', 'es', ['government']),
      createMockVocab('vocab-3', 'sostenibilidad', 'es', ['sustainability']),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Spanish news article with associated vocabulary showing economics and politics terms.',
      },
    },
  },
};

export const JapanesePodcast: Story = {
  args: {
    contentUid: 'podcast-456',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('podcast-456', ['vocab-ja-1', 'vocab-ja-2']),
    vocabList: [
      createMockVocab('vocab-ja-1', '会社', 'ja', ['company', 'corporation']),
      createMockVocab('vocab-ja-2', '技術', 'ja', ['technology', 'technique']),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Japanese podcast with business and technology vocabulary.',
      },
    },
  },
};

export const GermanDocumentary: Story = {
  args: {
    contentUid: 'documentary-789',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('documentary-789', ['vocab-de-1', 'vocab-de-2', 'vocab-de-3']),
    vocabList: [
      createMockVocab('vocab-de-1', 'Umweltschutz', 'de', ['environmental protection']),
      createMockVocab('vocab-de-2', 'Klimawandel', 'de', ['climate change']),
      createMockVocab('vocab-de-3', 'Nachhaltigkeit', 'de', ['sustainability']),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'German environmental documentary with compound words and technical terms.',
      },
    },
  },
};

export const TechnicalContent: Story = {
  args: {
    contentUid: 'tech-content',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('tech-content', ['tech-1', 'tech-2', 'tech-3', 'tech-4']),
    vocabList: [
      createMockVocab('tech-1', 'algoritmo', 'es', ['algorithm']),
      createMockVocab('tech-2', 'programación', 'es', ['programming']),
      createMockVocab('tech-3', 'base de datos', 'es', ['database']),
      createMockVocab('tech-4', 'inteligencia artificial', 'es', ['artificial intelligence']),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Technical programming content with Spanish IT and computer science vocabulary.',
      },
    },
  },
};

export const MedicalContent: Story = {
  args: {
    contentUid: 'medical-content',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('medical-content', ['med-1', 'med-2', 'med-3']),
    vocabList: [
      createMockVocab('med-1', 'diagnóstico', 'es', ['diagnosis']),
      createMockVocab('med-2', 'tratamiento', 'es', ['treatment']),
      createMockVocab('med-3', 'síntoma', 'es', ['symptom']),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Medical content with healthcare and clinical vocabulary.',
      },
    },
  },
};

export const CulturalContent: Story = {
  args: {
    contentUid: 'cultural-content',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('cultural-content', ['culture-1', 'culture-2', 'culture-3']),
    vocabList: [
      createMockVocab('culture-1', 'tradición', 'es', ['tradition']),
      createMockVocab('culture-2', 'patrimonio', 'es', ['heritage', 'patrimony']),
      createMockVocab('culture-3', 'artesanía', 'es', ['craftsmanship', 'handicraft']),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Cultural content with traditional and heritage vocabulary.',
      },
    },
  },
};

export const ComplexVocabulary: Story = {
  args: {
    contentUid: 'complex-content',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('complex-content', ['complex-1', 'complex-2']),
    vocabList: [
      {
        ...createMockVocab('complex-1', 'responsabilidad', 'es', ['responsibility']),
        pronunciation: '/res.pon.sa.βi.li.ˈðað/',
        notes: [
          { content: 'Abstract noun used in formal contexts', showBeforeExercise: true },
        ],
      },
      {
        ...createMockVocab('complex-2', 'procedimiento', 'es', ['procedure', 'process']),
        pronunciation: '/pro.θe.ði.ˈmjen.to/',
        notes: [
          { content: 'Legal and business term', showBeforeExercise: true },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex vocabulary with detailed pronunciation and contextual notes.',
      },
    },
  },
};

export const MultiLanguageContent: Story = {
  args: {
    contentUid: 'multilang-content',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('multilang-content', ['ml-1', 'ml-2', 'ml-3', 'ml-4']),
    vocabList: [
      createMockVocab('ml-1', 'casa', 'es', ['house']),
      createMockVocab('ml-2', 'maison', 'fr', ['house']),
      createMockVocab('ml-3', 'Haus', 'de', ['house']),
      createMockVocab('ml-4', '家', 'ja', ['house']),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-language content demonstrating vocabulary from different languages.',
      },
    },
  },
};

export const VocabularyWithoutTranslations: Story = {
  args: {
    contentUid: 'no-trans-content',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('no-trans-content', ['no-trans-1', 'no-trans-2']),
    vocabList: [
      {
        ...createMockVocab('no-trans-1', 'cognado', 'es', []),
        translations: [],
      },
      {
        ...createMockVocab('no-trans-2', 'similar', 'es', []),
        translations: [],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vocabulary items without translations (cognates or familiar words).',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    contentUid: 'loading-content',
    showExistingAssociatedVocab: true,
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          async getVocabByUID() { return null; },
          async saveVocab(vocab: Partial<VocabData>) { return createMockVocab('new', '', ''); },
        } as VocabAndTranslationRepoContract,
        immersionRepo: {
          async getImmersionContentById() {
            // Simulate long loading
            await new Promise(resolve => setTimeout(resolve, 10000));
            return createMockContent('loading-content', []);
          },
          async updateImmersionContent(content: ImmersionContentData) { return content; },
        } as ImmersionContentRepoContract,
      },
      template: '<div style="max-width: 1000px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching immersion content and associated vocabulary.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    contentUid: 'error-content',
    showExistingAssociatedVocab: true,
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        vocabRepo: {
          async getVocabByUID() { return null; },
          async saveVocab() { throw new Error('Failed to save vocabulary'); },
        } as VocabAndTranslationRepoContract,
        immersionRepo: {
          async getImmersionContentById() {
            throw new Error('Failed to load immersion content');
          },
          async updateImmersionContent() { throw new Error('Update failed'); },
        } as ImmersionContentRepoContract,
      },
      template: '<div style="max-width: 1000px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Error state when content loading or vocabulary operations fail.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    contentUid: 'demo-content',
    showExistingAssociatedVocab: true,
    contentData: createMockContent('demo-content', ['demo-vocab']),
    vocabList: [
      createMockVocab('demo-vocab', 'interactivo', 'es', ['interactive']),
    ],
  },
  play: async () => {
    console.log('Interactive demo ready - try adding new vocabulary entries and managing associations');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing vocabulary management and content association.',
      },
    },
  },
};