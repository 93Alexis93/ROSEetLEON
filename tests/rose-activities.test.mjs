import test from "node:test";
import assert from "node:assert/strict";
import {createRoseQuestion,isRoseNameComplete} from "../src/child/rose-activities.js";
import {createCountingQuestion} from "../src/child/activities.js";

for(const mode of ["colors","shapes","letters","letter-pairs"]){
  test("Rose · "+mode+" : trois choix distincts et une réponse présente",()=>{
    for(let i=0;i<200;i++){
      const q=createRoseQuestion(mode);
      assert.equal(q.mode,mode);
      assert.equal(q.choices.length,3);
      assert.equal(new Set(q.choices).size,3);
      assert.ok(q.choices.includes(q.answer));
      assert.ok(q.prompt.length>0);
      assert.ok(q.speakText.length>0);
      assert.ok(q.hint.length>0);
      assert.ok(q.explanation.length>0);
    }
  });
}
test("une activité inconnue de Rose est signalée",()=>{
  assert.throws(()=>createRoseQuestion("inconnue"),/Activité de Rose inconnue/);
});

test("Rose · comptage : trois réponses distinctes de 1 à 5",()=>{
  for(let i=0;i<200;i++){
    const q=createCountingQuestion();
    assert.equal(q.choices.length,3);
    assert.equal(new Set(q.choices).size,3);
    assert.ok(q.choices.includes(q.answer));
    assert.ok(q.choices.every(n=>Number.isInteger(n)&&n>=1&&n<=5));
    assert.ok(q.count>=1&&q.count<=5);
  }
});

test("Rose · lettres : les réponses sont les lettres de son prénom",()=>{
  for(let i=0;i<200;i++){
    const q=createRoseQuestion("letters");
    assert.ok(["R","O","S","E"].includes(q.answer));
    assert.equal(q.choices.length,3);
    assert.equal(new Set(q.choices).size,3);
    assert.ok(q.choices.includes(q.answer));
    assert.ok(q.choices.every(letter=>["R","O","S","E"].includes(letter)));
  }
});

test("Rose · forme étoile : explication avec le bon article",()=>{
  const q=createRoseQuestion("shapes",()=>0.99);
  assert.equal(q.answer,"Étoile");
  assert.ok(q.explanation.startsWith("C’est l’étoile"));
});

test("Rose · majuscules et minuscules : les trois choix sont des lettres minuscules distinctes",()=>{
  for(let i=0;i<200;i++){
    const q=createRoseQuestion("letter-pairs");
    assert.equal(q.choices.length,3);
    assert.equal(new Set(q.choices).size,3);
    assert.ok(q.choices.includes(q.answer));
    assert.ok(["r","o","s","e"].includes(q.answer));
    assert.ok(q.choices.every(letter=>["r","o","s","e"].includes(letter)));
    assert.match(q.prompt,/petite lettre/);
    assert.match(q.explanation,/grande lettre/);
  }
});

test("Rose · composer son prénom : seul ROSE dans le bon ordre est complet",()=>{
  assert.equal(isRoseNameComplete(["R","O","S","E"]),true);
  assert.equal(isRoseNameComplete(["R","O","S"]),false);
  assert.equal(isRoseNameComplete(["R","S","O","E"]),false);
  assert.equal(isRoseNameComplete(["R","O","S","E","R"]),false);
  assert.equal(isRoseNameComplete([]),false);
  assert.equal(isRoseNameComplete("ROSE"),false);
});
