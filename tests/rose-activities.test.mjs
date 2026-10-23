import test from "node:test";
import assert from "node:assert/strict";
import {createRoseQuestion} from "../src/child/rose-activities.js";

for(const mode of ["colors","shapes"]){
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
