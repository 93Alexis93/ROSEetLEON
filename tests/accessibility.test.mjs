import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const base=readFileSync(resolve(root,"assets/css/base.css"),"utf8");
const roseTheme=readFileSync(resolve(root,"assets/css/theme-rose.css"),"utf8");
const rose=readFileSync(resolve(root,"src/child/rose-activities.js"),"utf8");

test("Accessibilité · les commandes gardent une cible tactile généreuse",()=>{
  assert.match(base,/--tap:\s*64px/);
  assert.match(roseTheme,/body\.theme-rose button\{min-height:72px\}/);
});

test("Accessibilité · le focus clavier est visible",()=>{
  assert.match(base,/button:focus-visible,input:focus-visible,select:focus-visible\{outline:4px solid/);
});

test("Accessibilité · les animations respectent la préférence de mouvement réduit",()=>{
  assert.match(base,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(base,/transition-duration:\.01ms!important/);
});

test("Accessibilité · la progression du jeu de Rose est annoncée aux lecteurs d’écran",()=>{
  assert.match(rose,/role:"progressbar"/);
  assert.match(rose,/"aria-valuemin":"0","aria-valuemax":"5","aria-valuenow":String\(round\)/);
  assert.match(rose,/role:"status","aria-live":"polite"/);
});

const pause = readFileSync(resolve(root, "src/child/pause.js"), "utf8");

test("Accessibilité · chaque étape de la pause est annoncée aux lecteurs d’écran", () => {
  assert.match(pause, /role: "status"/);
  assert.match(pause, /"aria-live": "polite"/);
  assert.match(pause, /Étape /);
  assert.match(pause, /Tu peux arrêter cette pause quand tu veux/);
});

const main = readFileSync(resolve(root, "src/main.js"), "utf8");

test("Accessibilité · la progression de chaque enfant expose une jauge compréhensible", () => {
  assert.match(main, /class: "progress-track", role: "progressbar"/);
  assert.match(main, /"aria-label": "Réponses réussies"/);
  assert.match(main, /"aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String\(successRate\), "aria-valuetext": successRate \+ " % de réponses réussies"/);
  assert.match(main, /profile\.sessions === 1 \? " partie terminée\." : " parties terminées\."/);
  assert.match(main, /profile\.correct/);
  assert.match(main, /profile\.attempts/);
  assert.match(main, /profile\.sessions/);
  assert.match(main, /Ton aventure commence ici : chaque essai fera grandir ton parcours !/);
});


test("Accessibilité · les questions des défis annoncent les retours et leur progression", () => {
 const lab = readFileSync(resolve(root, "src/child/learning-lab.js"), "utf8");
 assert.match(lab, /role:"progressbar"/);
 assert.match(lab, /"aria-valuemin":"0","aria-valuemax":String\(total\),"aria-valuenow":String\(round\)/);
 assert.match(lab, /role:"status","aria-live":"polite"/);
 assert.match(lab, /buttons\.forEach\(b=>b\.disabled=true\)/);
 assert.match(lab, /round===total-1\?"Terminer":"Continuer"/);
});

test("Accessibilité · la recherche d’activités possède un libellé et annonce ses résultats", () => {
 const main = readFileSync(resolve(root, "src/main.js"), "utf8");
 assert.match(main, /class:"exercise-search", "aria-label":"Rechercher un exercice"/);
 assert.match(main, /placeholder:"Rechercher un exercice…","aria-label":"Rechercher un exercice"/);
 assert.match(main, /class:"exercise-search-results","aria-live":"polite"/);
 assert.match(main, /Aucun jeu trouvé\. Essaie un autre mot\./);
});
