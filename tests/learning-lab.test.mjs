import test from "node:test";
import assert from "node:assert/strict";
import {createNumberMysteryQuestion,createCompareQuestion,createSyllableQuestion,SYLLABLE_WORDS,createProgrammingQuestion,createEnglishQuestion,ENGLISH_WORDS} from "../src/child/learning-lab.js";
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
  const decomposition=q.prompt.match(/^Je suis (\d+) centaines?, (\d+) dizaines? et (\d+) unités?\. Qui suis-je \?$/);
  const next=q.prompt.match(/^Quel nombre vient juste après (\d+) \?$/);
  const previous=q.prompt.match(/^Quel nombre vient juste avant (\d+) \?$/);
  const jump=q.prompt.match(/^Quel nombre est placé (\d+) unités (après|avant) (\d+) \?$/);
  if(decomposition) assert.equal(q.answer,Number(decomposition[1])*100+Number(decomposition[2])*10+Number(decomposition[3]),q.prompt);
  else if(next) assert.equal(q.answer,Number(next[1])+1,q.prompt);
  else if(previous) assert.equal(q.answer,Number(previous[1])-1,q.prompt);
  else {
   assert.ok(jump,q.prompt);
   assert.equal(q.answer,Number(jump[3])+(jump[2]==="après"?1:-1)*Number(jump[1]),q.prompt);
  }
 }
});
test("Nombre mystère · les bonds de dix parlent d’unités placées après le nombre",()=>{
 for(let i=0;i<500;i++){const q=createNumberMysteryQuestion();if(q.prompt.includes("10 unités après")){const match=q.prompt.match(/^Quel nombre est placé 10 unités après (\d+) \?$/);assert.ok(match,q.prompt);assert.equal(q.answer,Number(match[1])+10,q.prompt);return;}}
 assert.fail("Aucune question de bond de dix générée.");
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
  assert.ok(q.choices.every(n=>Number.isInteger(n)&&n>=10&&n<=999));
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


test("Syllabes · toute la banque est cohérente, illustrée et sans doublons", () => {
 const expected = {
  chat:1, "vélo":2, lapin:2, tomate:3, banane:3, papillon:3, chocolat:3,
  maison:2, bateau:2, soleil:2, renard:2, mouton:2, orange:2, fromage:2,
  cabane:2, camion:2, domino:3, "éléphant":3, crocodile:3, dinosaure:3,
  ananas:3, fenêtre:2, chapeau:2, canapé:3, fourmi:2, hibou:2, chaussette:2,
  rivière:2, poussin:2, bonnet:2, abeille:2, cerise:2, fraise:1, ballon:2,
  fusée:2, musique:2, koala:3, kangourou:3, escargot:3, cheval:2, voiture:2,
  piano:2, marmite:2, girafe:2, poisson:2, parapluie:3, licorne:2,
  princesse:2, couronne:2, magique:2, château:2, dragon:2, bonbon:2,
  cadeau:2, poulet:2, serpent:2, grenouille:2, pantalon:3, biberon:3,
  "arc-en-ciel":3
 };
 assert.equal(SYLLABLE_WORDS.length, Object.keys(expected).length,
  "La banque et son audit doivent rester synchronisés.");
 assert.equal(new Set(SYLLABLE_WORDS.map(item => item.word)).size, SYLLABLE_WORDS.length,
  "Un mot ne doit apparaître qu'une fois dans la banque.");
 for (const item of SYLLABLE_WORDS) {
  assert.ok(item.picture, "Illustration manquante pour " + item.word);
  assert.ok(Object.hasOwn(expected, item.word), "Mot non audité : " + item.word);
  assert.equal(item.syllables, expected[item.word], "Nombre de syllabes incorrect pour " + item.word);
 }
});


test("Syllabes · les consignes et aides parlent de syllabes, pas de morceaux", () => {
 const main=readFileSync(resolve(root,"src/main.js"),"utf8");
 const reading=readFileSync(resolve(root,"src/child/reading.js"),"utf8");
 const lab=readFileSync(resolve(root,"src/child/learning-lab.js"),"utf8");
 assert.match(main,/description:"Écouter les syllabes des mots\."/);
 assert.match(main,/compter les syllabes/);
 assert.match(reading,/à chaque syllabe entendue/);
 assert.match(reading,/Découper les mots en syllabes à l’oral/);
 assert.match(lab,/On cherche ensemble les syllabes du mot/);
});


test("Mini-programmation · les commandes mènent exactement à l’étoile et les choix sont distincts",()=>{
 for(let i=0;i<500;i++){
  const q=createProgrammingQuestion();
  assert.ok(q.target.x>=1&&q.target.x<=2);
  assert.ok(q.target.y>=1&&q.target.y<=2);
  assert.equal(q.choices.length,3);
  assert.equal(new Set(q.choices).size,3);
  assert.ok(q.choices.includes(q.answer));
  const route=q.answer.split(" ");
  let x=0,y=0;
  for(const symbol of route){
   if(symbol==="➡️")x++;
   else if(symbol==="⬇️")y++;
   else if(symbol==="⬅️")x--;
   else if(symbol==="⬆️")y--;
   else assert.fail("Commande inconnue : "+symbol);
   assert.ok(x>=0&&x<=2&&y>=0&&y<=2,"Le robot reste dans la grille.");
  }
  assert.deepEqual({x,y},q.target);
  for(const option of q.choices.filter(item=>item!==q.answer)){
   let ox=0,oy=0;
   for(const symbol of option.split(" ")){
    if(symbol==="➡️")ox++;
    else if(symbol==="⬇️")oy++;
    else if(symbol==="⬅️")ox--;
    else if(symbol==="⬆️")oy--;
   }
   assert.notDeepEqual({x:ox,y:oy},q.target,"Un distracteur ne doit pas aussi atteindre l’étoile.");
  }
  assert.ok(q.hint.length>0&&q.explanation.length>0);
 }
});
test("Mini-programmation · jeu branché dans le menu de Léon et précaché hors ligne",()=>{
 const main=readFileSync(resolve(root,"src/main.js"),"utf8");
 const worker=readFileSync(resolve(root,"service-worker.js"),"utf8");
 const lab=readFileSync(resolve(root,"src/child/learning-lab.js"),"utf8");
 assert.match(main,/programmingGame/);
 assert.match(main,/Le petit robot programmeur/);
 assert.match(lab,/export function programmingGame/);
 assert.ok(worker.includes("./src/child/learning-lab.js"));
});


test("Anglais oral · les mots ont une traduction unique et trois choix distincts",()=>{
 assert.ok(ENGLISH_WORDS.length>=10);
 assert.equal(new Set(ENGLISH_WORDS.map(item=>item.word)).size,ENGLISH_WORDS.length);
 for(let i=0;i<300;i++){
  const q=createEnglishQuestion();
  assert.ok(ENGLISH_WORDS.some(item=>item.word===q.word&&item.meaning===q.meaning));
  assert.ok(q.picture&&q.hint&&q.prompt);
  assert.equal(q.choices.length,3);
  assert.equal(new Set(q.choices).size,3);
  assert.ok(q.choices.includes(q.meaning));
 }
});
test("Anglais oral · activité disponible dans les menus et voix anglaise paramétrable",()=>{
 const main=readFileSync(resolve(root,"src/main.js"),"utf8");
 const voice=readFileSync(resolve(root,"src/voice.js"),"utf8");
 assert.match(main,/Mes premiers mots en anglais/);
 assert.match(main,/englishGame/);
 assert.match(voice,/language="fr-FR"/);
 assert.match(voice,/u\.lang=language/);
});
