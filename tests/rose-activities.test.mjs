import test from "node:test";
import assert from "node:assert/strict";
import {createRoseQuestion} from "../src/child/rose-activities.js";
import {createCountingQuestion} from "../src/child/activities.js";

for(const mode of ["colors","shapes","letters"]){
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
