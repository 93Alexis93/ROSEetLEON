import test from "node:test";
import assert from "node:assert/strict";
import { createCountingQuestion } from "../src/child/activities.js";

test("le comptage de Rose reste entre 1 et 8 avec trois choix distincts", () => {
  for (let i = 0; i < 500; i++) {
    const question = createCountingQuestion();
    assert.ok(question.count >= 1 && question.count <= 8);
    assert.equal(question.answer, question.count);
    assert.equal(question.choices.length, 3);
    assert.equal(new Set(question.choices).size, 3);
    assert.ok(question.choices.includes(question.answer));
    assert.ok(question.symbol);
    assert.match(question.text, /^Combien de .+ \?$/);
  }
});
