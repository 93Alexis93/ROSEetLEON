import test from "node:test";
import assert from "node:assert/strict";
import { createReadingQuestion, READING_SYLLABLES } from "../src/child/reading.js";

const modes = ["flash", "mystery", "sentence", "text"];

test("les quatre formats de lecture sont générés", () => {
  for (const mode of modes) {
    const question = createReadingQuestion(mode);
    assert.equal(question.mode, mode);
    assert.ok(question.prompt.length > 0);
    assert.ok(question.hint.length > 0);
    assert.ok(question.explanation.length > 0);
    assert.ok(question.choices.includes(question.answer));
  }
});

test("chaque format propose quatre réponses distinctes avec la bonne réponse", () => {
  for (const mode of modes) {
    for (let i = 0; i < 200; i++) {
      const question = createReadingQuestion(mode);
      assert.equal(question.choices.length, 4, mode);
      assert.equal(new Set(question.choices).size, 4, mode);
      assert.ok(question.choices.includes(question.answer), mode);
    }
  }
});

test("le format inconnu est signalé explicitement", () => {
  assert.throws(() => createReadingQuestion("inconnu"), /Format de lecture inconnu/);
});

test("les banques de phrases et de mini-textes proposent des situations variées", () => {
  for (const mode of ["sentence", "text"]) {
    const prompts = new Set();
    for (let i = 0; i < 100; i++) prompts.add(createReadingQuestion(mode).prompt);
    assert.ok(prompts.size >= 6, mode + " doit proposer plusieurs contenus distincts");
  }
});

test("les mots-éclairs et mots-mystères couvrent un vocabulaire élargi", () => {
  for (const mode of ["flash", "mystery"]) {
    const answers = new Set();
    for (let i = 0; i < 250; i++) answers.add(createReadingQuestion(mode).answer);
    assert.ok(answers.size >= 12, mode + " doit proposer plusieurs mots distincts");
  }
});

test("les mots-mystères respectent le découpage oral des mots courants", () => {
  const expected = {
    chat: 1, livre: 1, rose: 1, pomme: 1, poire: 1, poule: 1, nuage: 1,
    lapin: 2, maison: 2, école: 2, maîtresse: 2, cartable: 2, étoile: 2,
    montagne: 2, musique: 2, girafe: 2, valise: 2,
    tomate: 3, banane: 3, papillon: 3, chocolat: 3
  };
  for (const [word, count] of Object.entries(expected)) {
    assert.ok(READING_SYLLABLES[word], word + " doit avoir un découpage");
    assert.equal(READING_SYLLABLES[word].split("-").length, count, word);
  }
});
