import test from "node:test";
import assert from "node:assert/strict";
import {createNumberMysteryQuestion,createCompareQuestion,createSyllableQuestion,SYLLABLE_WORDS} from "../src/child/learning-lab.js";
import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");

test("Nombre mystère · les questions ont quatre choix distincts et une réponse présente",()=>{
 for(let i=0;i<600;i++){
  const q=createNumberMysteryQuestion();
  assert.ok(q.prompt.length>0);
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=999);
  assert.equal(q.choices.length,4);
  assert.equal(new Set(q.choices).size,4);
  assert.ok(q.choices.every(n=>Number.isInteger(n)&&n>=0&&n<=999));
  assert.ok(q.choices.includes(q.answer));
  assert.ok(q.hint.length>0&&q.explanation.length>0);
 }
});

test("Nombre mystère · la réponse correspond exactement à l’indice",()=>{
 for(let i=0;i<1200;i++){
  const q=createNumberMysteryQuestion();
  const decomposition=q.prompt.match(/^Je suis (\\d+) centaines?, (\\d+) dizaines? et (\\d+) unités?\\. Qui suis-je \\?$/);
  const next=q.prompt.match(/^Quel nombre vient juste après (\\d+) \\?$/);
  const previous=q.prompt.match(/^Quel nombre vient juste avant (\\d+) \\?$/);
  const jump=q.prompt.match(/^Quel nombre vient (\\d+) (après|avant) (\\d+) \\?$/);
  if(decomposition) assert.equal(q.answer,Number(decomposition[1])*100+Number(decomposition[2])*10+Number(decomposition[3]),q.prompt);
  else if(next) assert.equal(q.answer,Number(next[1])+1,q.prompt);
  else if(previous) assert.equal(q.answer,Number(previous[1])-1,q.prompt);
  else {
   assert.ok(jump,q.prompt);
   assert.equal(q.answer,Number(jump[3])+(jump[2]==="après"?1:-1)*Number(jump[1]),q.prompt);
  }
 }
});
test("Syllabes · chaque question possède une consigne et une réponse entre une et trois syllabes",()=>{
 for(let i=0;i<300;i++){
  const q=createSyllableQuestion();
  assert.ok(q.word.length>0&&q.picture.length>0);
  assert.match(q.prompt,/Combien de syllabes/);
  assert.doesNotMatch(q.prompt,/morceaux?/i);
  assert.ok([1,2,3].includes(q.answer));
  assert.deepEqual([...q.choices].sort(),[1,2,3]);
 }
});

test("Les deux activités sont accessibles depuis les menus enfants et incluses hors ligne",()=>{
 const main=readFileSync(resolve(root,"src/main.js"),"utf8");
 const worker=readFileSync(resolve(root,"service-worker.js"),"utf8");
 assert.match(main,/numberMystery\s*,\s*compareNumbers\s*,\s*syllableGame/);
 assert.match(main,/Nombre mystère/);
 assert.match(main,/compareNumbers/);
 assert.match(main,/Le plus grand nombre/);
 assert.match(main,/Syllabes en rythme/);
 assert.match(main,/Défis de maths/);
 assert.doesNotMatch(main,/Défi penalty/);
 assert.ok(worker.includes("./src/child/learning-lab.js"));
});

test("Comparer les nombres · la réponse est le plus grand des deux nombres",()=>{
 for(let i=0;i<600;i++){
  const q=createCompareQuestion();
  assert.match(q.prompt,/Quel est le plus grand nombre/);
  const nums=[...q.prompt.matchAll(/\d+/g)].map(m=>Number(m[0]));
  assert.equal(nums.length,2);
  assert.equal(q.answer,Math.max(...nums));
  assert.equal(q.choices.length,4);
  assert.equal(new Set(q.choices).size,4);
  assert.ok(q.choices.includes(q.answer));
  assert.ok(q.choices.every(n=>Number.isInteger(n)&&n>=10&&n<=99));
  assert.ok(q.hint.length>0&&q.explanation.length>0);
 }
});


test("Retour sonore doux prévu pour les erreurs et branché sur les jeux",()=>{
 const audio=readFileSync(resolve(root,"src/audio.js"),"utf8");
 const activities=readFileSync(resolve(root,"src/child/activities.js"),"utf8");
 const rose=readFileSync(resolve(root,"src/child/rose-activities.js"),"utf8");
 const reading=readFileSync(resolve(root,"src/child/reading.js"),"utf8");
 assert.match(audio,/export async function gentleOops/);
 assert.match(activities,/gentleOops\(getState\(\)\.settings\.sounds\)/);
 assert.match(rose,/gentleOops\(getState\(\)\.settings\.sounds\)/);
});


test("Les jeux de lecture sonnent aussi les erreurs et les réussites",()=>{
 const reading=readFileSync(resolve(root,"src/child/reading.js"),"utf8");
 assert.match(reading,/gentleOops/);
 assert.match(reading,/cheer/);
});


test("Syllabes · les mots connus ont un nombre de syllabes juste",()=>{
 const expected={chat:1,"vélo":2,lapin:2,tomate:3,banane:3,papillon:3,chocolat:3,maison:2,bateau:2,soleil:2,renard:2,mouton:2,orange:2,fromage:2,cabane:2,camion:2,domino:3,"éléphant":3,crocodile:3,dinosaure:3,ananas:3,fenêtre:2,chapeau:2,canapé:3,fourmi:2,hibou:2,chaussette:2,rivière:2,poussin:2,bonnet:2};
 for(const [word,syllables] of Object.entries(expected)){
  const item=SYLLABLE_WORDS.find(entry=>entry.word===word);
  assert.ok(item,"Le mot attendu doit rester dans la banque : "+word);
  assert.equal(item.syllables,syllables,"Nombre de syllabes incorrect pour "+word);
 }
 assert.ok(SYLLABLE_WORDS.length>=30,"La banque de Rose doit conserver au moins trente mots illustrés.");
});
