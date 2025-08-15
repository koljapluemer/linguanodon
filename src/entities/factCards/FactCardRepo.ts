import { FactCardStorage } from './FactCardStorage';
import type { FactCardRepoContract } from './FactCardRepoContract';
import type { FactCardData } from './FactCardData';
import { createEmptyCard, fsrs, type Rating } from 'ts-fsrs';

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

  async saveFactCard(factCard: Omit<FactCardData, 'uid' | 'progress'>): Promise<FactCardData> {
    const newFactCard: FactCardData = {
      uid: crypto.randomUUID(),
      language: factCard.language,
      front: factCard.front,
      back: factCard.back,
      notes: factCard.notes,
      priority: factCard.priority,
      doNotPractice: factCard.doNotPractice,
      progress: {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      },
      isUserCreated: factCard.isUserCreated,
      lastDownloadedAt: factCard.lastDownloadedAt
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

  async scoreFactCard(factCardId: string, rating: Rating): Promise<void> {
    const factCard = await this.getFactCardByUID(factCardId);
    if (!factCard) return;

    const f = fsrs();
    const now = new Date();
    const scheduling_cards = f.repeat(factCard.progress, now);
    
    // Get the appropriate card based on rating using Rating enum (exclude Manual rating)
    const card = scheduling_cards[rating as Exclude<Rating, Rating.Manual>].card;

    const updatedFactCard: FactCardData = {
      ...factCard,
      progress: {
        ...card,
        level: Math.max(0, factCard.progress.level + (rating >= 3 ? 1 : -1)),
        streak: rating >= 3 ? factCard.progress.streak + 1 : 0,
        last_review: new Date()
      }
    };

    await this.updateFactCard(updatedFactCard);
  }

  async updateLastReview(factCardId: string): Promise<void> {
    const factCard = await this.getFactCardByUID(factCardId);
    if (!factCard) return;

    const updatedFactCard: FactCardData = {
      ...factCard,
      progress: {
        ...factCard.progress,
        last_review: new Date()
      }
    };

    await this.updateFactCard(updatedFactCard);
  }
}