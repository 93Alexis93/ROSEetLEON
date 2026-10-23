import test from "node:test";
import assert from "node:assert/strict";
import {createNumberMysteryQuestion,createSyllableQuestion} from "../src/child/learning-lab.js";
import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");

test("Nombre mystère · les questions ont quatre choix distincts et une réponse présente",()=>{
 for(let i=0;i<600;i++){
  const q=createNumberMysteryQuestion();
  assert.ok(q.prompt.length>0);
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=99);
  assert.equal(q.choices.length,4);
  assert.equal(new Set(q.choices).size,4);
  assert.ok(q.choices.includes(q.answer));
  assert.ok(q.hint.length>0&&q.explanation.length>0);
 }
});

test("Syllabes · les mots proposés ont une réponse entre une et trois syllabes",()=>{
 for(let i=0;i<300;i++){
  const q=createSyllableQuestion();
  assert.ok(q.word.length>0&&q.picture.length>0);
  assert.ok([1,2,3].includes(q.answer));
  assert.deepEqual([...q.choices].sort(),[1,2,3]);
 }
});

test("Les deux activités sont accessibles depuis les menus enfants et incluses hors ligne",()=>{
 const main=readFileSync(resolve(root,"src/main.js"),"utf8");
 const worker=readFileSync(resolve(root,"service-worker.js"),"utf8");
 assert.match(main,/numberMystery,syllableGame/);
 assert.match(main,/Nombre mystère/);
 assert.match(main,/Les syllabes/);
 assert.ok(worker.includes("./src/child/learning-lab.js"));
});
