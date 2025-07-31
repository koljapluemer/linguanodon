import { FactCardStorage } from './FactCardStorage';
import type { FactCardRepoContract } from './FactCardRepoContract';
import type { FactCardData } from './FactCardData';
import { createEmptyCard } from 'ts-fsrs';

export class FactCardRepo implements FactCardRepoContract {
  private storage = new FactCardStorage();

  private ensureFactCardFields(factCard: FactCardData): FactCardData {
    return {
      ...factCard,
      front: factCard.front || '',
      back: factCard.back || '',
      language: factCard.language || '',
      notes: factCard.notes || [],
      priority: factCard.priority ?? 1,
      isUserCreated: factCard.isUserCreated ?? true,
      lastDownloadedAt: factCard.lastDownloadedAt ?? null
    };
  }

  async getAllFactCards(): Promise<FactCardData[]> {
    const factCards = await this.storage.getAll();
    return factCards.map(fc => this.ensureFactCardFields(fc));
  }

  async getFactCardByUID(uid: string): Promise<FactCardData | undefined> {
    const factCard = await this.storage.getByUID(uid);
    return factCard ? this.ensureFactCardFields(factCard) : undefined;
  }

  async saveFactCard(factCard: Partial<FactCardData>): Promise<FactCardData> {
    const newFactCard: FactCardData = {
      uid: factCard.uid || crypto.randomUUID(),
      language: factCard.language || '',
      front: factCard.front || '',
      back: factCard.back || '',
      notes: factCard.notes || [],
      priority: factCard.priority ?? 1,
      doNotPractice: factCard.doNotPractice,
      progress: factCard.progress || {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      },
      isUserCreated: factCard.isUserCreated ?? true,
      lastDownloadedAt: factCard.lastDownloadedAt ?? null
    };

    await this.storage.add(newFactCard);
    return newFactCard;
  }

  async updateFactCard(factCard: FactCardData): Promise<void> {
    await this.storage.update(factCard);
  }

  async deleteFactCard(uid: string): Promise<void> {
    await this.storage.delete(uid);
  }
}