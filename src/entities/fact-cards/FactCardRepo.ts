import Dexie, { type Table } from 'dexie';
import type { FactCardRepoContract } from './FactCardRepoContract';
import type { FactCardData } from './FactCardData';
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs';

class FactCardDatabase extends Dexie {
  factCards!: Table<FactCardData>;

  constructor() {
    super('FactCardDatabase');
    this.version(1).stores({
      factCards: 'uid, language'
    });
  }
}

export class FactCardRepo implements FactCardRepoContract {
  private db = new FactCardDatabase();

  private ensureFactCardFields(factCard: FactCardData): FactCardData {
    return {
      ...factCard,
      front: factCard.front || '',
      back: factCard.back || '',
      language: factCard.language || '',
      notes: factCard.notes || [],
      priority: factCard.priority ?? 1
    };
  }

  async getAllFactCards(): Promise<FactCardData[]> {
    const factCards = await this.db.factCards.toArray();
    return factCards.map(fc => this.ensureFactCardFields(fc));
  }

  async getFactCardByUID(uid: string): Promise<FactCardData | undefined> {
    const factCard = await this.db.factCards.get(uid);
    return factCard ? this.ensureFactCardFields(factCard) : undefined;
  }

  async getFactCardsByUIDs(uids: string[]): Promise<FactCardData[]> {
    const factCards = await this.db.factCards.where('uid').anyOf(uids).toArray();
    return factCards.map(fc => this.ensureFactCardFields(fc));
  }

  async saveFactCard(factCard: Omit<FactCardData, 'uid' | 'progress'>): Promise<FactCardData> {
    const newFactCard: FactCardData = {
      uid: crypto.randomUUID(),
      language: factCard.language,
      front: factCard.front,
      back: factCard.back,
      notes: factCard.notes,
      links: factCard.links,
      priority: factCard.priority,
      doNotPractice: factCard.doNotPractice,
      progress: {
        ...createEmptyCard(),
        streak: 0,
        level: -1
      },
      origins: factCard.origins
    };

    await this.db.factCards.add(newFactCard);
    return newFactCard;
  }

  async updateFactCard(factCard: FactCardData): Promise<void> {
    await this.db.factCards.put(factCard);
  }

  async deleteFactCard(uid: string): Promise<void> {
    await this.db.factCards.delete(uid);
  }

  async scoreFactCard(factCardId: string, rating: Rating, immediateDue?: boolean): Promise<void> {
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

    // If immediateDue is true and rating was low (Again/Hard), make it due now
    if (immediateDue && (rating === Rating.Again || rating === Rating.Hard)) {
      updatedFactCard.progress.due = new Date();
    }

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

  async getRandomUnseenFactCards(count: number, languages: string[], factCardBlockList?: string[]): Promise<FactCardData[]> {
    const factCards = await this.db.factCards
      .where('language')
      .anyOf(languages)
      .filter(factCard => {
        // Must be unseen (level -1)
        if (factCard.progress.level !== -1) {
          return false;
        }
        
        // Must not be excluded from practice
        if (factCard.doNotPractice) {
          return false;
        }
        
        // Must not be in block list
        if (factCardBlockList && factCardBlockList.includes(factCard.uid)) {
          return false;
        }
        
        return true;
      })
      .toArray();

    // Shuffle and return requested count
    const shuffled = factCards.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    return selected.map(fc => this.ensureFactCardFields(fc));
  }

  async getRandomAlreadySeenDueFactCards(count: number, languages: string[], factCardBlockList?: string[]): Promise<FactCardData[]> {
    const now = new Date();
    const factCards = await this.db.factCards
      .where('language')
      .anyOf(languages)
      .filter(factCard => {
        // Must be already seen (level >= 0)
        if (factCard.progress.level < 0) {
          return false;
        }
        
        // Must be due
        if (!factCard.progress.due || factCard.progress.due > now) {
          return false;
        }
        
        // Must not be excluded from practice
        if (factCard.doNotPractice) {
          return false;
        }
        
        // Must not be in block list
        if (factCardBlockList && factCardBlockList.includes(factCard.uid)) {
          return false;
        }
        
        return true;
      })
      .toArray();

    // Shuffle and return requested count
    const shuffled = factCards.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    return selected.map(fc => this.ensureFactCardFields(fc));
  }
}