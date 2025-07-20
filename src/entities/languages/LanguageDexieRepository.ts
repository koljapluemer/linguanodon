import Dexie from "dexie";
import type { Table } from "dexie";
import type { Language } from "./Language";
import type { LanguageRepository } from "./LanguageRepository";

/**
 * Dexie database for storing Language entities.
 */
class LanguageDexieDB extends Dexie {
  /**
   * Dexie table for Language entities, keyed by code.
   */
  languages!: Table<Language, string>; // code as primary key
  /**
   * Initializes the Dexie database and sets up the schema for languages.
   */
  constructor() {
    super("LanguageDexieDB");
    this.version(1).stores({
      languages: "code"
    });
  }
}

const db = new LanguageDexieDB();

// Hardcoded initial data for MVP
const initialLanguages: Language[] = [
  {
    code: "apc",
    name: "Levantine Arabic",
    isAddedByUser: false,
    isTarget: true,
    isNative: false
  },
  {
    code: "eng",
    name: "English",
    isAddedByUser: false,
    isTarget: false,
    isNative: true
  }
];

// Populate DB on first load
(async () => {
  const count = await db.languages.count();
  if (count === 0) {
    await db.languages.bulkAdd(initialLanguages);
  }
})();

/**
 * Dexie-based implementation of the LanguageRepository interface.
 */
export class LanguageDexieRepository implements LanguageRepository {
  /**
   * Get all languages from the database.
   */
  async getAll() {
    return db.languages.toArray();
  }
  /**
   * Get a language by code.
   */
  async getByCode(code: string) {
    return db.languages.get(code);
  }
  /**
   * Add a new language to the database.
   */
  async add(language: Language) {
    await db.languages.add(language);
  }
  /**
   * Update an existing language in the database.
   */
  async update(language: Language) {
    await db.languages.put(language);
  }
  /**
   * Delete a language from the database by code.
   */
  async delete(code: string) {
    await db.languages.delete(code);
  }

  /**
   * Get user's target languages.
   */
  async getUserTargetLanguages() {
    return db.languages.filter(lang => lang.isTarget).toArray();
  }

  /**
   * Get user's native languages.
   */
  async getUserNativeLanguages() {
    return db.languages.filter(lang => lang.isNative).toArray();
  }
} 