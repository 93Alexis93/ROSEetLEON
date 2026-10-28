import test from "node:test";
import assert from "node:assert/strict";
import { SCHOOL_LEVELS, ALL_SKILLS, CHILD_LEVELS, findSkill } from "../src/child/school-curriculum.js";
import { createSchoolQuestion, checkAnswer, numberToWords, fmt, parseAnswer, GENERATORS } from "../src/child/school-engine.js";

// Aléa reproductible pour que les tests ne dépendent pas de la chance.
function seeded(seed) { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 2 ** 32; }; }
const num = text => Number(String(text).replace(/[\s ]/g, "").replace(",", ".").replace("−", "-"));
const runs = (skill, child, n, fn) => { const random = seeded(n * 7919 + skill.id.length); for (let i = 0; i < n; i++) fn(createSchoolQuestion(skill, { child, random })); };

test("École · programme complet de la maternelle au CM2, identifiants uniques", () => {
  assert.deepEqual(SCHOOL_LEVELS.map(l => l.id), ["maternelle", "cp", "ce1", "ce2", "cm1", "cm2"]);
  assert.equal(SCHOOL_LEVELS.reduce((n, l) => n + l.chapters.length, 0), 113);
  const ids = new Set();
  for (const skill of ALL_SKILLS) {
    assert.ok(!ids.has(skill.id), "doublon " + skill.id);
    ids.add(skill.id);
    assert.ok(GENERATORS[skill.gen], "générateur inconnu " + skill.gen);
  }
  for (const level of SCHOOL_LEVELS) for (const ch of level.chapters) {
    assert.ok(ch.lesson.lesson.length > 20 && ch.lesson.example.length > 5, "leçon incomplète " + ch.id);
    assert.ok(ch.skills.length >= 1);
  }
  assert.equal(CHILD_LEVELS.rose[0], "maternelle");
  assert.equal(CHILD_LEVELS.leon[0], "ce1");
});

test("École · chaque compétence produit des choix distincts contenant la réponse (Rose et Léon)", () => {
  for (const skill of ALL_SKILLS) for (const child of ["rose", "leon"]) runs(skill, child, 120, q => {
    assert.ok(q.choices.includes(q.answer), skill.id + " : réponse absente");
    assert.equal(new Set(q.choices).size, q.choices.length, skill.id + " : choix en double");
    assert.ok(q.choices.length >= 2 && q.choices.length <= 4);
    assert.ok(q.prompt && q.hint && q.explanation, skill.id + " : texte manquant");
    assert.doesNotMatch(q.prompt + q.explanation + q.choices.join(), /undefined|NaN|null/, skill.id);
    assert.ok(checkAnswer(q, q.answer), skill.id + " : la bonne réponse doit être acceptée");
  });
});

test("École · Rose reçoit trois propositions, Léon quatre (sauf vrai/faux et signes)", () => {
  for (const skill of ALL_SKILLS.filter(s => s.level === "maternelle")) runs(skill, "rose", 40, q => assert.ok(q.choices.length <= 3, skill.id));
  runs(findSkill("ce1.toutes-tables.2"), "leon", 40, q => assert.equal(q.choices.length, 4));
});

test("École · les calculs affichés sont recalculés indépendamment", () => {
  const ops = { "+": (a, b) => a + b, "−": (a, b) => a - b, "×": (a, b) => a * b, "÷": (a, b) => a / b };
  const binary = /^([\d\s ,]+) ([+−×÷]) ([\d\s ,]+) = \?$/;
  let checked = 0;
  for (const skill of ALL_SKILLS) for (const child of ["leon", "rose"]) runs(skill, child, 80, q => {
    const m = q.prompt.match(binary);
    if (!m) return;
    const expected = ops[m[2]](num(m[1]), num(m[3]));
    assert.ok(Math.abs(num(q.answer) - expected) < 1e-9, `${skill.id} : ${q.prompt} → ${q.answer}`);
    checked++;
  });
  assert.ok(checked > 2000, "assez de calculs vérifiés : " + checked);
});

test("École · nombres manquants, compléments, suites et doubles sont cohérents", () => {
  for (const skill of ALL_SKILLS.filter(s => ["missing", "complement"].includes(s.gen))) runs(skill, "leon", 150, q => {
    const filled = q.prompt.replace("?", q.answer).replace(/[\s ]/g, "").replace(/−/g, "-").replace(/×/g, "*");
    const [left, right] = filled.split("=");
    assert.equal(Function("return " + left)(), Number(right), skill.id + " : " + q.prompt);
  });
  for (const skill of ALL_SKILLS.filter(s => s.gen === "sequenceNum")) runs(skill, "leon", 150, q => {
    const terms = q.prompt.split(" ; ").map(t => t === "?" ? num(q.answer) : num(t));
    const step = terms[1] - terms[0];
    terms.forEach((t, i) => assert.equal(t, terms[0] + i * step, skill.id + " : " + q.prompt));
  });
  for (const skill of ALL_SKILLS.filter(s => s.gen === "doubleHalf")) runs(skill, "leon", 150, q => {
    const n = num(q.prompt.match(/de ([\d\s ]+) \?/)[1]);
    assert.equal(num(q.answer), q.prompt.includes("moitié") ? n / 2 : n * 2, q.prompt);
  });
});

test("École · comparaisons, parité, fractions lues et horloges", () => {
  runs(findSkill("ce1.comparer.1"), "leon", 200, q => {
    const [a, b] = q.prompt.split(" … ").map(num);
    assert.equal(q.answer, a < b ? "<" : a > b ? ">" : "=");
  });
  runs(findSkill("cm1.decimaux.3"), "leon", 200, q => {
    const [a, b] = q.prompt.split(" … ").map(num);
    assert.equal(q.answer, a < b ? "<" : a > b ? ">" : "=", q.prompt);
  });
  runs(findSkill("ce1.pairs.1"), "leon", 200, q => assert.equal(q.answer, num(q.prompt.split(" est-il")[0]) % 2 === 0 ? "pair" : "impair"));
  for (const id of ["ce1.fractions.1", "cm1.fractions.1"]) runs(findSkill(id), "leon", 200, q => assert.equal(q.answer, q.visual.num + "/" + q.visual.den));
  runs(findSkill("ce2.fractions.3"), "leon", 200, q => {
    const { a, b, c, d } = q.visual;
    assert.equal(q.answer, a / b < c / d ? "<" : a / b > c / d ? ">" : "=");
  });
  runs(findSkill("ce2.temps.1"), "leon", 200, q => assert.equal(q.answer, q.visual.h + " h" + (q.visual.m ? " " + String(q.visual.m).padStart(2, "0") : "")));
});

test("École · comptage, monnaie, périmètre, aires et diagrammes correspondent à l’illustration", () => {
  runs(findSkill("maternelle.nombres-10.1"), "rose", 200, q => assert.equal(num(q.answer), q.visual.count));
  runs(findSkill("maternelle.nombres-10.3"), "rose", 200, q => assert.equal(num(q.answer), q.visual.value));
  runs(findSkill("ce1.monnaie.1"), "leon", 200, q => assert.equal(num(q.answer.replace(" €", "")), q.visual.items.reduce((a, b) => a + b, 0)));
  runs(findSkill("ce2.perimetre.1"), "leon", 200, q => {
    const sides = q.visual.sides;
    assert.equal(num(q.answer.replace(" cm", "")), sides.reduce((a, b) => a + b, 0));
  });
  runs(findSkill("cm1.aires.1"), "leon", 200, q => assert.equal(num(q.answer), q.visual.w * q.visual.h));
  runs(findSkill("ce1.donnees.1"), "leon", 300, q => {
    const { names, values } = q.visual;
    if (q.prompt.startsWith("Qui")) assert.equal(q.answer, names[values.indexOf(Math.max(...values))]);
    else if (q.prompt.includes("en tout")) assert.equal(num(q.answer), values.reduce((a, b) => a + b, 0));
  });
  runs(findSkill("maternelle.motifs.2"), "rose", 200, q => assert.ok(q.choices.includes(q.answer)));
});

test("École · le robot arrive bien sur la case annoncée", () => {
  const moves = { "→": [1, 0], "←": [-1, 0], "↑": [0, 1], "↓": [0, -1] };
  for (const id of ["ce1.coder.1", "ce1.coder.2", "cm2.deplacements.1"]) runs(findSkill(id), "leon", 200, q => {
    const [, start, path] = q.prompt.match(/de ([A-E]\d) et suit : ([^.]+)\./);
    let x = "ABCDE".indexOf(start[0]), y = Number(start[1]) - 1;
    for (const a of path.split(" ")) { x += moves[a][0]; y += moves[a][1]; }
    assert.equal(q.answer, "ABCDE"[x] + (y + 1), q.prompt);
  });
});

test("École · nombres en lettres (orthographe rectifiée)", () => {
  const cases = { 21: "vingt-et-un", 71: "soixante-et-onze", 80: "quatre-vingts", 81: "quatre-vingt-un", 91: "quatre-vingt-onze", 200: "deux-cents", 201: "deux-cent-un", 1000: "mille", 80000: "quatre-vingt-mille", 200000: "deux-cent-mille", 2000000: "deux-millions", 200000000: "deux-cents-millions", 352418: "trois-cent-cinquante-deux-mille-quatre-cent-dix-huit" };
  for (const [n, words] of Object.entries(cases)) assert.equal(numberToWords(Number(n)), words);
});

test("École · écriture et lecture des nombres à la française", () => {
  assert.equal(fmt(12450), "12 450");
  assert.equal(fmt(3.5), "3,5");
  assert.equal(parseAnswer("12 450"), 12450);
  assert.equal(parseAnswer("4,7"), 4.7);
  assert.equal(parseAnswer("abc"), null);
  const q = createSchoolQuestion(findSkill("cm2.operations-decimaux.1"), { child: "leon", random: seeded(3) });
  assert.ok(checkAnswer(q, q.answer.replace(",", ".")), "le point décimal est accepté");
});
