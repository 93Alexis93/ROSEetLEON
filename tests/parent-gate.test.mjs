import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const parent=readFileSync(resolve(root,"src/parent/parent.js"),"utf8");

test("Espace parent · le délai ne doit rafraîchir que l’écran de porte encore affiché",()=>{
  assert.match(parent,/const\\s+gateScreen\\s*=\\s*document\\.querySelector\\("#app"\)\\s*\\?\\.\\s*firstElementChild/);
  assert.match(parent,/document\\.querySelector\\("#app"\)\\s*\\?\\.\\s*firstElementChild\\s*===\\s*gateScreen\\)\\s*\\{\\s*parentGate\\(\)/);
});

test("Espace parent · le résultat peut être validé au clavier avec Entrée",()=>{
  assert.match(parent,/input\\.addEventListener\\("keydown",\\s*event\\s*=>\\s*\\{\\s*if\\s*\\(event\\.key\\s*===\\s*"Enter"\\)\\s*verify\\(\);\\s*\\}\)/);
});
