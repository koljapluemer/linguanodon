import type { Meta, StoryObj } from '@storybook/vue3';
import ImmersionContentFormController from '@/features/immersion-content-form/ImmersionContentFormController.vue';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';

// Mock immersion content data
const createMockImmersionContent = (overrides: Partial<ImmersionContentData> = {}): ImmersionContentData => ({
  uid: 'content-123',
  language: 'es',
  taskType: 'immersion-content',
  title: 'Spanish News Article',
  prompt: 'Read this news article and identify 5 new vocabulary words',
  extraInfo: 'Focus on political and economic terms',
  priority: 3,
  associatedUnits: ['vocab-1', 'vocab-2', 'vocab-3'],
  evaluateAfterDoing: true,
  lastShownAt: new Date(),
  wantToDoAgain: true,
  nextShownEarliestAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
  lastDifficultyRating: 3,
  lastCorrectnessRating: 4,
  isUserCreated: true,
  lastDownloadedAt: new Date(),
  ...overrides,
});

// Mock repository
const createMockContentRepo = (mockContent?: ImmersionContentData) => ({
  async getByUid(uid: string) {
    console.log(`Loading immersion content with UID: ${uid}`);
    if (mockContent && mockContent.uid === uid) {
      return mockContent;
    }
    return null;
  },
  async update(content: ImmersionContentData) {
    console.log('Updated immersion content:', content);
    return content;
  },
  async create(content: Partial<ImmersionContentData>) {
    console.log('Created new immersion content:', content);
    return createMockImmersionContent({ ...content, uid: 'new-content-' + Date.now() } as ImmersionContentData);
  },
});

const meta: Meta<typeof ImmersionContentFormController> = {
  title: 'Features/ImmersionContentFormController',
  component: ImmersionContentFormController,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Immersion content form controller for creating and editing immersion learning tasks. Handles content management including title, prompt, priority, language settings, and task configuration. Used for managing reading materials, listening exercises, and other immersive content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    contentUid: {
      description: 'UID of immersion content to edit. If not provided, creates new content.',
      control: 'text',
    },
  },
  decorators: [
    (story, context) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(
          context.args.contentUid ? createMockImmersionContent({ uid: context.args.contentUid }) : undefined
        ),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateNew: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Create new immersion content with empty form fields and default values.',
      },
    },
  },
};

export const EditNewsArticle: Story = {
  args: {
    contentUid: 'content-news',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-news',
          title: 'El cambio climático en América Latina',
          prompt: 'Lee este artículo sobre el cambio climático y extrae vocabulario relacionado con el medio ambiente',
          extraInfo: 'Presta atención a términos científicos y políticos. Toma notas sobre las soluciones propuestas.',
          language: 'es',
          priority: 4,
          taskType: 'read-news-article',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Edit news article immersion content with environmental theme.',
      },
    },
  },
};

export const EditPodcastEpisode: Story = {
  args: {
    contentUid: 'content-podcast',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-podcast',
          title: 'Podcast: Historia de España',
          prompt: 'Escucha este episodio sobre la Guerra Civil Española y anota fechas importantes',
          extraInfo: 'Duración: 45 minutos. Nivel: Intermedio-Avanzado. Incluye entrevistas con historiadores.',
          language: 'es',
          priority: 3,
          taskType: 'listen-podcast',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Edit podcast episode immersion content with historical focus.',
      },
    },
  },
};

export const EditVideoContent: Story = {
  args: {
    contentUid: 'content-video',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-video',
          title: 'Documental: La cocina mexicana',
          prompt: 'Ve este documental sobre la cocina tradicional mexicana y aprende términos culinarios',
          extraInfo: 'Incluye subtítulos en español. Enfócate en ingredientes, técnicas de cocción y platos regionales.',
          language: 'es',
          priority: 2,
          taskType: 'watch-documentary',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Edit video documentary content about Mexican cuisine.',
      },
    },
  },
};

export const EditJapaneseContent: Story = {
  args: {
    contentUid: 'content-japanese',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-japanese',
          title: '日本の文化について',
          prompt: 'この記事を読んで、日本の伝統的な文化について学んでください',
          extraInfo: '漢字、ひらがな、カタカナが混在しています。わからない漢字は辞書で調べてください。',
          language: 'ja',
          priority: 4,
          taskType: 'read-cultural-article',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Japanese immersion content with mixed writing systems and cultural focus.',
      },
    },
  },
};

export const EditGermanContent: Story = {
  args: {
    contentUid: 'content-german',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-german',
          title: 'Deutsche Wirtschaftsnachrichten',
          prompt: 'Lesen Sie diese Wirtschaftsnachrichten und notieren Sie sich Fachbegriffe',
          extraInfo: 'Schwerpunkt auf Automobilindustrie und erneuerbare Energien. Achten Sie auf Komposita und Fachwortschatz.',
          language: 'de',
          priority: 3,
          taskType: 'read-business-news',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'German business news content with technical vocabulary focus.',
      },
    },
  },
};

export const EditArabicContent: Story = {
  args: {
    contentUid: 'content-arabic',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-arabic',
          title: 'الأدب العربي الحديث',
          prompt: 'اقرأ هذا النص عن الأدب العربي المعاصر واستخرج المفردات الأدبية',
          extraInfo: 'النص يتضمن مقتطفات من أعمال نجيب محفوظ وأمين معلوف. انتبه للأساليب البلاغية.',
          language: 'ar',
          priority: 5,
          taskType: 'read-literature',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Arabic literature content testing RTL layout and literary vocabulary.',
      },
    },
  },
};

export const EditTechnicalContent: Story = {
  args: {
    contentUid: 'content-tech',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-tech',
          title: 'Introducción a la Inteligencia Artificial',
          prompt: 'Lee este artículo técnico sobre IA y machine learning, enfócate en terminología especializada',
          extraInfo: 'Conceptos clave: algoritmos, redes neuronales, aprendizaje automático, big data. Incluye diagramas y código de ejemplo.',
          language: 'es',
          priority: 5,
          taskType: 'read-technical-article',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Technical content about AI with specialized vocabulary and concepts.',
      },
    },
  },
};

export const EditLowPriorityContent: Story = {
  args: {
    contentUid: 'content-low-priority',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-low-priority',
          title: 'Recetas de cocina fáciles',
          prompt: 'Mira estas recetas simples y aprende vocabulario de cocina básico',
          extraInfo: 'Recetas para principiantes. Ingredientes comunes y técnicas básicas.',
          language: 'es',
          priority: 1,
          taskType: 'read-recipes',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Low-priority content for casual learning with simple vocabulary.',
      },
    },
  },
};

export const EditLongContent: Story = {
  args: {
    contentUid: 'content-long',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: createMockContentRepo(createMockImmersionContent({
          uid: 'content-long',
          title: 'Análisis completo del sistema educativo latinoamericano: retos, oportunidades y perspectivas futuras en el contexto de la globalización',
          prompt: 'Realiza un análisis profundo de este extenso reporte sobre educación en América Latina, identificando vocabulario académico, estadísticas relevantes y propuestas de mejora. Presta especial atención a los términos relacionados con políticas educativas, metodologías pedagógicas innovadoras y el impacto de la tecnología en el aula.',
          extraInfo: 'Este es un documento académico de 150 páginas que incluye gráficos, tablas estadísticas y entrevistas con expertos en educación. El análisis debe ser exhaustivo y sistemático, dividiendo el contenido en secciones temáticas. Se recomienda tomar notas detalladas y crear un glosario con términos especializados. El documento abarca desde educación primaria hasta universitaria, incluyendo educación a distancia y programas de formación profesional.',
          language: 'es',
          priority: 4,
          taskType: 'analyze-academic-report',
        })),
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Content with very long title, prompt, and extra info to test text wrapping and layout.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    contentUid: 'content-loading',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: {
          async getByUid() {
            // Simulate long loading
            await new Promise(resolve => setTimeout(resolve, 10000));
            return createMockImmersionContent({ uid: 'content-loading' });
          },
          async update(content: ImmersionContentData) { return content; },
          async create(content: Partial<ImmersionContentData>) { return createMockImmersionContent(content as ImmersionContentData); },
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching immersion content data from repository.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    contentUid: 'content-error',
  },
  decorators: [
    (story) => ({
      components: { story },
      provide: {
        immersionContentRepo: {
          async getByUid() {
            throw new Error('Failed to load immersion content');
          },
          async update() { throw new Error('Save failed'); },
          async create() { throw new Error('Create failed'); },
        },
      },
      template: '<div style="max-width: 800px; padding: 20px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Error state when immersion content loading or saving fails.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {},
  play: async () => {
    console.log('Interactive demo ready - try filling out the immersion content form');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing form validation, auto-save, and content management.',
      },
    },
  },
};