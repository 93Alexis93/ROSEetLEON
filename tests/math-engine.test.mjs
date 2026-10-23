import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MATH_DOMAINS,createMathQuestion,adaptDifficulty,updateMathProgress} from "../src/child/math-engine.js";

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
        assert.ok(q.choices.every(choice => !/\s\(\d+\)$/.test(choice)), "aucun choix de secours artificiel");
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
  assert.equal(adaptDifficulty(2,4,0),3);
  assert.equal(adaptDifficulty(2,0,3),1);
});


test("la progression ne compte pas deux fois la même question",()=>{
  const first=updateMathProgress({difficulty:2,correctStreak:1,errorStreak:0,attempts:4,correct:3},{correct:false,firstTry:true});
  const repeated=updateMathProgress(first,{correct:false,firstTry:false});
  assert.deepEqual(repeated,first);
  assert.equal(first.errorStreak,1);
  assert.equal(first.attempts,5);
});

test("trois réussites autonomes font monter d'un niveau puis réinitialisent les séries",()=>{
  let progress={difficulty:1,correctStreak:0,errorStreak:0,attempts:0,correct:0};
  progress=updateMathProgress(progress,{correct:true});
  progress=updateMathProgress(progress,{correct:true});
  progress=updateMathProgress(progress,{correct:true});
  assert.equal(progress.difficulty,2);
  assert.equal(progress.correctStreak,0);
  assert.equal(progress.errorStreak,0);
  assert.equal(progress.attempts,3);
});

test("une réponse après aide avancée est neutre pour le niveau",()=>{
  const progress={difficulty:2,correctStreak:2,errorStreak:0,attempts:7,correct:5};
  const helpedCorrect=updateMathProgress(progress,{correct:true,helped:true});
  assert.equal(helpedCorrect.difficulty,2);
  assert.equal(helpedCorrect.correctStreak,0);
  assert.equal(helpedCorrect.errorStreak,0);
  assert.equal(helpedCorrect.attempts,8);
  assert.equal(helpedCorrect.correct,6);
  const helpedWrong=updateMathProgress(progress,{correct:false,helped:true});
  assert.equal(helpedWrong.difficulty,2);
  assert.equal(helpedWrong.errorStreak,0);
});

test("deux erreurs autonomes font baisser d'un niveau puis réinitialisent les séries",()=>{
  let progress={difficulty:3,correctStreak:0,errorStreak:0,attempts:0,correct:0};
  progress=updateMathProgress(progress,{correct:false});
  progress=updateMathProgress(progress,{correct:false});
  assert.equal(progress.difficulty,2);
  assert.equal(progress.errorStreak,0);
  assert.equal(progress.correctStreak,0);
});

test("un domaine inconnu est signalé explicitement",()=>{
  assert.throws(()=>createMathQuestion("inconnu",1),/Domaine mathématique inconnu/);
});


test("une aide utilisée rend la réponse neutre pour la progression adaptative",()=>{
 const source=readFileSync(new URL("../src/child/activities.js",import.meta.url),"utf8");
 assert.match(source,/helped:\s*hint\s*>\s*0/);
 assert.doesNotMatch(source,/helped:\s*hint\s*>=\s*2/);
});

test("Mesures · l’heure pile et la demi-heure gardent quatre choix distincts, même à 1 h",()=>{
  for(const half of [false,true]){
    const sequence=[0.99,0,half?0.9:0.1];
    const q=createMathQuestion("measures",2,()=>sequence.length?sequence.shift():0.1);
    assert.match(q.prompt,/Quelle heure est indiquée/);
    assert.equal(q.choices.length,4);
    assert.equal(new Set(q.choices).size,4);
    assert.ok(q.choices.includes(q.answer));
    assert.ok(q.choices.every(choice=>!/\s\(\d+\)$/.test(choice)),"pas de choix de secours artificiel");
  }
});
