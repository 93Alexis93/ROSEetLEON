import test from "node:test";
import assert from "node:assert/strict";
import { createReadingQuestion } from "../src/child/reading.js";

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
