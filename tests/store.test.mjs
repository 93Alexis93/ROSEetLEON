import test from "node:test";
import assert from "node:assert/strict";

const values = new Map();
let failWrites = false;

globalThis.localStorage = {
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    if (failWrites) throw new Error("quota simulé");
    values.set(key, String(value));
  },
  removeItem(key) {
    values.delete(key);
  }
};

const store = await import("../src/store.js?store-tests");

test("Sauvegarde · export puis import restaure les mots personnalisés et réglages", () => {
  store.resetData();
  store.update(state => {
    state.customWords.push({ word: "papillon", createdAt: "2026-10-23T12:00:00.000Z" });
    state.settings.voice = false;
    state.profiles.leon.sessions = 3;
  });
  const backup = store.exportData();
  store.resetData();
  store.importData(backup);
  const restored = store.getState();
  assert.equal(restored.customWords[0].word, "papillon");
  assert.equal(restored.settings.voice, false);
  assert.equal(restored.profiles.leon.sessions, 3);
});

test("Sauvegarde · un fichier non reconnu est refusé sans écraser les données", () => {
  store.resetData();
  store.update(state => {
    state.profiles.rose.sessions = 2;
  });
  assert.throws(() => store.importData('{"settings":{}}'), /Fichier de sauvegarde non reconnu/);
  assert.equal(store.getState().profiles.rose.sessions, 2);
});

test("Sauvegarde · un JSON invalide est refusé sans écraser les données", () => {
  store.resetData();
  store.update(state => {
    state.profiles.leon.sessions = 1;
  });
  assert.throws(() => store.importData("{pas du json"), SyntaxError);
  assert.equal(store.getState().profiles.leon.sessions, 1);
});

test("Sauvegarde · un échec du stockage pendant l’import conserve l’état précédent", () => {
  failWrites = false;
  store.resetData();
  store.update(state => {
    state.profiles.leon.sessions = 4;
  });
  const backup = JSON.parse(store.exportData());
  backup.profiles.leon.sessions = 9;
  failWrites = true;
  assert.throws(() => store.importData(JSON.stringify(backup)), /Stockage indisponible/);
  assert.equal(store.getState().profiles.leon.sessions, 4);
  failWrites = false;
});

test("Sauvegarde · une modification refusée par le stockage ne change pas l’état en mémoire", () => {
  failWrites = false;
  store.resetData();
  store.update(state => {
    state.profiles.leon.sessions = 5;
  });
  failWrites = true;
  assert.throws(() => store.update(state => {
    state.profiles.leon.sessions = 8;
  }), /Stockage indisponible/);
  assert.equal(store.getState().profiles.leon.sessions, 5);
  failWrites = false;
});

test("Sauvegarde · une remise à zéro refusée par le stockage conserve les données", () => {
  failWrites = false;
  store.resetData();
  store.update(state => {
    state.profiles.rose.sessions = 6;
  });
  failWrites = true;
  assert.throws(() => store.resetData(), /Stockage indisponible/);
  assert.equal(store.getState().profiles.rose.sessions, 6);
  failWrites = false;
});


test("Sauvegarde · la migration du schéma 2 conserve les données compatibles", () => {
  store.resetData();
  const legacy = {
    schemaVersion: 2,
    profiles: {
      leon: { sessions: 4, correct: 6, attempts: 8, stickers: 2, mathProgress: { mental: { difficulty: 2, correctStreak: 3, errorStreak: 0, attempts: 8, correct: 6 } } },
      rose: { sessions: 1, correct: 2, attempts: 3, stickers: 0 }
    },
    settings: { voice: false, sounds: true, parentPin: "1234" },
    customWords: ["papillon"]
  };
  store.importData(JSON.stringify(legacy));
  const restored = store.getState();
  assert.equal(restored.schemaVersion, 3);
  assert.equal(restored.profiles.leon.sessions, 4);
  assert.equal(restored.profiles.leon.mathProgress.mental.difficulty, 2);
  assert.equal(restored.profiles.leon.mathProgress.mental.correctStreak, 0);
  assert.equal(restored.settings.voice, false);
  assert.deepEqual(restored.customWords.map(item => item.word), ["papillon"]);
});

test("Sauvegarde · l’export omet le PIN et l’import conserve le PIN local", () => {
  store.resetData();
  store.update(state => {
    state.settings.parentPin = "4826";
    state.profiles.leon.sessions = 2;
  });
  const backup = store.exportData();
  assert.equal(JSON.parse(backup).settings.parentPin, undefined);
  store.update(state => {
    state.settings.parentPin = "7351";
  });
  store.importData(backup);
  assert.equal(store.getState().settings.parentPin, "7351");
  assert.equal(store.getState().profiles.leon.sessions, 2);
});

test("Sauvegarde · les valeurs malformées sont assainies sans garder de champs inconnus", () => {
  store.resetData();
  const backup = {
    schemaVersion: 2,
    profiles: {
      leon: {
        sessions: -9,
        correct: 100,
        attempts: 3,
        stickers: 999,
        mathProgress: {
          mental: { difficulty: 99, correctStreak: 8, errorStreak: 0, attempts: -1, correct: 7, extra: "ignored" },
          unknownDomain: { difficulty: 3 }
        },
        extra: "ignored"
      },
      rose: {}
    },
    settings: { voice: "oui", sounds: false, leonMinutes: 1000, roseMinutes: 0, extra: "ignored" },
    customWords: [
      { word: "papillon" },
      { word: "PAPILLON" },
      { word: "pas de mot" },
      { word: "x" },
      { word: "étoile", createdAt: "not-a-date" }
    ]
  };
  store.importData(JSON.stringify(backup));
  const restored = store.getState();
  assert.equal(restored.profiles.leon.sessions, 0);
  assert.equal(restored.profiles.leon.mathProgress.mental.difficulty, 3);
  assert.equal(restored.profiles.leon.mathProgress.mental.correctStreak, 0);
  assert.equal(restored.profiles.leon.mathProgress.mental.attempts, 0);
  assert.equal(restored.profiles.leon.mathProgress.mental.correct, 0);
  assert.equal(restored.profiles.leon.extra, undefined);
  assert.equal(restored.profiles.leon.mathProgress.unknownDomain, undefined);
  assert.equal(restored.settings.voice, true);
  assert.equal(restored.settings.leonMinutes, 60);
  assert.equal(restored.settings.roseMinutes, 1);
  assert.deepEqual(restored.customWords.map(item => item.word), ["papillon", "étoile"]);
});

test("Sauvegarde · un schéma futur est refusé sans modifier les données", () => {
  store.resetData();
  store.update(state => {
    state.profiles.rose.sessions = 9;
  });
  assert.throws(
    () => store.importData(JSON.stringify({ schemaVersion: 99, profiles: {}, settings: {} })),
    /version plus récente/
  );
  assert.equal(store.getState().profiles.rose.sessions, 9);
});

test("Sauvegarde · un profil enfant malformé est refusé sans modifier les données", () => {
  store.resetData();
  store.update(state => {
    state.profiles.rose.sessions = 5;
  });
  assert.throws(
    () => store.importData(JSON.stringify({ schemaVersion: 2, profiles: { leon: [] }, settings: {} })),
    /Profil enfant invalide/
  );
  assert.equal(store.getState().profiles.rose.sessions, 5);
});

test("Sauvegarde · un fichier trop volumineux est refusé sans modifier les données", () => {
  store.resetData();
  store.update(state => {
    state.profiles.leon.sessions = 3;
  });
  assert.throws(() => store.importData(" ".repeat(2 * 1024 * 1024 + 1)), /trop volumineux/);
  assert.equal(store.getState().profiles.leon.sessions, 3);
});

test("Sauvegarde · les tableaux ne sont pas acceptés comme profils ou réglages", () => {
  failWrites = false;
  store.resetData();
  store.update(state => {
    state.profiles.rose.sessions = 7;
  });
  assert.throws(() => store.importData(JSON.stringify({ profiles: [], settings: {} })), /Fichier de sauvegarde non reconnu/);
  assert.throws(() => store.importData(JSON.stringify({ profiles: {}, settings: [] })), /Fichier de sauvegarde non reconnu/);
  assert.equal(store.getState().profiles.rose.sessions, 7);
});

test("Stockage · un abonné défaillant ne fait pas diverger mémoire et sauvegarde", () => {
  failWrites = false;
  store.resetData();
  const unsubscribe = store.subscribe(() => {
    throw new Error("abonné défaillant");
  });
  assert.doesNotThrow(() => store.update(state => {
    state.profiles.leon.sessions = 11;
  }));
  unsubscribe();
  assert.equal(store.getState().profiles.leon.sessions, 11);
  assert.equal(JSON.parse(values.get("rose-leon-data")).profiles.leon.sessions, 11);
});

test("Stockage · un abonné ne peut pas modifier la copie reçue par les autres", () => {
  failWrites = false;
  store.resetData();
  const unsubscribeMutator = store.subscribe(snapshot => {
    snapshot.profiles.leon.sessions = 999;
  });
  let secondSnapshot;
  const unsubscribeObserver = store.subscribe(snapshot => {
    secondSnapshot = snapshot;
  });
  store.update(state => {
    state.profiles.leon.sessions = 12;
  });
  unsubscribeMutator();
  unsubscribeObserver();
  assert.equal(secondSnapshot.profiles.leon.sessions, 12);
  assert.equal(store.getState().profiles.leon.sessions, 12);
});
