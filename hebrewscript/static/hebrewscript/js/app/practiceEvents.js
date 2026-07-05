// @ts-check
/** @typedef {import('../types.js').Clip} Clip */
/** @typedef {import('../types.js').StoredClip} StoredClip */
/** @typedef {import('../types.js').DistractorCandidate} DistractorCandidate */
/** @typedef {import('../types.js').PracticeEvent} PracticeEvent */
/** @typedef {import('../types.js').PracticeExportSnapshot} PracticeExportSnapshot */

import { addEvent, getAllEvents, importEventRows } from "./idb.js";
import { HEBREW_LETTER_KEYS } from "./model.js";

/**
 * @param {Pick<Clip, 'filename' | 'transcript'>} clip
 * @returns {StoredClip}
 */
export const toStoredClip = (clip) => ({ filename: clip.filename, transcript: clip.transcript });

/**
 * @param {DistractorCandidate} candidate
 */
export const toPracticeEventAnalytics = (candidate) => ({
  analyticsVersion: /** @type {1} */ (1),
  changedIndex: candidate.changedIndex,
  correctCharacter: candidate.correctCharacter,
  distractorCharacter: candidate.distractorCharacter,
  correctLetter: candidate.correctLetter,
  distractorLetter: candidate.distractorLetter,
});

/**
 * Rebuilds a fresh plain object from primitive field access before handing
 * to IndexedDB. Necessary, not just defensive: Vue's ref()/reactive() wraps
 * any object assigned to a ref's .value in a reactive Proxy, and the
 * structured-clone algorithm IndexedDB uses cannot clone a Proxy
 * (DataCloneError). Reading primitives back out through the Proxy and
 * reconstructing a literal strips the wrapper.
 * @param {PracticeEvent} event
 * @returns {PracticeEvent}
 */
const clonePracticeEvent = (event) => ({
  eventType: event.eventType,
  clip: { filename: event.clip.filename, transcript: event.clip.transcript },
  timestamp: event.timestamp,
  selectionMode: event.selectionMode,
  distractor: event.distractor,
  duration_ms: event.duration_ms,
  selectedTranscript: event.selectedTranscript,
  isCorrect: event.isCorrect,
  analyticsVersion: event.analyticsVersion,
  changedIndex: event.changedIndex,
  correctCharacter: event.correctCharacter,
  distractorCharacter: event.distractorCharacter,
  correctLetter: event.correctLetter,
  distractorLetter: event.distractorLetter,
});

/**
 * @param {PracticeEvent} event
 */
export const appendPracticeEvent = (event) => addEvent(clonePracticeEvent(event));

/** @param {PracticeEvent} left @param {PracticeEvent} right */
const compareEvents = (left, right) => {
  const timestampComparison = left.timestamp.localeCompare(right.timestamp);
  if (timestampComparison !== 0) return timestampComparison;
  return (left.id ?? 0) - (right.id ?? 0);
};

/** @returns {Promise<PracticeEvent[]>} */
export const listPracticeEvents = async () => {
  const rows = await getAllEvents();
  return [...rows].sort(compareEvents);
};

/** @returns {Promise<PracticeExportSnapshot>} */
export const readPracticeExportSnapshot = async () => {
  const events = await listPracticeEvents();
  return {
    exported_at: new Date().toISOString(),
    event_log: events.map((event) => ({ ...event, id: undefined })),
  };
};

const PRACTICE_EVENT_TYPES = new Set(["roundStarted", "answer", "audioListened", "clipHidden"]);
const SELECTION_MODES = new Set(["strategyA", "strategyB"]);
const LETTER_KEYS = new Set(HEBREW_LETTER_KEYS);

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isObject = (value) => typeof value === "object" && value !== null;

/** @param {unknown} value @param {string} field */
const readOptionalString = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`Invalid ${field}.`);
  return value;
};

/** @param {unknown} value @param {string} field */
const readOptionalNumber = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) throw new Error(`Invalid ${field}.`);
  return value;
};

/** @param {unknown} value @param {string} field */
const readOptionalBoolean = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new Error(`Invalid ${field}.`);
  return value;
};

/** @param {unknown} value @param {Set<string>} allowedValues @param {string} field */
const readOptionalStringLiteral = (value, allowedValues, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !allowedValues.has(value)) throw new Error(`Invalid ${field}.`);
  return value;
};

/** @param {unknown} value @param {Set<string>} allowedValues @param {string} field */
const readOptionalNullableStringLiteral = (value, allowedValues, field) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string" || !allowedValues.has(value)) throw new Error(`Invalid ${field}.`);
  return value;
};

/**
 * @param {unknown} value
 * @returns {PracticeEvent}
 */
const parsePracticeEvent = (value) => {
  if (!isObject(value)) throw new Error("Invalid event_log entry.");

  const clip = value.clip;
  if (!isObject(clip) || typeof clip.filename !== "string" || typeof clip.transcript !== "string") {
    throw new Error("Invalid event clip.");
  }

  if (typeof value.timestamp !== "string") throw new Error("Invalid event timestamp.");
  if (typeof value.eventType !== "string" || !PRACTICE_EVENT_TYPES.has(value.eventType)) {
    throw new Error("Invalid event type.");
  }

  return {
    eventType: /** @type {PracticeEvent['eventType']} */ (value.eventType),
    clip: { filename: clip.filename, transcript: clip.transcript },
    timestamp: value.timestamp,
    selectionMode: /** @type {PracticeEvent['selectionMode']} */ (
      readOptionalStringLiteral(value.selectionMode, SELECTION_MODES, "selectionMode")
    ),
    distractor: readOptionalString(value.distractor, "distractor"),
    duration_ms: value.duration_ms === null ? null : readOptionalNumber(value.duration_ms, "duration_ms"),
    selectedTranscript: readOptionalString(value.selectedTranscript, "selectedTranscript"),
    isCorrect: readOptionalBoolean(value.isCorrect, "isCorrect"),
    analyticsVersion:
      value.analyticsVersion === undefined
        ? undefined
        : value.analyticsVersion === 1
          ? /** @type {1} */ (1)
          : (() => {
              throw new Error("Invalid analyticsVersion.");
            })(),
    changedIndex: readOptionalNumber(value.changedIndex, "changedIndex"),
    correctCharacter: readOptionalString(value.correctCharacter, "correctCharacter"),
    distractorCharacter: readOptionalString(value.distractorCharacter, "distractorCharacter"),
    correctLetter: readOptionalNullableStringLiteral(value.correctLetter, LETTER_KEYS, "correctLetter"),
    distractorLetter: readOptionalNullableStringLiteral(value.distractorLetter, LETTER_KEYS, "distractorLetter"),
  };
};

/**
 * @param {unknown} snapshot
 * @returns {Promise<{importedCount: number, skippedCount: number}>}
 */
export const importPracticeExportSnapshot = async (snapshot) => {
  if (!isObject(snapshot) || !Array.isArray(snapshot.event_log)) {
    throw new Error("Invalid tracked data file.");
  }

  const importedEvents = snapshot.event_log.map((event) => parsePracticeEvent(event));
  importedEvents.sort((left, right) => left.timestamp.localeCompare(right.timestamp));

  return importEventRows(importedEvents);
};
