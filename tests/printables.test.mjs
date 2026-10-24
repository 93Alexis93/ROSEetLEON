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


test("Impression · les corrigés correspondent aux exercices proposés", () => {
  for (const fragment of [
    "4 sachets", "3 billes", "4 × 3 = 12 billes",
    "5 cartes", "4 de plus", "5 + 4 = 9 cartes",
    "3 équipes de 4 enfants", "3 × 4 = 12 enfants"
  ]) assert.ok(printables.includes(fragment), "Énoncé ou corrigé absent : " + fragment);
  for (const fragment of [
    "CAT", "chat", "SUN", "soleil", "BOOK", "livre",
    "DOG", "chien", "BALL", "ballon"
  ]) assert.ok(printables.includes(fragment), "Association anglais/français absente : " + fragment);
});

test("Impression · la fiche émotions ne transforme pas les ressentis en réponses à noter", () => {
  assert.match(printables, /Plusieurs réponses sont possibles/);
  assert.match(printables, /Tu peux aussi ne pas savoir, ou ressentir autre chose/);
  assert.match(printables, /respecter son choix de ne pas répondre/);
});

test("Impression · chaque fiche proposée est reliée à un contenu imprimable et à un repère adulte", () => {
  for (const id of ["rose-letters", "rose-shapes", "rose-paths", "rose-emotions", "leon-multiplication", "leon-problems", "leon-english", "leon-logic"]) {
    assert.ok(printables.includes('id:"' + id + '"'), "Identifiant de fiche manquant : " + id);
    assert.ok(printables.includes('answerKey(id)'), "Le parcours doit préparer un repère de correction.");
  }
  assert.match(printables, /function showWorksheet\(id\)/);
  assert.match(printables, /const wrapper=el\("div",\{class:"print-workspace"\}\)/);
});
