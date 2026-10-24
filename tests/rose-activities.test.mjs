import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {createRoseQuestion,isRoseNameComplete,getNextRoseLetter,FAMILY_WORDS,shuffleFamilyLetters} from "../src/child/rose-activities.js";
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

test("Rose · comptage : trois réponses distinctes de 1 à 8",()=>{
  for(let i=0;i<200;i++){
    const q=createCountingQuestion();
    assert.equal(q.choices.length,3);
    assert.equal(new Set(q.choices).size,3);
    assert.ok(q.choices.includes(q.answer));
    assert.ok(q.choices.every(n=>Number.isInteger(n)&&n>=1&&n<=8));
    assert.ok(q.count>=1&&q.count<=8);
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

test("Rose · formes : seulement les quatre formes simples demandées",()=>{
  const expected=["Carré","Rond","Triangle","Rectangle"];
  for(let i=0;i<200;i++){const q=createRoseQuestion("shapes");assert.ok(expected.includes(q.answer));assert.ok(q.choices.every(shape=>expected.includes(shape)));}
  const source=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/rose-activities.js"), "utf8");
  assert.match(source,/Reconnaître quatre formes faciles/);
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

test("Rose · composition du prénom : donne la lettre attendue sans bloquer après une erreur",()=>{
  assert.equal(getNextRoseLetter([]),"R");
  assert.equal(getNextRoseLetter(["R"]),"O");
  assert.equal(getNextRoseLetter(["R","O"]),"S");
  assert.equal(getNextRoseLetter(["R","O","S"]),"E");
  assert.equal(getNextRoseLetter(["R","O","S","E"]),null);
  assert.equal(getNextRoseLetter(null),null);
});

test("Rose · la composition du prénom enregistre une session seulement à la réussite complète", () => {
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/rose-activities.js"), "utf8");
  assert.match(source, /if\(chosen\.length===target\.length\)\{[\s\S]*?recordSession\("rose"\)/);
});


test("Rose · comptage : la banque de choix couvre bien huit quantités",()=>{
 const seen=new Set();
 for(let i=0;i<500;i++) seen.add(createCountingQuestion().answer);
 assert.deepEqual([...seen].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8]);
});


for (const mode of ["patterns", "letter-sounds"]) {
  test("Rose · " + mode + " : question complète, réponse présente et choix sans doublons", () => {
    for (let i = 0; i < 200; i++) {
      const q = createRoseQuestion(mode);
      assert.equal(q.mode, mode);
      assert.ok(q.prompt.length > 0);
      assert.ok(q.speakText.length > 0);
      assert.ok(q.hint.length > 0);
      assert.ok(q.explanation.length > 0);
      assert.equal(q.choices.length, 3);
      assert.equal(new Set(q.choices).size, 3);
      assert.ok(q.choices.includes(q.answer));
    }
  });
}


test("Rose · le son des lettres : les sons sont étirés sans révéler la réponse dans la consigne", () => {
  const expected = [
    {letter:"R", sound:"rrrrrrrr"},
    {letter:"O", sound:"oooooo"},
    {letter:"S", sound:"ssssssss"},
    {letter:"E", sound:"eeeuuhh"}
  ];
  for (let i = 0; i < expected.length; i++) {
    const item = expected[i];
    const q = createRoseQuestion("letter-sounds", () => (i + 0.1) / 4);
    assert.equal(q.answer, item.letter);
    assert.ok(q.speakText.includes(item.sound), "Le son de " + item.letter + " doit être étiré.");
    assert.match(q.prompt, /Écoute le son, puis retrouve la lettre/);
    assert.ok(!q.prompt.includes(item.letter), "La consigne ne doit pas donner la réponse.");
    assert.match(q.hint, /Écoute encore le son/);
  }
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/rose-activities.js"), "utf8");
  assert.match(source, /mode==="letter-sounds"\?"Le son des lettres"/);
  assert.match(source, /🔊 Le son des lettres/);
});

test("Rose · les sept jeux à choix multiples utilisent le même parcours de validation", () => {
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/rose-activities.js"), "utf8");
  for (const mode of ["colors", "shapes", "letters", "letter-pairs", "letter-sounds", "patterns"]) {
    assert.ok(source.includes('startRoseActivity("' + mode + '")') || source.includes('mode === "' + mode + '"') || source.includes('mode==="'+mode+'"'),
      "Le mode " + mode + " doit être relié à son parcours de jeu.");
  }
  assert.match(source, /const answer=\(choice,cardEl,answerGrid,feedback\)=>/);
  assert.match(source, /const next=button\(round\+1>=5\?"Terminer":"Question suivante"/);
  assert.match(source, /generate\(\);render\(\)/);
});

test("Rose · le son des lettres : l’aide révèle uniquement la petite lettre",()=>{
 const source=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/rose-activities.js"), "utf8");
 assert.ok(source.includes('mode==="letter-sounds"?"La petite lettre est « "+q.answer.toLowerCase()+" ».":(hintCount===1?q.hint:q.explanation)'));
 assert.match(source,/Écoute le son, puis retrouve la lettre/);
});

test("Rose · reconstitue les prénoms : tous les mots familiaux sont disponibles",()=>{
 assert.deepEqual(FAMILY_WORDS,["ROSE","LÉON","PAPA","MAMAN","ALEXIS","PAULINE","MAMI"]);
 for(const word of FAMILY_WORDS){
  const shuffled=shuffleFamilyLetters(word,()=>0.37);
  assert.equal(shuffled.length,word.length);
  assert.deepEqual(shuffled.map(x=>x.letter).sort(),[...word].sort());
  assert.equal(new Set(shuffled.map(x=>x.id)).size,word.length);
 }
 const source=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/rose-activities.js"), "utf8");
 assert.match(source,/Reconstitue les prénoms/);
 assert.match(source,/Réessayer \(mélanger les lettres\)/);
 assert.match(source,/tokens=shuffleFamilyLetters\(target\)/);
});


test("Rose · comptage : les images sont des boutons tactiles cochables et le titre décrit les éléments variés",()=>{
 const source=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/activities.js"), "utf8");
 assert.match(source,/Compte le nombre d’éléments/);
 assert.match(source,/class: "counting-items"/);
 assert.match(source,/classList\.toggle\("counting-item-checked", checked\)/);
 assert.match(source,/setAttribute\("aria-pressed", String\(checked\)\)/);
 assert.match(source,/Touche chaque image pour la cocher/);
 const menu=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../src/child/rose-activities.js"), "utf8");
 assert.match(menu,/Compte le nombre d’éléments/);
 assert.doesNotMatch(menu,/Compter les licornes/);
});
