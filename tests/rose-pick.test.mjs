import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source = readFileSync(new URL("../src/child/rose-activities.js", import.meta.url), "utf8");
const declaration = source.match(/const pick=(\(a,r(?:=Math\.random)?\)=>a\[Math\.floor\(r\(\)\*a\.length\)\]);/);

test("Rose · pick accepte un seul argument dans les messages de réponse", () => {
  assert.ok(declaration, "La fonction pick doit conserver son implémentation identifiable.");
  const pick = new Function("return " + declaration[1])();
  assert.doesNotThrow(() => pick(["rouge"]), "Un choix dans une liste ne doit pas exiger un générateur aléatoire explicite.");
  assert.equal(pick(["rouge"]), "rouge");
});

test("Rose · pick conserve la possibilité de fournir un générateur déterministe", () => {
  assert.ok(declaration, "La fonction pick doit conserver son implémentation identifiable.");
  const pick = new Function("return " + declaration[1])();
  assert.equal(pick(["rouge", "bleu"], () => 0), "rouge");
});
