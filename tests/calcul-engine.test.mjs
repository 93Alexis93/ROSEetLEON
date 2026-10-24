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


test("Calcul mental · les réponses correspondent réellement aux opérations affichées", () => {
  for (let i = 0; i < 500; i++) {
    const ten = createCalculationQuestion("complements10");
    const tenStart = Number(ten.prompt.match(/ajouter à (\d+)/)?.[1]);
    assert.equal(tenStart + ten.answer, 10, ten.prompt);

    const hundred = createCalculationQuestion("complements100");
    const hundredStart = Number(hundred.prompt.match(/ajouter à (\d+)/)?.[1]);
    assert.equal(hundredStart + hundred.answer, 100, hundred.prompt);

    const double = createCalculationQuestion("doubles");
    const doubleStart = Number(double.prompt.match(/double de (\d+)/)?.[1]);
    assert.equal(double.answer, doubleStart * 2, double.prompt);

    const half = createCalculationQuestion("halves");
    const halfStart = Number(half.prompt.match(/moitié de (\d+)/)?.[1]);
    assert.equal(half.answer * 2, halfStart, half.prompt);

    const line = createCalculationQuestion("numberLine");
    const bounds = [...line.prompt.matchAll(/\d+/g)].map(m => Number(m[0]));
    assert.equal(bounds.length, 2);
    assert.equal(line.answer, (bounds[0] + bounds[1]) / 2, line.prompt);

    const problem = createCalculationQuestion("problems");
    if (problem.prompt.includes("cartes et Sami")) {
      const nums = [...problem.prompt.matchAll(/\d+/g)].map(m => Number(m[0]));
      assert.equal(problem.answer, Math.abs(nums[0] - nums[1]), problem.prompt);
    } else if (problem.prompt.includes("jetons")) {
      const nums = [...problem.prompt.matchAll(/\d+/g)].map(m => Number(m[0]));
      assert.equal(problem.answer, nums[0] - nums[1], problem.prompt);
    } else {
      const nums = [...problem.prompt.matchAll(/\d+/g)].map(m => Number(m[0]));
      assert.equal(nums.length, 2);
      assert.equal(problem.answer, nums[0] * nums[1], problem.prompt);
    }
  }
});
