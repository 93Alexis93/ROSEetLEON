import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const ui=readFileSync(new URL("../src/ui.js",import.meta.url),"utf8");
const voice=readFileSync(new URL("../src/voice.js",import.meta.url),"utf8");
const sources=[
 readFileSync(new URL("../src/child/activities.js",import.meta.url),"utf8"),
 readFileSync(new URL("../src/child/reading.js",import.meta.url),"utf8"),
 readFileSync(new URL("../src/child/learning-lab.js",import.meta.url),"utf8"),
 readFileSync(new URL("../src/child/calcul.js",import.meta.url),"utf8"),
 readFileSync(new URL("../src/child/rose-activities.js",import.meta.url),"utf8"),
 readFileSync(new URL("../src/child/sentence-builder.js",import.meta.url),"utf8")
];
test("Navigation · chaque jeu expose un bouton suivant visible sans défilement",()=>{
 const all=sources.join("\n");
 assert.doesNotMatch(all,/feedback\?\.after\((?:next|reveal)\)/);
 assert.doesNotMatch(all,/feedback\?\.parentElement\?\.append\(/);
 assert.ok((all.match(/showGameNext\(next, feedback\)/g)||[]).length>=13,"Les parcours existants doivent conserver leur dock global de progression.");
 for (const [index,source] of sources.entries()) if(index!==4) assert.match(source,/showGameNext\(next, feedback\)/,"Chaque module, hors jeu de Rose désormais corrigé en insertion locale, doit utiliser le dock global.");
 assert.match(sources[4],/cardEl\.insertBefore\(next,controls\)/,"Les jeux de Rose affichent la progression dans la carte qui a posé la question.");
 assert.match(sources[4],/\(\)=>answer\(choice,c,answers,f\)/,"Les boutons transmettent directement les éléments de la question à leur gestionnaire.");
 assert.match(ui,/export function showGameNext\(next\)[\s\S]*document\.body\.append\(next\)/);
 assert.match(ui,/export function replaceApp\(node\)\{\s*document\.querySelectorAll\("body > \.game-next"\)\.forEach\(item=>item\.remove\(\)\)/);
 const css=readFileSync(new URL("../assets/css/base.css",import.meta.url),"utf8");
 assert.match(css, /\.game-next\{[^}]*position:fixed!important/);
 assert.match(css, /\.game-next\{[^}]*bottom:calc\(12px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css, /\.game-next\{[^}]*width:min\(620px,calc\(100vw - 28px\)\)/);
});
test("Voix · chaque action et chaque changement d’écran arrêtent la parole précédente",()=>{
 assert.match(ui,/import \{ speak, stopSpeaking \} from "\.\/voice\.js"/);
 assert.match(ui,/onclick:\(event\)=>\{try\{stopSpeaking\(\);\}catch\{\}fn\?\.\(event\);\}/);
 assert.match(ui,/try\{stopSpeaking\(\);\}catch\{\}\s*app\.replaceChildren\(node\)/);
 assert.match(voice,/export function stopSpeaking\(\)\{try\{if\(typeof window!=="undefined"&&"speechSynthesis"in window\)window\.speechSynthesis\.cancel\(\);\}catch\{return false;\}return true;\}/);
});
