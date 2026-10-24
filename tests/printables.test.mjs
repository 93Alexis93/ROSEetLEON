import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const printables = readFileSync(resolve(root, "src/parent/printables.js"), "utf8");
const styles = readFileSync(resolve(root, "assets/css/print.css"), "utf8");
const worker = readFileSync(resolve(root, "service-worker.js"), "utf8");

test("Impression · les huit fiches proposées disposent d’un corrigé ou d’un repère adulte", () => {
  for (const id of ["rose-letters", "rose-shapes", "rose-paths", "rose-emotions", "leon-multiplication", "leon-problems", "leon-english", "leon-logic"]) {
    assert.ok(printables.includes('id:"' + id + '"'), "Fiche absente : " + id);
    assert.ok(printables.includes('answerKey(id)'), "Le parcours de préparation doit fournir un repère de correction.");
  }
  assert.match(printables, /Il n’y a pas un seul ressenti attendu|Il n’y a pas une seule bonne réponse/);
});

test("Impression · les commandes distinguent la fiche seule et la fiche avec corrigé", () => {
  assert.match(printables, /Imprimer la fiche seule/);
  assert.match(printables, /Fiche \+ corrigé/);
  assert.match(printables, /printPages\(false\)/);
  assert.match(printables, /printPages\(true\)/);
  assert.match(styles, /body\.print-view\.print-worksheet-only \.answer-key\{display:none!important\}/);
});

test("Impression · le format A4, les sauts de page et le retour après impression sont prévus", () => {
  assert.match(styles, /@page\{size:A4/);
  assert.match(styles, /break-after:page/);
  assert.match(printables, /window\.onafterprint=\(\)=>document\.body\.classList\.remove\("print-worksheet-only"\)/);
});

test("Impression · les ressources de fiche restent disponibles hors ligne", () => {
  assert.ok(worker.includes("./src/parent/printables.js"));
  assert.ok(worker.includes("./assets/css/print.css"));
});
