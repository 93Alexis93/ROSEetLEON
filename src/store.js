import { updateMathProgress } from "./child/math-engine.js";

const KEY = "rose-leon-data";
export const SCHEMA_VERSION = 2;

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

function migrate(data) {
  if (!data || typeof data !== "object") return initial();

  const base = initial();
  const oldProfiles = data.profiles || {};
  const profiles = {};

  for (const child of ["leon", "rose"]) {
    const old = oldProfiles[child] || {};
    profiles[child] = {
      ...base.profiles[child],
      ...old,
      mathProgress: { ...(old.mathProgress || {}) }
    };
  }

  return {
    ...base,
    ...data,
    schemaVersion: SCHEMA_VERSION,
    profiles,
    settings: { ...base.settings, ...(data.settings || {}) },
    history: Array.isArray(data.history) ? data.history : [],
    crisisLog: Array.isArray(data.crisisLog) ? data.crisisLog : [],
    customWords: Array.isArray(data.customWords) ? data.customWords : []
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
  return JSON.stringify(
    { ...getState(), exportedAt: new Date().toISOString() },
    null,
    2
  );
}

export function importData(text) {
  const data = JSON.parse(text);
  if (
    !data ||
    typeof data !== "object" ||
    !data.profiles ||
    typeof data.profiles !== "object" ||
    Array.isArray(data.profiles) ||
    !data.settings ||
    typeof data.settings !== "object" ||
    Array.isArray(data.settings)
  ) {
    throw Error("Fichier de sauvegarde non reconnu.");
  }

  const previous = state;
  state = migrate(data);
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
