import test from "node:test";
import assert from "node:assert/strict";
import {MATH_DOMAINS,createMathQuestion,adaptDifficulty} from "../src/child/math-engine.js";

test("les six domaines sont disponibles",()=>{
  assert.deepEqual(MATH_DOMAINS.map(domain=>domain.id),["mental","numeration","multiplication","problems","logic","measures"]);
});

test("chaque domaine et niveau produit quatre choix distincts contenant la réponse",()=>{
  for(const domain of MATH_DOMAINS){
    for(let difficulty=1;difficulty<=3;difficulty++){
      for(let i=0;i<100;i++){
        const q=createMathQuestion(domain.id,difficulty);
        assert.equal(q.domain,domain.id);
        assert.equal(q.difficulty,difficulty);
        assert.equal(q.choices.length,4);
        assert.equal(new Set(q.choices).size,4);
        assert.ok(q.choices.includes(q.answer));
        assert.ok(q.choices.every(choice => !/\\s\\(\\d+\\)$/.test(choice)), "aucun choix de secours artificiel");
        assert.ok(q.prompt.length>0);
        assert.ok(q.hint.length>0);
        assert.ok(q.explanation.length>0);
      }
    }
  }
});

test("les tables proposées restent limitées à 2, 3, 4, 5 et 10",()=>{
  for(let i=0;i<200;i++){
    const q=createMathQuestion("multiplication",2);
    const match=q.prompt.match(/^(\d+) × (\d+) = \?$/);
    assert.ok(match);
    assert.ok([2,3,4,5,10].includes(Number(match[1])));
    assert.equal(Number(match[1])*Number(match[2]),Number(q.answer));
  }
});

test("l’adaptation augmente après trois réussites et baisse après deux erreurs",()=>{
  assert.equal(adaptDifficulty(1,3,0),2);
  assert.equal(adaptDifficulty(2,3,0),3);
  assert.equal(adaptDifficulty(3,3,0),3);
  assert.equal(adaptDifficulty(3,0,2),2);
  assert.equal(adaptDifficulty(2,0,2),1);
  assert.equal(adaptDifficulty(1,0,2),1);
  assert.equal(adaptDifficulty(2,4,0),2);
  assert.equal(adaptDifficulty(2,0,3),2);
});

test("un domaine inconnu est signalé explicitement",()=>{
  assert.throws(()=>createMathQuestion("inconnu",1),/Domaine mathématique inconnu/);
});
