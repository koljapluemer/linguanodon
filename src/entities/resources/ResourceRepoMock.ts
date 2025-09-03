import type { ResourceRepoContract } from './ResourceRepoContract';
import type { ResourceData } from './ResourceData';

export class ResourceRepoMock implements ResourceRepoContract {
  
  private createSampleResource(overrides: Partial<ResourceData> = {}): ResourceData {
    return {
      uid: crypto.randomUUID(),
      language: 'en',
      isImmersionContent: false,
      title: 'Sample Resource',
      content: 'This is sample resource content for testing purposes.',
      finishedExtracting: false,
      priority: 1,
      vocab: [],
      factCards: [],
      notes: [],
      origins: ['user-added'],
      ...overrides
    };
  }

  async getAllResources(): Promise<ResourceData[]> {
    console.info('ResourceRepoMock: getAllResources() - returning 3 sample resources');
    return [
      this.createSampleResource({ 
        title: 'English Article',
        language: 'en',
        isImmersionContent: true,
        vocab: ['vocab-1', 'vocab-2']
      }),
      this.createSampleResource({ 
        title: 'French Story',
        language: 'fr',
        isImmersionContent: true,
        factCards: ['fact-1']
      }),
      this.createSampleResource({ 
        title: 'Grammar Notes',
        language: 'en',
        isImmersionContent: false,
        finishedExtracting: true
      })
    ];
  }

  async getResourceById(uid: string): Promise<ResourceData | undefined> {
    console.info(`ResourceRepoMock: getResourceById(${uid}) - returning sample resource`);
    return this.createSampleResource({ 
      uid,
      title: `Resource ${uid.slice(0, 8)}`
    });
  }

  async getResourceByTitleAndLanguage(title: string, language: string): Promise<ResourceData | undefined> {
    console.info(`ResourceRepoMock: getResourceByTitleAndLanguage("${title}", ${language}) - returning matching resource`);
    return this.createSampleResource({ 
      title,
      language
    });
  }

  async getRandomDueResource(languages?: string[], setsToAvoid?: string[]): Promise<ResourceData | null> {
    console.info(`ResourceRepoMock: getRandomDueResource([${languages?.join(', ') || 'all'}], ${setsToAvoid ? '[avoided-sets]' : 'no-avoided-sets'}) - returning due resource`);
    return this.createSampleResource({
      title: 'Due Resource',
      language: languages?.[0] || 'en',
      lastShownAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isImmersionContent: true,
      vocab: ['vocab-1', 'vocab-2', 'vocab-3']
    });
  }

  async getValidImmersionResources(languages: string[]): Promise<ResourceData[]> {
    console.info(`ResourceRepoMock: getValidImmersionResources([${languages.join(', ')}]) - returning 2 immersion resources`);
    return [
      this.createSampleResource({
        title: 'Immersion Article 1',
        language: languages[0] || 'en',
        isImmersionContent: true,
        vocab: ['vocab-1', 'vocab-2']
      }),
      this.createSampleResource({
        title: 'Immersion Story 2',
        language: languages[1] || languages[0] || 'en',
        isImmersionContent: true,
        factCards: ['fact-1', 'fact-2']
      })
    ];
  }

  async saveResource(resource: Omit<ResourceData, 'uid' | 'tasks' | 'lastShownAt'>): Promise<ResourceData> {
    console.info(`ResourceRepoMock: saveResource("${resource.title}") - would save new resource`);
    return this.createSampleResource({
      ...resource,
      uid: crypto.randomUUID()
    });
  }

  async updateResource(resource: ResourceData): Promise<ResourceData> {
    console.info(`ResourceRepoMock: updateResource(${resource.uid}: "${resource.title}") - would update resource`);
    return resource;
  }

  async deleteResource(uid: string): Promise<void> {
    console.info(`ResourceRepoMock: deleteResource(${uid}) - would delete resource`);
  }

  async disconnectVocabFromResource(resourceUid: string, vocabUid: string): Promise<void> {
    console.info(`ResourceRepoMock: disconnectVocabFromResource(resource: ${resourceUid}, vocab: ${vocabUid}) - would disconnect vocab from resource`);
  }
}