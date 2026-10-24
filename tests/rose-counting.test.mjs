import test from "node:test";
import assert from "node:assert/strict";
import { createCountingQuestion } from "../src/child/activities.js";

test("le comptage de Rose respecte le plafond choisi et propose trois choix distincts", () => {
  for (const maxCount of [5, 8, 10]) {
    for (let i = 0; i < 500; i++) {
      const question = createCountingQuestion(Math.random, maxCount);
      assert.ok(question.count >= 1 && question.count <= maxCount);
      assert.equal(question.answer, question.count);
      assert.equal(question.choices.length, 3);
      assert.equal(new Set(question.choices).size, 3);
      assert.ok(question.choices.includes(question.answer));
      assert.ok(question.choices.every(choice => choice >= 1 && choice <= maxCount));
      assert.ok(question.symbol);
      assert.match(question.text, /^Combien de .+ \?$/);
    }
  }
});

test("les choix par défaut restent adaptés au démarrage du jeu", () => {
  for (let i = 0; i < 100; i++) {
    const question = createCountingQuestion();
    assert.ok(question.count >= 1 && question.count <= 8);
  }
});
