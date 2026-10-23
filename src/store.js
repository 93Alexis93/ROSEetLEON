import { MATH_DOMAINS, updateMathProgress } from "./child/math-engine.js";

const KEY = "rose-leon-data";
export const SCHEMA_VERSION = 3;
const CHILDREN = ["leon", "rose"];
const WORD_PATTERN = /^[A-Za-zÀ-ÿ-]{2,24}$/;
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
const integerInRange = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.floor(number))) : fallback;
};

const profile = () => ({
  sessions: 0,
  correct: 0,
  attempts: 0,
  stickers: 0,
  mathProgress: {}
});

const initial = () => ({
  schemaVersion: SCHEMA_VERSION,
  profiles: { leon: profile(), rose: profile() },
  settings: {
    voice: true,
    sounds: true,
    leonMinutes: 4,
    roseMinutes: 2,
    parentPin: ""
  },
  history: [],
  crisisLog: [],
  customWords: []
});

function sanitizeMathProgress(value) {
  if (!isRecord(value)) return {};
  const progress = {};

  for (const { id } of MATH_DOMAINS) {
    const entry = value[id];
    if (!isRecord(entry)) continue;

    let correctStreak = integerInRange(entry.correctStreak, 0, 2, 0);
    let errorStreak = integerInRange(entry.errorStreak, 0, 1, 0);

    // Écarte les séries anciennes qui auraient déjà franchi un seuil en schéma 2.
    if (Number(entry.correctStreak) >= 3 || Number(entry.errorStreak) >= 2) {
      correctStreak = 0;
      errorStreak = 0;
    } else if (correctStreak > 0 && errorStreak > 0) {
      correctStreak = 0;
      errorStreak = 0;
    }

    progress[id] = {
      difficulty: integerInRange(entry.difficulty, 1, 3, 1),
      correctStreak,
      errorStreak,
      attempts: integerInRange(entry.attempts, 0, 1000000, 0),
      correct: integerInRange(entry.correct, 0, 1000000, 0)
    };
    progress[id].correct = Math.min(progress[id].correct, progress[id].attempts);
  }

  return progress;
}

function sanitizeProfile(value) {
  const source = isRecord(value) ? value : {};
  const attempts = integerInRange(source.attempts, 0, 1000000, 0);
  const correct = Math.min(integerInRange(source.correct, 0, 1000000, 0), attempts);
  const stickers = Math.min(
    integerInRange(source.stickers, 0, 1000000, 0),
    Math.floor(correct / 3)
  );
  return {
    sessions: integerInRange(source.sessions, 0, 1000000, 0),
    correct,
    attempts,
    stickers,
    mathProgress: sanitizeMathProgress(source.mathProgress)
  };
}

function sanitizeSettings(value, parentPinFallback = "") {
  const source = isRecord(value) ? value : {};
  const rawPin = typeof source.parentPin === "string" ? source.parentPin : "";
  const parentPin = /^\d{4}$/.test(rawPin) ? rawPin : parentPinFallback;

  return {
    voice: typeof source.voice === "boolean" ? source.voice : true,
    sounds: typeof source.sounds === "boolean" ? source.sounds : true,
    leonMinutes: integerInRange(source.leonMinutes, 1, 60, 4),
    roseMinutes: integerInRange(source.roseMinutes, 1, 60, 2),
    parentPin
  };
}

function sanitizeHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(entry =>
      isRecord(entry) &&
      CHILDREN.includes(entry.child) &&
      typeof entry.date === "string" &&
      Number.isFinite(Date.parse(entry.date))
    )
    .slice(-200)
    .map(entry => ({ child: entry.child, date: entry.date }));
}

function sanitizeCustomWords(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const words = [];

  for (const entry of value) {
    const word = typeof entry === "string" ? entry.trim() : isRecord(entry) && typeof entry.word === "string" ? entry.word.trim() : "";
    if (!WORD_PATTERN.test(word)) continue;
    const key = word.toLocaleLowerCase("fr");
    if (seen.has(key)) continue;
    seen.add(key);

    const safeEntry = { word };
    const createdAt = isRecord(entry) && typeof entry.createdAt === "string" && Number.isFinite(Date.parse(entry.createdAt))
      ? entry.createdAt
      : null;
    if (createdAt) safeEntry.createdAt = createdAt;
    words.push(safeEntry);
    if (words.length >= 100) break;
  }

  return words;
}

function migrate(data, parentPinFallback = "") {
  if (!isRecord(data)) return initial();

  const base = initial();
  const oldProfiles = isRecord(data.profiles) ? data.profiles : {};
  const profiles = {};

  for (const child of CHILDREN) {
    profiles[child] = sanitizeProfile(oldProfiles[child]);
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    profiles,
    settings: sanitizeSettings(data.settings, parentPinFallback),
    history: sanitizeHistory(data.history),
    // This app does not currently collect crisis details.
    crisisLog: [],
    customWords: sanitizeCustomWords(data.customWords)
  };
}

let state;
try {
  state = migrate(JSON.parse(localStorage.getItem(KEY) || "null"));
} catch {
  state = initial();
}

const listeners = new Set();

export const getState = () => JSON.parse(JSON.stringify(state));

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    throw Error("Stockage indisponible : libère de l’espace ou exporte tes données.");
  }
  listeners.forEach(listener => listener(getState()));
}

export function update(fn) {
  const previous = state;
  const next = getState();
  fn(next);
  next.schemaVersion = SCHEMA_VERSION;
  state = next;

  try {
    persist();
  } catch (error) {
    state = previous;
    throw error;
  }

  return getState();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function recordAnswer(child, ok) {
  update(data => {
    const childProfile = data.profiles[child];
    childProfile.attempts++;
    if (ok) {
      childProfile.correct++;
      childProfile.stickers = Math.floor(childProfile.correct / 3);
    }
  });
}

export function recordMathAnswer(domain, ok, options = {}) {
  if (options.firstTry === false) return;
  update(data => {
    const childProfile = data.profiles.leon;
    const previous = childProfile.mathProgress[domain] || {
      difficulty: 1,
      correctStreak: 0,
      errorStreak: 0,
      attempts: 0,
      correct: 0
    };
    childProfile.mathProgress[domain] = updateMathProgress(previous, {
      correct: ok,
      helped: options.helped === true,
      firstTry: true
    });
  });
}

export function recordSession(child) {
  update(data => {
    data.profiles[child].sessions++;
    data.history.push({ child, date: new Date().toISOString() });
    if (data.history.length > 200) data.history = data.history.slice(-200);
  });
}

export function exportData() {
  const backup = getState();
  delete backup.settings.parentPin;
  return JSON.stringify({ ...backup, exportedAt: new Date().toISOString() }, null, 2);
}

export function importData(text) {
  if (typeof text !== "string" || text.length > MAX_BACKUP_BYTES) {
    throw Error("Fichier de sauvegarde trop volumineux ou invalide.");
  }

  const data = JSON.parse(text);
  if (
    !isRecord(data) ||
    !isRecord(data.profiles) ||
    !isRecord(data.settings) ||
    (data.schemaVersion !== undefined && (!Number.isInteger(data.schemaVersion) || data.schemaVersion < 1))
  ) {
    throw Error("Fichier de sauvegarde non reconnu.");
  }
  if (data.schemaVersion > SCHEMA_VERSION) {
    throw Error("Cette sauvegarde provient d’une version plus récente de l’application.");
  }
  for (const child of CHILDREN) {
    if (data.profiles[child] !== undefined && !isRecord(data.profiles[child])) {
      throw Error("Profil enfant invalide dans la sauvegarde.");
    }
  }

  // Le PIN ne vient jamais du fichier importé : on conserve celui de cet appareil.
  const previous = state;
  const importable = {
    ...data,
    settings: { ...data.settings, parentPin: previous.settings.parentPin }
  };
  state = migrate(importable, previous.settings.parentPin);
  try {
    persist();
  } catch (error) {
    state = previous;
    throw error;
  }
  return getState();
}

export function resetData() {
  const previous = state;
  state = initial();
  try {
    persist();
  } catch (error) {
    state = previous;
    throw error;
  }
}
