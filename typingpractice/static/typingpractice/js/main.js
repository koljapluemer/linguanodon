// @ts-check
/** @typedef {[string, string]} WordPair */
/** @typedef {{lang: string, words: WordPair[]}} PracticeConfig */

import { queueEvent, trackActiveTime } from "/static/tracking/js/client.js";

const WORDS_PER_LINE = 3;
const IDLE_TIMEOUT_MS = 10000;

// --- Vietnamese TELEX/VNI keystroke decomposition -----------------
// We already know the target word, so this only needs to go
// text -> keystrokes, not the other way round (as a real IME would).
// NFD splits precomposed letters (e.g. "ệ") into a base letter plus
// combining marks, so we only need small tables for those marks
// instead of one entry per precomposed Vietnamese letter.
//
// The tone key isn't typed at the diacritic's own letter - both
// TELEX and VNI type it at the end of the vowel cluster, before any
// trailing consonant (e.g. "tiếng" -> "ti" + "ee" + "s" + "ng").
// So letters are grouped into (consonants)(vowel run)(consonants)
// and the tone key is inserted at the vowel-run boundary.
const CIRCUMFLEX = "̂"; // â ê ô
const BREVE = "̆"; // ă
const HORN = "̛"; // ơ ư
const GRAVE = "̀"; // huyền
const ACUTE = "́"; // sắc
const TILDE = "̃"; // ngã
const HOOK_ABOVE = "̉"; // hỏi
const DOT_BELOW = "̣"; // nặng

const SHAPE_MARKS = new Set([CIRCUMFLEX, BREVE, HORN]);
const TONE_MARKS = new Set([GRAVE, ACUTE, TILDE, HOOK_ABOVE, DOT_BELOW]);
const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

const TELEX_TONE = { [GRAVE]: "f", [ACUTE]: "s", [HOOK_ABOVE]: "r", [TILDE]: "x", [DOT_BELOW]: "j" };
const VNI_TONE = { [GRAVE]: "2", [ACUTE]: "1", [HOOK_ABOVE]: "3", [TILDE]: "4", [DOT_BELOW]: "5" };

/** @param {string} base @param {string} mark @param {string} method */
function shapeSuffix(base, mark, method) {
  const upper = base !== base.toLowerCase();
  if (method === "telex") {
    if (mark === CIRCUMFLEX) return base;
    if (mark === BREVE || mark === HORN) return upper ? "W" : "w";
  } else {
    if (mark === CIRCUMFLEX) return "6";
    if (mark === BREVE) return "8";
    if (mark === HORN) return "7";
  }
  return "";
}

/** @param {string} mark @param {string} method */
function toneSuffix(mark, method) {
  return (method === "telex" ? TELEX_TONE : VNI_TONE)[mark] || "";
}

/** @param {string} ch */
function groupLetter(ch) {
  if (ch === "đ" || ch === "Đ") return { base: ch, shapeMark: "", toneMark: "", isDBar: true };
  const decomposed = ch.normalize("NFD");
  const base = decomposed[0];
  let shapeMark = "";
  let toneMark = "";
  for (const mark of decomposed.slice(1)) {
    if (SHAPE_MARKS.has(mark)) shapeMark = mark;
    else if (TONE_MARKS.has(mark)) toneMark = mark;
  }
  return { base, shapeMark, toneMark, isDBar: false };
}

/** @param {string} token @param {string} method */
function syllableToKeystrokes(token, method) {
  const groups = Array.from(token).map(groupLetter);
  const outputs = groups.map((g) => {
    if (g.isDBar) return method === "telex" ? (g.base === "đ" ? "dd" : "DD") : g.base === "đ" ? "d9" : "D9";
    return g.base + (g.shapeMark ? shapeSuffix(g.base, g.shapeMark, method) : "");
  });
  const isVowel = groups.map((g) => !g.isDBar && VOWELS.has(g.base.toLowerCase()));

  let toneStr = "";
  for (const g of groups) {
    if (g.toneMark) {
      toneStr = toneSuffix(g.toneMark, method);
      break;
    }
  }

  let runEnd = -1;
  let started = false;
  for (let i = 0; i < isVowel.length; i++) {
    if (isVowel[i]) {
      started = true;
      runEnd = i;
    } else if (started) {
      break;
    }
  }

  let result = "";
  for (let i = 0; i < groups.length; i++) {
    result += outputs[i];
    if (i === runEnd && toneStr) {
      result += toneStr;
      toneStr = "";
    }
  }
  if (toneStr) result += toneStr;
  return result;
}

/** @param {string} word @param {string} method */
function wordToKeystrokes(word, method) {
  return word
    .split(" ")
    .map((token) => syllableToKeystrokes(token, method))
    .join(" ");
}
// -------------------------------------------------------------------

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("typingpractice-config"));
/** @type {PracticeConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");
const wordPairs = config.words;

const textDisplay = /** @type {HTMLElement} */ (document.getElementById("text-display"));
const input = /** @type {HTMLInputElement} */ (document.getElementById("typing-input"));
const wpmEl = /** @type {HTMLElement} */ (document.getElementById("stat-wpm"));
const accEl = /** @type {HTMLElement} */ (document.getElementById("stat-accuracy"));
const timeEl = /** @type {HTMLElement} */ (document.getElementById("stat-time"));
const methodToggle = /** @type {HTMLElement} */ (document.getElementById("method-toggle"));

let method = localStorage.getItem("vnInputMethod") || "off";

/** @type {WordPair[][]} */
let allLines = [];
let lineIndex = 0;
/** @type {WordPair[]} */
let currentLine = [];
/** @type {WordPair[]} */
let nextLine = [];
let target = "";
let totalChars = 0;
let mistakes = 0;
let completedWords = 0;

// Timer: accumulates only while the tab is visible and typing is active.
let elapsedMs = 0;
/** @type {number | null} */
let runStart = null;
let lastKeyTime = 0;

function resumeTimer() {
  if (runStart === null && !document.hidden) {
    runStart = Date.now();
  }
}

function pauseTimer() {
  if (runStart !== null) {
    elapsedMs += Date.now() - runStart;
    runStart = null;
  }
}

function currentElapsedMs() {
  return elapsedMs + (runStart !== null ? Date.now() - runStart : 0);
}

/** @template T @param {T[]} arr @param {number} size @returns {T[][]} */
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function nextChunk() {
  const line = allLines[lineIndex % allLines.length];
  lineIndex++;
  return line;
}

// Pure function of the line's words and the current field value - no
// memory of prior renders. However the value got to its current state
// (real IME composition, or a tool like Unikey that edits already-typed
// characters in place), this always reflects what's true right now.
/** @param {WordPair[]} lineWords @param {string} typed @param {boolean} active */
function renderLine(lineWords, typed, active) {
  let html = '<div class="flex justify-center gap-8">';
  let offset = 0;
  lineWords.forEach(([vie, eng]) => {
    html += '<div class="flex flex-col items-center gap-1">';
    html += '<span class="font-mono text-2xl tracking-wide">';
    for (let i = 0; i < vie.length; i++) {
      const idx = offset + i;
      const char = vie[i];
      if (active && idx < typed.length) {
        html += `<span class="${typed[idx] === char ? "text-success" : "text-error underline"}">${char}</span>`;
      } else if (active && idx === typed.length) {
        html += `<span class="bg-primary/30 rounded">${char}</span>`;
      } else {
        html += `<span class="text-base-content/40">${char}</span>`;
      }
    }
    html += "</span>";
    html += `<span class="text-xs opacity-60">${eng}</span>`;
    if (method !== "off") {
      html += `<span class="badge badge-ghost badge-sm font-mono">${wordToKeystrokes(vie, method)}</span>`;
    }
    html += "</div>";
    offset += vie.length + 1;
  });
  html += "</div>";
  return html;
}

function renderLines() {
  textDisplay.innerHTML = renderLine(currentLine, input.value, true) + renderLine(nextLine, "", false);
}

function tick() {
  if (runStart !== null && Date.now() - lastKeyTime > IDLE_TIMEOUT_MS) {
    pauseTimer();
  }
  const elapsedMin = currentElapsedMs() / 60000;
  const typedInLine = input.value.trim().length > 0 ? input.value.trim().split(/\s+/).length : 0;
  const typedWords = completedWords + typedInLine;
  wpmEl.textContent = String(elapsedMin > 0 ? Math.round(typedWords / elapsedMin) : 0);
  const accuracy = totalChars > 0 ? Math.max(0, Math.round(((totalChars - mistakes) / totalChars) * 100)) : 100;
  accEl.textContent = accuracy + "%";
  timeEl.textContent = Math.round(currentElapsedMs() / 1000) + "s";
}

// Scored once, from the final settled value, when a line completes -
// never accumulated keystroke by keystroke. A letter that took several
// revisions to reach its correct form is graded once, as whatever it
// ended up being, not once per revision.
/** @param {string} value */
function scoreLine(value) {
  let lineMistakes = 0;
  for (let i = 0; i < target.length; i++) {
    totalChars++;
    if (value[i] !== target[i]) {
      mistakes++;
      lineMistakes++;
    }
  }
  return lineMistakes;
}

/** @param {string} value */
function advanceLine(value) {
  const lineMistakes = scoreLine(value);
  void queueEvent("typingpractice", "trial", {
    payload: {
      lang: config.lang,
      words: currentLine.map(([vie]) => vie),
      chars: target.length,
      mistakes: lineMistakes,
      isCorrect: lineMistakes === 0,
    },
  });
  completedWords += currentLine.length;
  currentLine = nextLine;
  nextLine = nextChunk();
  target = currentLine.map(([vie]) => vie).join(" ");
  input.value = "";
  renderLines();
}

/** @param {InputEvent} e */
function handleInput(e) {
  // 'input' fires reliably on every change regardless of how it got
  // there - unlike keydown, which reports e.key as the opaque value
  // "Process" for the physical keys involved while an IME is composing.
  lastKeyTime = Date.now();
  resumeTimer();

  renderLines();
  if (e.isComposing) return;
  if (input.value.length >= target.length) advanceLine(input.value);
}

/** @param {string} m */
function setMethod(m) {
  method = m;
  localStorage.setItem("vnInputMethod", m);
  methodToggle.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("btn-active", /** @type {HTMLElement} */ (btn).dataset.method === m);
  });
  renderLines();
}

function start() {
  allLines = chunk(wordPairs, WORDS_PER_LINE);
  lineIndex = 0;
  currentLine = nextChunk();
  nextLine = nextChunk();
  target = currentLine.map(([vie]) => vie).join(" ");
  input.value = "";
  methodToggle.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("btn-active", /** @type {HTMLElement} */ (btn).dataset.method === method);
  });
  renderLines();
  input.focus();
  setInterval(tick, 500);
}

input.addEventListener("input", /** @type {EventListener} */ (handleInput));

document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseTimer();
});

methodToggle.addEventListener("click", (e) => {
  const btn = /** @type {HTMLElement} */ (e.target).closest("button[data-method]");
  if (btn instanceof HTMLElement && btn.dataset.method) setMethod(btn.dataset.method);
});

start();
trackActiveTime("typingpractice");
