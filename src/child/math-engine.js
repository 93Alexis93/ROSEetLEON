// Moteur pédagogique autonome de la phase 2 — Léon (CE1).
// Aucun accès au DOM ni au stockage : les fonctions restent testables et réutilisables.
export const MATH_DOMAINS = [
  { id: "mental", label: "Calcul mental", description: "Additionner et soustraire de tête" },
  { id: "numeration", label: "Numération", description: "Comprendre dizaines, unités et centaines" },
  { id: "multiplication", label: "Tables de multiplication", description: "S'entraîner avec les tables de 2, 3, 4, 5 et 10" },
  { id: "problems", label: "Petits problèmes", description: "Choisir une opération dans une situation" },
  { id: "logic", label: "Logique", description: "Repérer une règle et poursuivre une suite" },
  { id: "measures", label: "Mesures", description: "Longueurs, monnaie et heures simples" }
];

const int = (min, max, random = Math.random) => min + Math.floor(random() * (max - min + 1));
const shuffle = (items, random = Math.random) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
const unique = values => [...new Set(values.map(String))];

function makeQuestion(domain, difficulty, prompt, answer, distractors, hint, explanation, random) {
  const correct = String(answer);
  let choices = unique([correct, ...distractors]);
  let offset = 1;
  while (choices.length < 4) {
    const numeric = correct.match(new RegExp("^(-?[0-9]+)(.*)$"));
    choices.push(numeric ? String(Number(numeric[1]) + offset) + numeric[2] : correct + " (" + offset + ")");
    offset++;
    choices = unique(choices);
  }
  choices = shuffle(choices, random).slice(0, 4);
  if (!choices.includes(correct)) choices[0] = correct;
  return {
    domain,
    difficulty,
    prompt,
    answer: correct,
    choices: shuffle(choices, random),
    hint,
    explanation
  };
}

function mental(d, random) {
  let a, b, answer, prompt, hint, explanation;
  if (d === 1) {
    a = int(2, 10, random); b = int(1, 10, random);
    const add = random() < 0.65;
    if (!add && b > a) [a, b] = [b, a];
    answer = add ? a + b : a - b;
    prompt = `${a} ${add ? "+" : "−"} ${b} = ?`;
    hint = add ? "Pars du plus grand nombre et avance tranquillement." : "Pars du premier nombre et recule du second.";
    explanation = `${a} ${add ? "+" : "−"} ${b} = ${answer}.`;
  } else if (d === 2) {
    const add = random() < 0.55;
    a = int(12, 69, random); b = int(3, 29, random);
    if (!add && b > a) [a, b] = [b, a];
    answer = add ? a + b : a - b;
    prompt = `${a} ${add ? "+" : "−"} ${b} = ?`;
    hint = "Décompose en dizaines et unités pour calculer par étapes.";
    explanation = `${a} ${add ? "+" : "−"} ${b} = ${answer}.`;
  } else {
    const add = random() < 0.5;
    a = int(25, 89, random); b = int(11, 39, random);
    if (!add && b > a) [a, b] = [b, a];
    answer = add ? a + b : a - b;
    prompt = `${a} ${add ? "+" : "−"} ${b} = ?`;
    hint = "Calcule d'abord les dizaines, puis ajuste avec les unités.";
    explanation = `${a} ${add ? "+" : "−"} ${b} = ${answer}.`;
  }
  return makeQuestion("mental", d, prompt, answer, [answer + 1, Math.max(0, answer - 1), answer + (d === 1 ? 2 : 10)], hint, explanation, random);
}

function numeration(d, random) {
  if (d === 1) {
    const tens = int(1, 9, random), units = int(0, 9, random), value = tens * 10;
    const number = tens * 10 + units;
    return makeQuestion("numeration", d, `Dans ${number}, quelle est la valeur du chiffre des dizaines ?`, value,
      [value + 10, units, tens], "Regarde le chiffre placé juste à gauche des unités.", `${number} contient ${tens} dizaine(s), soit ${value}.`, random);
  }
  if (d === 2) {
    const hundreds = int(1, 9, random), tens = int(0, 9, random), units = int(0, 9, random);
    const number = hundreds * 100 + tens * 10 + units, value = hundreds * 100;
    return makeQuestion("numeration", d, `Dans ${number}, quelle est la valeur du chiffre des centaines ?`, value,
      [value + 100, tens * 10, hundreds], "Une centaine vaut dix dizaines.", `${hundreds} centaine(s) valent ${value}.`, random);
  }
  const tens = int(1, 9, random), units = int(0, 9, random), hundreds = int(1, 8, random);
  const number = hundreds * 100 + tens * 10 + units;
  return makeQuestion("numeration", d, `Quel nombre obtient-on avec ${hundreds} centaine(s), ${tens} dizaine(s) et ${units} unité(s) ?`, number,
    [number + 10, number - 10, hundreds * 100 + units * 10 + tens], "Écris les centaines, puis les dizaines, puis les unités.", `${hundreds} centaines + ${tens} dizaines + ${units} unités = ${number}.`, random);
}

function multiplication(d, random) {
  const tables = d === 1 ? [2, 5, 10] : [2, 3, 4, 5, 10];
  const a = tables[int(0, tables.length - 1, random)], b = int(2, d === 1 ? 5 : 10, random);
  const answer = a * b;
  return makeQuestion("multiplication", d, `${a} × ${b} = ?`, answer,
    [answer + a, answer - a, answer + b], "Tu peux compter par bonds ou additionner plusieurs fois le même nombre.", `${a} groupes de ${b} font ${answer}.`, random);
}

function problems(d, random) {
  const add = random() < 0.55;
  const a = int(d === 1 ? 4 : 12, d === 1 ? 15 : 48, random);
  let b = int(d === 1 ? 2 : 5, d === 1 ? 9 : 27, random);
  if (!add && b > a) b = int(2, a, random);
  const answer = add ? a + b : a - b;
  const items = ["vignettes", "billes", "cartes", "points"];
  const item = items[int(0, items.length - 1, random)];
  const prompt = add
    ? `Léon a ${a} ${item}. Il en gagne ${b}. Combien en a-t-il maintenant ?`
    : `Léon a ${a} ${item}. Il en donne ${b}. Combien lui en reste-t-il ?`;
  return makeQuestion("problems", d, prompt, answer,
    [answer + b, Math.abs(a - b), answer + 1], add ? "La quantité augmente : représente les objets puis ajoute." : "La quantité diminue : imagine que tu enlèves les objets donnés.", `Il faut ${add ? "ajouter" : "enlever"} ${b} à/de ${a} : il reste ${answer}.`, random);
}

function logic(d, random) {
  const step = d === 1 ? [2, 5, 10][int(0, 2, random)] : d === 2 ? [3, 4, 6][int(0, 2, random)] : [4, 7, 9][int(0, 2, random)];
  const start = int(1, d === 1 ? 20 : 40, random);
  const values = [start, start + step, start + 2 * step, start + 3 * step];
  const answer = start + 4 * step;
  return makeQuestion("logic", d, `Complète la suite : ${values.join(" · ")} · ?`, answer,
    [answer + step, answer - step, answer + 1], "Observe de combien le nombre augmente à chaque fois.", `On ajoute ${step} à chaque étape : le nombre suivant est ${answer}.`, random);
}

function measures(d, random) {
  const kind = int(0, d === 1 ? 1 : 2, random);
  if (kind === 0) {
    const meters = int(1, d === 1 ? 5 : 9, random), answer = meters * 100;
    return makeQuestion("measures", d, `${meters} m = combien de centimètres ?`, `${answer} cm`,
      [`${meters * 10} cm`, `${answer + 10} cm`, `${meters * 1000} cm`], "Un mètre correspond à une longueur de 100 centimètres.", `${meters} m = ${answer} cm.`, random);
  }
  if (kind === 1) {
    const euros = int(2, d === 1 ? 9 : 20, random), coins = [1, 2, 5][int(0, 2, random)];
    const answer = euros + coins;
    return makeQuestion("measures", d, `Tu as ${euros} € et tu reçois encore ${coins} €. Combien as-tu ?`, `${answer} €`,
      [`${answer + 1} €`, `${euros} €`, `${Math.max(0, euros - coins)} €`], "Additionne les deux sommes d'argent.", `${euros} € + ${coins} € = ${answer} €.`, random);
  }
  const hours = int(1, 10, random), half = random() < 0.5, minutes = half ? 30 : 0;
  const answer = `${hours} h${minutes ? "30" : "00"}`;
  const nextHour = hours === 12 ? 1 : hours + 1;
  const previousHour = hours === 1 ? 12 : hours - 1;
  const alternatives = unique([
    `${hours} h${minutes ? "00" : "30"}`,
    `${nextHour} h${minutes ? "30" : "00"}`,
    `${previousHour} h${minutes ? "30" : "00"}`,
    `${nextHour} h${minutes ? "00" : "30"}`,
    `${previousHour} h${minutes ? "00" : "30"}`
  ]).filter(choice => choice !== answer);
  return makeQuestion("measures", d, `Quelle heure est indiquée : ${hours} heures ${minutes ? "et demie" : "pile"} ?`, answer,
    alternatives, "Une heure et demie, c'est une heure plus 30 minutes.", `L'heure demandée s'écrit ${answer}.`, random);
}

const generators = { mental, numeration, multiplication, problems, logic, measures };

export function createMathQuestion(domain = "mental", difficulty = 1, random = Math.random) {
  if (!generators[domain]) throw new Error(`Domaine mathématique inconnu : ${domain}`);
  const level = Math.max(1, Math.min(3, Number(difficulty) || 1));
  return generators[domain](level, random);
}

// Adaptation douce : trois réussites autonomes font monter d'un niveau ; deux erreurs
// autonomes font baisser d'un niveau. Le niveau reste toujours entre 1 et 3.
export function adaptDifficulty(difficulty, correctStreak, errorStreak) {
  const level = Math.max(1, Math.min(3, Number(difficulty) || 1));
  if (correctStreak >= 3 && level < 3) return level + 1;
  if (errorStreak >= 2 && level > 1) return level - 1;
  return level;
}

// Fonction pure : une question ne compte qu'une fois pour la progression adaptative.
// Une réponse aidée reste dans les statistiques, mais ne fait ni monter ni baisser le niveau.
export function updateMathProgress(progress, { correct, helped = false, firstTry = true } = {}) {
  const next = {
    difficulty: Math.max(1, Math.min(3, Number(progress?.difficulty) || 1)),
    correctStreak: Math.max(0, Number(progress?.correctStreak) || 0),
    errorStreak: Math.max(0, Number(progress?.errorStreak) || 0),
    attempts: Math.max(0, Number(progress?.attempts) || 0),
    correct: Math.max(0, Number(progress?.correct) || 0)
  };

  if (!firstTry) return next;

  next.attempts++;
  if (correct) next.correct++;

  if (helped) {
    next.correctStreak = 0;
    next.errorStreak = 0;
    return next;
  }

  if (correct) {
    next.correctStreak++;
    next.errorStreak = 0;
  } else {
    next.correctStreak = 0;
    next.errorStreak++;
  }

  const nextDifficulty = adaptDifficulty(next.difficulty, next.correctStreak, next.errorStreak);
  if (nextDifficulty !== next.difficulty) {
    next.difficulty = nextDifficulty;
    next.correctStreak = 0;
    next.errorStreak = 0;
  }

  return next;
}
