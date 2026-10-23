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
