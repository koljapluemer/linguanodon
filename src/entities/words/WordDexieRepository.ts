import Dexie from "dexie";
import type { Table } from "dexie";
import type { WordData } from "./Word";
import type { WordRepository } from "./WordRepository";

/**
 * Dexie database for storing WordData entities.
 */
class WordDexieDB extends Dexie {
  /**
   * Dexie table for WordData entities, keyed by [language, content].
   */
  words!: Table<WordData, [string, string]>; // [language, content] as compound key
  /**
   * Initializes the Dexie database and sets up the schema for words.
   */
  constructor() {
    super("WordDexieDB");
    this.version(1).stores({
      words: "[language+content]"
    });
  }
}

const db = new WordDexieDB();

// Hardcoded initial data for MVP
const initialWords: WordData[] = [
  {
    language: "eng",
    content: "want",
    notes: [{ content: "verb", showBeforeExercise: true }],
    translations: [{ language: "apc", content: "حابب" }],
    links: [],
    otherForms: [],
    synonyms: [],
    appearsIn: [{ language: "eng", content: "I want to talk to you." }]
  },
  {
    language: "apc",
    content: "حابب",
    notes: [{ content: "verb", showBeforeExercise: true }],
    translations: [{ language: "eng", content: "want" }],
    links: [{ label: "Wiktionary", url: "https://en.wiktionary.org/wiki/%D8%AD%D8%A7%D8%A8%D8%A8" }],
    otherForms: [],
    synonyms: [],
    appearsIn: [{ language: "apc", content: "انا حابب احكي معك." }]
  }
];

// Populate DB on first load
(async () => {
  const count = await db.words.count();
  if (count === 0) {
    await db.words.bulkAdd(initialWords);
  }
})();

/**
 * Dexie-based implementation of the WordRepository interface.
 */
export class WordDexieRepository implements WordRepository {
  /**
   * Get all words from the database.
   */
  async getAll() {
    return db.words.toArray();
  }
  /**
   * Get a word by language and content.
   */
  async getById(language: string, content: string) {
    return db.words.get([language, content]);
  }
  /**
   * Add a new word to the database.
   */
  async add(word: WordData) {
    await db.words.add(word);
  }
  /**
   * Update an existing word in the database.
   */
  async update(word: WordData) {
    await db.words.put(word);
  }
  /**
   * Delete a word from the database by language and content.
   */
  async delete(language: string, content: string) {
    await db.words.delete([language, content]);
  }
} 