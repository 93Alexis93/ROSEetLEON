import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const audio=readFileSync(resolve(root,"src/audio.js"),"utf8");
const files=["src/child/activities.js","src/child/rose-activities.js","src/child/reading.js","src/child/learning-lab.js","src/child/calcul.js","src/child/sentence-builder.js"];

test("Les encouragements vocaux sont variés et personnalisés pour chaque enfant",()=>{
 const leon=audio.match(/const LEON_PRAISES=\[([\s\S]*?)\n\];/);
 const rose=audio.match(/const ROSE_PRAISES=\[([\s\S]*?)\n\];/);
 assert.ok(leon,"La banque d'encouragements de Léon existe");
 assert.ok(rose,"La banque d'encouragements de Rose existe");
 assert.ok((leon[1].match(/"/g)||[]).length/2>=15,"Léon doit avoir au moins 15 messages variés");
 assert.ok((rose[1].match(/"/g)||[]).length/2>=15,"Rose doit avoir au moins 15 messages variés");
 for(const word of ["Mbappé","ballon","cerveau"]) assert.ok(leon[1].toLocaleLowerCase("fr").includes(word.toLocaleLowerCase("fr")),"Référence attendue pour Léon : "+word);
 for(const word of ["licorne","paillettes","princesse","magique"]) assert.ok(rose[1].toLocaleLowerCase("fr").includes(word.toLocaleLowerCase("fr")),"Référence attendue pour Rose : "+word);
 assert.match(audio,/export function sessionPraise\(child,enabled=true\)/);
});

test("Chaque famille d'exercices annonce vocalement la fin de séance",()=>{
 for(const path of files){
  const source=readFileSync(resolve(root,path),"utf8");
  assert.match(source,/sessionPraise\(/,path+" doit annoncer la fin de séance");
 }
});


test("Encouragements · chaque activité félicite les réussites et termine la séance", () => {
 for (const path of files) {
  const source = readFileSync(resolve(root, path), "utf8");
  assert.match(source, /successPraise\(/, path + " doit féliciter une réussite.");
  assert.match(source, /sessionPraise\(/, path + " doit annoncer la fin de séance.");
 }
});

test("Encouragements · les messages sont distincts et restent bienveillants", () => {
 for (const [name, block] of [["Léon", audio.match(/const LEON_PRAISES=\[([\s\S]*?)\n\];/)],
                              ["Rose", audio.match(/const ROSE_PRAISES=\[([\s\S]*?)\n\];/)]]) {
  assert.ok(block, "Banque d’encouragements manquante pour " + name);
  const messages = [...block[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
  assert.ok(messages.length >= 15, "La banque doit être suffisamment variée pour " + name);
  assert.equal(new Set(messages).size, messages.length, "Message dupliqué dans la banque de " + name);
  for (const message of messages) {
   assert.doesNotMatch(message, /\b(nul|nulle|idiot|punition|honte)\b/i,
    "Un encouragement ne doit pas humilier l’enfant : " + message);
  }
 }
 assert.match(audio, /if\(list\.length>1&&index===last\[key\]\)/,
  "Le même message ne doit pas se répéter immédiatement quand une alternative existe.");
});

test("Les encouragements affichés sont lus à voix haute", () => {
 const rose = readFileSync(resolve(root, "src/child/rose-activities.js"), "utf8");
 const reading = readFileSync(resolve(root, "src/child/reading.js"), "utf8");
 const phrases = readFileSync(resolve(root, "src/child/sentence-builder.js"), "utf8");
 const calcul = readFileSync(resolve(root, "src/child/calcul.js"), "utf8");
 assert.match(rose, /speak\(f\.textContent,getState\(\)\.settings\.voice\)/,
  "Les retours affichés dans les jeux de Rose doivent être prononcés");
 assert.match(rose, /speak\(praise,getState\(\)\.settings\.voice\)/,
  "La félicitation affichée à Rose doit être prononcée");
 assert.match(reading, /speak\(feedbackText, getState\(\)\.settings\.voice\)/,
  "Les encouragements de lecture doivent être prononcés");
 assert.match(phrases, /speak\(feedback\.textContent, getState\(\)\.settings\.voice\)/,
  "Les encouragements de phrases doivent être prononcés");
 assert.match(calcul, /speak\(feedback\.textContent, getState\(\)\.settings\.voice\)/,
  "Les encouragements de calcul doivent être prononcés");
});
