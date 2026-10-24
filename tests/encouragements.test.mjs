import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const audio=readFileSync(resolve(root,"src/audio.js"),"utf8");
const files=["src/child/activities.js","src/child/rose-activities.js","src/child/reading.js","src/child/learning-lab.js","src/child/calcul.js"];

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
