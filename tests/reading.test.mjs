import test from "node:test";
import assert from "node:assert/strict";
import { createReadingQuestion, READING_SYLLABLES, shuffleReadingItems } from "../src/child/reading.js";

const modes = ["flash", "mystery", "sentence", "text", "rhyme", "syllables"];

test("les six formats de lecture sont générés", () => {
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
    assert.ok(prompts.size >= 20, mode + " doit proposer au moins vingt contenus distincts");
  }
});

test("les mots-éclairs et mots-mystères couvrent un vocabulaire élargi", () => {
  for (const mode of ["flash", "mystery"]) {
    const answers = new Set();
    for (let i = 0; i < 250; i++) answers.add(createReadingQuestion(mode).answer);
    assert.ok(answers.size >= 20, mode + " doit proposer au moins vingt mots distincts");
  }
});

test("les mots-mystères respectent le découpage oral des mots courants", () => {
  const expected = {
    chat: 1, livre: 1, rose: 1, lune: 1, pomme: 1, poire: 1, poule: 1, nuage: 2,
    lapin: 2, maison: 2, école: 2, maîtresse: 2, cartable: 2, étoile: 2,
    montagne: 2, musique: 2, girafe: 2, valise: 2,
    tomate: 3, banane: 3, papillon: 3, chocolat: 3
  };
  for (const [word, count] of Object.entries(expected)) {
    assert.ok(READING_SYLLABLES[word], word + " doit avoir un découpage");
    assert.equal(READING_SYLLABLES[word].split("-").length, count, word);
  }
});

test("tous les mots découpés ont un nombre de syllabes cohérent avec leur prononciation usuelle", () => {
  const expected = {
    lapin: 2, maison: 2, ballon: 2, soleil: 2, bateau: 2, papa: 2, maman: 2,
    vélo: 2, école: 2, chat: 1, livre: 1, rose: 1, léon: 2, fusée: 2,
    forêt: 2, gâteau: 2, ami: 2, lune: 1, moto: 2, tomate: 3, banane: 3,
    papillon: 3, chocolat: 3, pirate: 2, robot: 2, cadeau: 2, pomme: 1,
    poire: 1, poule: 1, canard: 2, jardin: 2, fleur: 1, maîtresse: 2,
    cartable: 2, crayon: 2, étoile: 2, nuage: 2, montagne: 2, musique: 2,
    maillot: 2, tortue: 2, girafe: 2, poussin: 2, savon: 2, valise: 2,
    renard: 2, mouton: 2, orange: 2, fromage: 2, cabane: 2, bonnet: 2,
    camion: 2, domino: 3, éléphant: 3, crocodile: 3, dinosaure: 3,
    ananas: 3, rivière: 2, fenêtre: 2, chaussette: 2, chapeau: 2,
    canapé: 3, fourmi: 2, hibou: 2, lapinou: 3
  };
  assert.deepEqual(Object.keys(READING_SYLLABLES).sort(), Object.keys(expected).sort());
  for (const [word, count] of Object.entries(expected)) {
    assert.equal(READING_SYLLABLES[word].split("-").length, count, word);
  }
});

test("Lecture · le mélange conserve chaque choix et utilise un tirage borné", () => {
  const input = ["a", "b", "c", "d"];
  const draws = [0, 0, 0];
  const shuffled = shuffleReadingItems(input, () => draws.shift());
  assert.deepEqual(shuffled, ["b", "c", "d", "a"]);
  assert.deepEqual(input, ["a", "b", "c", "d"]);
  assert.equal(new Set(shuffled).size, input.length);
});

test("les nouveaux jeux de sons proposent des réponses cohérentes", () => {
  for (let i = 0; i < 300; i++) {
    const rhyme = createReadingQuestion("rhyme");
    assert.match(rhyme.prompt, /Quel mot rime avec/);
    assert.equal(rhyme.choices.length, 4);
    assert.equal(new Set(rhyme.choices).size, 4);
    assert.ok(rhyme.choices.includes(rhyme.answer));
    assert.ok(rhyme.explanation.includes(rhyme.answer));

    const syllables = createReadingQuestion("syllables");
    const match = syllables.prompt.match(/« ([^»]+) »/);
    assert.ok(match, syllables.prompt);
    assert.equal(Number(syllables.answer), READING_SYLLABLES[match[1]].split("-").length);
    assert.equal(syllables.choices.length, 4);
    assert.equal(new Set(syllables.choices).size, 4);
    assert.ok(syllables.choices.includes(syllables.answer));
  }
});
