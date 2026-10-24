import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const ui=readFileSync(new URL("../src/ui.js",import.meta.url),"utf8");
const voice=readFileSync(new URL("../src/voice.js",import.meta.url),"utf8");
const sources=[
 readFileSync(new URL("../src/child/activities.js",import.meta.url),"utf8"),
 readFileSync(new URL("../src/child/reading.js",import.meta.url),"utf8"),
 readFileSync(new URL("../src/child/learning-lab.js",import.meta.url),"utf8")
];
test("Navigation · les boutons de progression sont ajoutés au conteneur du jeu",()=>{
 const all=sources.join("\n");
 assert.doesNotMatch(all,/feedback\?\.after\((?:next|button\(round===total-1\?)/);
 assert.ok((all.match(/feedback\?\.parentElement\?\.append\((?:next|button\(round===total-1\?)/g)||[]).length>=8);
});
test("Voix · chaque action et chaque changement d’écran arrêtent la parole précédente",()=>{
 assert.match(ui,/import \{ speak, stopSpeaking \} from "\.\/voice\.js"/);
 assert.match(ui,/onclick:\(event\)=>\{stopSpeaking\(\);fn\?\.\(event\);\}/);
 assert.match(ui,/stopSpeaking\(\);\s*app\.replaceChildren\(node\)/);
 assert.match(voice,/export function stopSpeaking\(\)\{if\(typeof window!=="undefined"&&"speechSynthesis"in window\)window\.speechSynthesis\.cancel\(\);\}/);
});
