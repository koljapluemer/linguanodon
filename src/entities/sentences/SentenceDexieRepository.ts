import Dexie from "dexie";
import type { Table } from "dexie";
import type { SentenceData } from "./SentenceData";
import type { SentenceRepository } from "./SentenceRepository";
import sentenceExampleData from "./sentenceExampleData.json";

/**
 * Dexie database for storing SentenceData entities.
 */
class SentenceDexieDB extends Dexie {
  /**
   * Dexie table for SentenceData entities, keyed by [language, content].
   */
  sentences!: Table<SentenceData, [string, string]>; // [language, content] as compound key
  /**
   * Initializes the Dexie database and sets up the schema for sentences.
   */
  constructor() {
    super("SentenceDexieDB");
    this.version(1).stores({
      sentences: "[language+content], type, notes, translations, links, credits, containsWords"
    });
  }
}

const db = new SentenceDexieDB();

// Populate DB on first load
(async () => {
  const count = await db.sentences.count();
  if (count === 0) {
    await db.sentences.bulkAdd(sentenceExampleData as SentenceData[]);
  }
})();

/**
 * Dexie-based implementation of the SentenceRepository interface.
 */
export class SentenceDexieRepository implements SentenceRepository {
  /**
   * Get all sentences from the database.
   */
  async getAll() {
    return db.sentences.toArray();
  }
  /**
   * Get a sentence by language and content.
   */
  async getById(language: string, content: string) {
    return db.sentences.get([language, content]);
  }
  /**
   * Add a new sentence to the database.
   */
  async add(sentence: SentenceData) {
    await db.sentences.add(sentence);
  }
  /**
   * Update an existing sentence in the database.
   */
  async update(sentence: SentenceData) {
    await db.sentences.put(sentence);
  }
  /**
   * Delete a sentence from the database by language and content.
   */
  async delete(language: string, content: string) {
    await db.sentences.delete([language, content]);
  }
} 