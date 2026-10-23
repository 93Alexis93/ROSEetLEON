import test from "node:test";
import assert from "node:assert/strict";
import { createCalculationQuestion, CALCULATION_MODES } from "../src/child/calcul-engine.js";

test("Calcul mental · chaque mode génère une réponse entière cohérente", () => {
  for (const mode of CALCULATION_MODES) {
    for (let i = 0; i < 200; i++) {
      const q = createCalculationQuestion(mode.id);
      assert.equal(q.kind, mode.id);
      assert.ok(q.prompt.length > 0);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0);
      assert.ok(q.hint.length > 0 && q.explanation.length > 0);
      if (mode.id === "complements10") assert.ok(q.answer <= 10);
      if (mode.id === "complements100") assert.ok(q.answer <= 100);
    }
  }
});

test("Calcul mental · les types inconnus sont refusés", () => {
  assert.throws(() => createCalculationQuestion("unknown"), /Type de question inconnu/);
});
