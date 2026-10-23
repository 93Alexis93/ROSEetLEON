import test from "node:test";
import assert from "node:assert/strict";
import { PAUSE_STEPS, getPauseStep } from "../src/child/pause.js";

test("Pause douce · trois étapes sont disponibles", () => {
  assert.equal(PAUSE_STEPS.length, 3);
  assert.deepEqual(PAUSE_STEPS.map(step => step.title), [
    "Se poser",
    "Respirer tranquillement",
    "Regarder autour de soi"
  ]);
});

test("Pause douce · chaque étape possède un texte et une lecture vocale", () => {
  for (const step of PAUSE_STEPS) {
    assert.ok(step.text.length > 20);
    assert.ok(step.spoken.length > 10);
  }
});

test("Pause douce · l’index est borné et une valeur invalide revient à la première étape", () => {
  assert.equal(getPauseStep(-1), PAUSE_STEPS[0]);
  assert.equal(getPauseStep(1), PAUSE_STEPS[1]);
  assert.equal(getPauseStep(99), PAUSE_STEPS[2]);
  assert.equal(getPauseStep(1.5), PAUSE_STEPS[0]);
});
