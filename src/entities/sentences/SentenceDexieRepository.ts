import Dexie from "dexie";
import type { Table } from "dexie";
import type { SentenceData } from "./SentenceData";
import type { SentenceRepository } from "./SentenceRepository";

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
      sentences: "[language+content]"
    });
  }
}

const db = new SentenceDexieDB();

// Hardcoded initial data for MVP
const initialSentences: SentenceData[] = [
  {
    language: "eng",
    content: "I want to talk to you.",
    notes: [],
    translations: [{ language: "apc", content: "انا حابب احكي معك." }],
    links: [],
    credits: [
      {
        license: "CC-BY-NC-4.0",
        owner: "guymorlan",
        ownerLink: "https://huggingface.co/guymorlan",
        source: "Huggingface - Levanti Dataset",
        sourceLink: "https://huggingface.co/datasets/guymorlan/levanti"
      }
    ],
    containsWords: [{ language: "eng", content: "want" }]
  },
  {
    language: "apc",
    content: "انا حابب احكي معك.",
    notes: [],
    translations: [{ language: "eng", content: "I want to talk to you." }],
    links: [],
    credits: [
      {
        license: "CC-BY-NC-4.0",
        owner: "guymorlan",
        ownerLink: "https://huggingface.co/guymorlan",
        source: "Huggingface - Levanti Dataset",
        sourceLink: "https://huggingface.co/datasets/guymorlan/levanti"
      }
    ],
    containsWords: [{ language: "apc", content: "حابب" }]
  }
];

// Populate DB on first load
(async () => {
  const count = await db.sentences.count();
  if (count === 0) {
    await db.sentences.bulkAdd(initialSentences);
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