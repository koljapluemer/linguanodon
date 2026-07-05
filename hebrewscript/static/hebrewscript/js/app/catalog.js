// @ts-check
/** @typedef {import('../types.js').Clip} Clip */
/** @typedef {import('../types.js').PracticeCatalogEntry} PracticeCatalogEntry */

import { listDistractorCandidates } from "./model.js";

/**
 * @param {{filename: string, transcript: string}[]} rawClips
 * @param {string} audioBaseUrl
 * @returns {Clip[]}
 */
export const toClips = (rawClips, audioBaseUrl) =>
  rawClips.map((rawClip) => ({
    filename: rawClip.filename,
    transcript: rawClip.transcript,
    audioSrc: `${audioBaseUrl}${encodeURIComponent(rawClip.filename)}.opus`,
  }));

/**
 * @param {Clip[]} clips
 * @returns {PracticeCatalogEntry[]}
 */
export const buildPracticeCatalog = (clips) =>
  clips
    .map((clip) => {
      const candidates = listDistractorCandidates(clip.transcript);
      if (!candidates.length) return null;
      return { clip, candidates };
    })
    .filter((entry) => entry !== null);
