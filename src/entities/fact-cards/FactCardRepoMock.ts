import type { FactCardRepoContract } from './FactCardRepoContract';
import type { FactCardData } from './FactCardData';
import type { Rating } from 'ts-fsrs';
import { createEmptyCard } from 'ts-fsrs';

export class FactCardRepoMock implements FactCardRepoContract {
  
  private createSampleFactCard(overrides: Partial<FactCardData> = {}): FactCardData {
    return {
      uid: crypto.randomUUID(),
      language: 'en',
      front: 'Sample question or prompt',
      back: 'Sample answer or explanation',
      notes: [],
      links: [],
      priority: 1,
      doNotPractice: false,
      progress: {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      },
      origins: ['user-added'],
      ...overrides
    };
  }

  // Basic CRUD operations
  async getAllFactCards(): Promise<FactCardData[]> {
    console.info('FactCardRepoMock: getAllFactCards() - returning 3 sample fact cards');
    return [
      this.createSampleFactCard({
        front: 'What is the capital of France?',
        back: 'Paris',
        language: 'en'
      }),
      this.createSampleFactCard({
        front: 'Comment dit-on "hello" en français?',
        back: 'Bonjour',
        language: 'fr'
      }),
      this.createSampleFactCard({
        front: 'What year did World War II end?',
        back: '1945',
        language: 'en'
      })
    ];
  }

  async getFactCardByUID(uid: string): Promise<FactCardData | undefined> {
    console.info(`FactCardRepoMock: getFactCardByUID(${uid}) - returning sample fact card`);
    return this.createSampleFactCard({
      uid,
      front: `Question for card ${uid.slice(0, 8)}`,
      back: `Answer for card ${uid.slice(0, 8)}`
    });
  }

  async saveFactCard(factCard: Omit<FactCardData, 'uid' | 'progress'>): Promise<FactCardData> {
    console.info(`FactCardRepoMock: saveFactCard("${factCard.front}") - would save new fact card`);
    return this.createSampleFactCard({
      ...factCard,
      uid: crypto.randomUUID()
    });
  }

  async updateFactCard(factCard: FactCardData): Promise<void> {
    console.info(`FactCardRepoMock: updateFactCard(${factCard.uid}: "${factCard.front}") - would update fact card`);
  }

  async deleteFactCard(uid: string): Promise<void> {
    console.info(`FactCardRepoMock: deleteFactCard(${uid}) - would delete fact card`);
  }

  // Progress operations
  async scoreFactCard(factCardId: string, rating: Rating): Promise<void> {
    console.info(`FactCardRepoMock: scoreFactCard(${factCardId}, ${rating}) - would score fact card with rating`);
  }

  async updateLastReview(factCardId: string): Promise<void> {
    console.info(`FactCardRepoMock: updateLastReview(${factCardId}) - would update last review time`);
  }

  // Task generation operations
  async getRandomUnseenFactCards(count: number, languages: string[], factCardBlockList?: string[]): Promise<FactCardData[]> {
    console.info(`FactCardRepoMock: getRandomUnseenFactCards(${count}, [${languages.join(', ')}], ${factCardBlockList ? '[blocked]' : 'no-blocks'}) - returning ${count} unseen fact cards`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleFactCard({
        front: `Unseen question ${i + 1}`,
        back: `Unseen answer ${i + 1}`,
        language: languages[i % languages.length] || 'en'
      })
    );
  }

  async getRandomAlreadySeenDueFactCards(count: number, languages: string[], factCardBlockList?: string[]): Promise<FactCardData[]> {
    console.info(`FactCardRepoMock: getRandomAlreadySeenDueFactCards(${count}, [${languages.join(', ')}], ${factCardBlockList ? '[blocked]' : 'no-blocks'}) - returning ${count} due fact cards`);
    return Array.from({ length: count }, (_, i) => 
      this.createSampleFactCard({
        front: `Due question ${i + 1}`,
        back: `Due answer ${i + 1}`,
        language: languages[i % languages.length] || 'en',
        progress: {
          ...createEmptyCard(),
          streak: 2,
          level: 1,
          due: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        }
      })
    );
  }
}