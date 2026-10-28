// Moteur de l’École de Rose & Léon — de la maternelle au CM2.
// Fonctions pures : aucun accès au DOM ni au stockage, pour rester testables.
// Les exercices sont des créations originales générées à partir des grands
// thèmes du programme officiel ; aucun contenu tiers n’est reproduit.

/* ---------- Outils ---------- */
export const int = (min, max, random = Math.random) => min + Math.floor(random() * (max - min + 1));
export const pick = (items, random = Math.random) => items[Math.floor(random() * items.length)];
export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const NNBSP = " ";

/** Écrit un nombre à la française : espaces fines entre les classes, virgule décimale. */
export function fmt(value, decimals = null) {
  const n = Number(value);
  const negative = n < 0;
  let text = decimals === null ? String(Math.abs(n)) : Math.abs(n).toFixed(decimals);
  if (text.includes("e")) text = Math.abs(n).toFixed(0);
  let [whole, frac] = text.split(".");
  whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
  if (frac !== undefined && decimals === null) frac = frac.replace(/0+$/, "");
  return (negative ? "−" : "") + whole + (frac ? "," + frac : "");
}
/** Lit une réponse saisie : accepte la virgule, les espaces et le point. */
export function parseAnswer(text) {
  const clean = String(text ?? "").trim().replace(/[\s  ]/g, "").replace(",", ".").replace("−", "-");
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return null;
  return Number(clean);
}
const round2 = n => Math.round(n * 1e6) / 1e6; // arrondi technique (erreurs de virgule flottante)

/* Nombres en lettres (orthographe rectifiée de 1990, référence des programmes : traits d’union partout). */
const UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];
function below100(n) {
  if (n < 20) return UNITS[n];
  const t = Math.floor(n / 10), u = n % 10;
  if (t === 7 || t === 9) {
    const rest = 10 + u;
    return TENS[t] + (t === 7 && u === 1 ? "-et-" : "-") + UNITS[rest];
  }
  if (u === 0) return TENS[t] + (t === 8 ? "s" : "");
  if (u === 1 && t !== 8) return TENS[t] + "-et-un";
  return TENS[t] + "-" + UNITS[u];
}
function below1000(n) {
  const h = Math.floor(n / 100), r = n % 100;
  const parts = [];
  if (h > 0) parts.push(h === 1 ? "cent" : UNITS[h] + "-cent" + (r === 0 ? "s" : ""));
  if (r > 0 || h === 0) parts.push(below100(r));
  return parts.join("-");
}
export function numberToWords(n) {
  if (!Number.isInteger(n) || n < 0 || n > 999999999) throw Error("Nombre hors limites");
  if (n === 0) return "zéro";
  const millions = Math.floor(n / 1e6), thousands = Math.floor(n / 1000) % 1000, rest = n % 1000;
  const parts = [];
  if (millions) parts.push(below1000(millions) + "-million" + (millions > 1 ? "s" : ""));
  if (thousands) parts.push(thousands === 1 ? "mille" : below1000(thousands).replace(/cents$/, "cent").replace(/vingts$/, "vingt") + "-mille");
  if (rest) parts.push(below1000(rest));
  return parts.join("-");
}

/** Construit une liste de choix distincts contenant toujours la bonne réponse. */
export function buildChoices(answer, candidates, count, random = Math.random) {
  const correct = String(answer);
  const pool = [];
  for (const c of candidates) {
    const s = String(c);
    if (s !== correct && !pool.includes(s)) pool.push(s);
  }
  const chosen = shuffle(pool, random).slice(0, count - 1);
  if (chosen.length < count - 1) throw Error("Pas assez de choix distincts pour " + correct);
  return shuffle([correct, ...chosen], random);
}
/** Choix numériques proches, positifs, distincts. */
function numericCandidates(answer, spread = [1, 2, 10], { min = 0, decimals = null } = {}) {
  const out = [];
  for (const d of spread) out.push(answer + d, answer - d);
  out.push(answer * 2, answer + spread[spread.length - 1] * 2);
  return out
    .map(x => decimals === null ? x : round2(x))
    .filter(x => x >= min && x !== answer && Number.isFinite(x));
}
function q({ prompt, speech, answer, choices, hint, explanation, visual = null, answerType = "choice", choiceStyle = "text", numeric = null }) {
  return {
    prompt,
    speech: speech || prompt,
    answer: String(answer),
    choices,
    hint,
    explanation,
    visual,
    answerType,
    choiceStyle,
    numeric
  };
}
function numQ(o, value, { spread = [1, 2, 10], cands = null, count, random, min = 0, input = false, decimals = null, display = fmt }) {
  const answerLabel = display(value);
  const clean = list => list.map(x => decimals === null ? x : round2(x)).filter(x => x >= min && x !== value && Number.isFinite(x));
  const preferred = cands ? [...new Set(clean(cands).map(x => display(x)))].filter(x => x !== answerLabel) : [];
  const fallback = [...new Set(clean(numericCandidates(value, spread, { min, decimals })).map(x => display(x)))].filter(x => x !== answerLabel && !preferred.includes(x));
  // Les distracteurs choisis à la main passent en priorité ; les voisins numériques complètent.
  const pool = preferred.length >= count - 1 ? preferred : [...preferred, ...shuffle(fallback, random).slice(0, count - 1 - preferred.length)];
  return q({
    ...o,
    answer: answerLabel,
    choices: buildChoices(answerLabel, pool, count, random),
    answerType: input ? "number" : "choice",
    numeric: value
  });
}

/* ---------- Univers personnalisés ---------- */
const THEMES = {
  rose: {
    items: [["licorne", "licornes", "🦄"], ["étoile", "étoiles", "⭐"], ["fleur", "fleurs", "🌸"], ["papillon", "papillons", "🦋"], ["couronne", "couronnes", "👑"], ["cœur", "cœurs", "💗"], ["flocon", "flocons", "❄️"], ["patin", "patins", "⛸️"], ["chaton", "chatons", "🐱"], ["fraise", "fraises", "🍓"], ["coquillage", "coquillages", "🐚"], ["arc-en-ciel", "arcs-en-ciel", "🌈"]],
    hero: "Rose", friend: "la licorne Paillette", place: "au château", collect: ["perles magiques", "paillettes", "étoiles", "bonbons", "flocons"],
    trophy: "🦄"
  },
  leon: {
    items: [["ballon", "ballons", "⚽"], ["trophée", "trophées", "🏆"], ["maillot", "maillots", "👕"], ["sifflet", "sifflets", "📣"], ["médaille", "médailles", "🏅"], ["étoile", "étoiles", "⭐"], ["crampon", "crampons", "👟"], ["fusée", "fusées", "🚀"], ["dinosaure", "dinosaures", "🦖"], ["pomme", "pommes", "🍎"], ["palet", "palets", "🥌"], ["drapeau", "drapeaux", "🚩"]],
    hero: "Léon", friend: "son coéquipier Sami", place: "au stade", collect: ["cartes de foot", "billes", "buts", "points", "autocollants"],
    trophy: "⚽"
  }
};
const theme = child => THEMES[child === "rose" ? "rose" : "leon"];
const themeItem = (child, random) => pick(theme(child).items, random);
const plural = (n, item) => n > 1 ? item[1] : item[0];
/** « de » ou « d’ » selon le mot qui suit (élision devant une voyelle). */
export const de = word => /^[aeiouyéèêàâîôûœ]/i.test(word) ? "d’" + word : "de " + word;

/* ---------- Générateurs ---------- */
// Chaque générateur reçoit (params, ctx) avec ctx = { random, child, step, count }.
// count = nombre de choix (3 pour la maternelle, 4 sinon).

const G = {};

/* === Maternelle : quantités et nombres === */
G.count = (p, { random, child, count }) => {
  const max = p.max ?? 5;
  const n = int(p.min ?? 1, max, random);
  const it = themeItem(child, random);
  return numQ({
    prompt: `Combien ${de(it[1])} ?`,
    speech: `Compte les ${it[1]}. Combien y en a-t-il ?`,
    hint: "Touche chaque image une seule fois en disant un nombre.",
    explanation: `Il y a ${n} ${plural(n, it)}.`,
    visual: { type: "items", symbol: it[2], count: n, tappable: true }
  }, n, { cands: [n - 1, n + 1, n - 2, n + 2].filter(x => x <= max + 1), spread: [1, 2, 3], count, random, min: 1 });
};
G.dice = (p, { random, count }) => {
  const n = int(1, p.max ?? 6, random);
  return numQ({
    prompt: "Combien de points sur le dé ?",
    speech: "Regarde le dé. Combien de points vois-tu ?",
    hint: "Essaie de reconnaître la forme des points sans compter un par un.",
    explanation: `Le dé montre ${n} point${n > 1 ? "s" : ""}.`,
    visual: { type: "dice", value: n }
  }, n, { spread: [1, 2, 3], count, random, min: 1 });
};
G.fingers = (p, { random, count }) => {
  const n = int(1, p.max ?? 5, random);
  return numQ({
    prompt: "Combien de doigts sont levés ?",
    speech: "Combien de doigts sont levés ?",
    hint: "Compte les doigts levés, un par un.",
    explanation: `${n} doigt${n > 1 ? "s sont levés" : " est levé"}.`,
    visual: { type: "fingers", value: n }
  }, n, { spread: [1, 2, 3], count, random, min: 1 });
};
G.tenframe = (p, { random, count }) => {
  const n = int(p.min ?? 1, p.max ?? 10, random);
  return numQ({
    prompt: "Combien de jetons dans la boîte ?",
    speech: "Combien de jetons y a-t-il dans la boîte de dix ?",
    hint: "Une ligne pleine, c’est 5 jetons.",
    explanation: `Il y a ${n} jeton${n > 1 ? "s" : ""}.`,
    visual: { type: "tenframe", value: n }
  }, n, { spread: [1, 2, 5], count, random, min: 0 });
};
G.findNumber = (p, { random, count }) => {
  const n = int(p.min ?? 1, p.max ?? 5, random);
  const cands = [];
  for (let i = 1; i <= Math.max(p.max ?? 5, 6); i++) cands.push(i);
  return q({
    prompt: `Touche le nombre ${n}`,
    speech: `Touche le nombre ${n}.`,
    answer: String(n),
    choices: buildChoices(n, cands, count, random),
    hint: `Le nombre ${n} se dit « ${UNITS[n] || n} ».`,
    explanation: `Voici le nombre ${n}.`,
    choiceStyle: "big"
  });
};
G.oneMore = (p, { random, child, count }) => {
  const less = p.less && random() < 0.5;
  const n = less ? int(2, p.max ?? 5, random) : int(1, (p.max ?? 5) - 1, random);
  const it = themeItem(child, random);
  const result = less ? n - 1 : n + 1;
  return numQ({
    prompt: less ? `Il y a ${n} ${plural(n, it)}. 1 ${it[0]} s’en va. Combien en reste-t-il ?` : `Il y a ${n} ${plural(n, it)}. On ajoute encore 1 ${it[0]}. Combien y en a-t-il ?`,
    hint: less ? "Enlever un, c’est dire le nombre juste avant." : "Ajouter un, c’est dire le nombre juste après.",
    explanation: less ? `${n} moins un, ça fait ${result}.` : `${n} et encore un, ça fait ${result}.`,
    visual: { type: "items", symbol: it[2], count: n, extra: less ? -1 : 1 }
  }, result, { spread: [1, 2], count, random, min: 0 });
};
G.moreGroup = (p, { random, child }) => {
  const it = themeItem(child, random);
  const nums = shuffle(Array.from({ length: p.max ?? 6 }, (_, i) => i + 1), random).slice(0, 2);
  const fewer = p.fewer && random() < 0.5;
  const target = fewer ? Math.min(...nums) : Math.max(...nums);
  return q({
    prompt: fewer ? `Touche le groupe qui a le moins ${de(it[1])}` : `Touche le groupe qui a le plus ${de(it[1])}`,
    answer: String(target),
    choices: shuffle(nums.map(String), random),
    hint: "Fais des paires entre les deux groupes : celui qui a des images seules en a le plus.",
    explanation: `Ce groupe a ${target} ${plural(target, it)}.`,
    choiceStyle: "group",
    visual: { type: "groupSymbol", symbol: it[2] }
  });
};
G.compareSmall = (p, { random, count }) => {
  const max = p.max ?? 10;
  const nums = shuffle(Array.from({ length: max }, (_, i) => i + 1), random).slice(0, count);
  const smaller = p.smaller && random() < 0.5;
  const target = smaller ? Math.min(...nums) : Math.max(...nums);
  return q({
    prompt: smaller ? "Touche le plus petit nombre" : "Touche le plus grand nombre",
    answer: String(target),
    choices: shuffle(nums.map(String), random),
    hint: "Récite la comptine : le nombre dit en dernier est le plus grand.",
    explanation: `${target} est le plus ${smaller ? "petit" : "grand"}.`,
    choiceStyle: "big"
  });
};
G.rank = (p, { random, count }) => {
  const animals = ["🐶", "🐱", "🐰", "🐻", "🦊", "🐸", "🐼", "🐯"];
  const row = shuffle(animals, random).slice(0, p.length ?? 5);
  const index = int(0, row.length - 1, random);
  const words = ["premier", "deuxième", "troisième", "quatrième", "cinquième", "sixième"];
  return q({
    prompt: `Qui est le ${words[index]} dans le petit train ?`,
    answer: row[index],
    choices: buildChoices(row[index], row, count, random),
    hint: "Commence à compter depuis la locomotive 🚂.",
    explanation: `Le ${words[index]} est ${row[index]}.`,
    visual: { type: "train", row },
    choiceStyle: "emoji"
  });
};
G.addPictures = (p, { random, child, count }) => {
  const max = p.max ?? 5;
  const sub = p.sub && random() < 0.5;
  let a = int(1, max - 1, random), b = int(1, max - a, random);
  const it = themeItem(child, random);
  if (sub) { const total = a + b; const result = a; return numQ({ prompt: `${total} ${plural(total, it)}, on en enlève ${b}. Combien en reste-t-il ?`, hint: "Cache avec ton doigt celles qu’on enlève, puis compte les autres.", explanation: `${total} − ${b} = ${result}.`, visual: { type: "items", symbol: it[2], count: total, crossed: b } }, result, { spread: [1, 2], count, random }); }
  const result = a + b;
  return numQ({
    prompt: `${a} ${plural(a, it)} et encore ${b}. Combien en tout ?`,
    hint: "Compte d’abord le premier groupe, puis continue avec le second.",
    explanation: `${a} + ${b} = ${result}.`,
    visual: { type: "twoGroups", symbol: it[2], a, b }
  }, result, { spread: [1, 2], count, random, min: 1 });
};
G.decompose = (p, { random, count }) => {
  const total = int(p.min ?? 3, p.max ?? 10, random);
  const a = int(1, total - 1, random);
  return numQ({
    prompt: `${total}, c’est ${a} et combien ?`,
    hint: `Pars de ${a} et compte jusqu’à ${total} sur tes doigts.`,
    explanation: `${a} et ${total - a}, ça fait ${total}.`,
    visual: { type: "tenframe", value: a, target: total }
  }, total - a, { spread: [1, 2], count, random });
};
G.petitProbleme = (p, { random, child, count }) => {
  const t = theme(child);
  const max = p.max ?? 6;
  const kind = pick(["gain", "perte", "partage"], random);
  if (kind === "partage") {
    const each = int(1, 3, random);
    const total = each * 2;
    return numQ({ prompt: `${t.hero} partage ${total} ${pick(t.collect, random)} entre 2 amis, autant chacun. Combien chacun ?`, hint: "Donne un objet à chaque ami, chacun son tour.", explanation: `${total} partagé en 2, ça fait ${each} chacun.`, visual: { type: "items", symbol: themeItem(child, random)[2], count: total } }, each, { spread: [1, 2], count, random, min: 1 });
  }
  const a = int(2, max - 2, random), b = int(1, Math.min(3, max - a), random);
  const thing = pick(t.collect, random);
  if (kind === "gain") return numQ({ prompt: `${t.hero} a ${a} ${thing}. On lui en donne ${b}. Combien en a-t-${child === "rose" ? "elle" : "il"} maintenant ?`, hint: "On ajoute : le nombre devient plus grand.", explanation: `${a} + ${b} = ${a + b}.` }, a + b, { spread: [1, 2], count, random });
  const total = a + b;
  return numQ({ prompt: `${t.hero} a ${total} ${thing}. ${child === "rose" ? "Elle" : "Il"} en perd ${b}. Combien en reste-t-il ?`, hint: "On enlève : le nombre devient plus petit.", explanation: `${total} − ${b} = ${a}.` }, a, { spread: [1, 2], count, random });
};

/* === Maternelle : formes, grandeurs, espace, temps === */
export const SHAPES_2D = {
  rond: { name: "le rond", sides: 0 },
  carré: { name: "le carré", sides: 4 },
  triangle: { name: "le triangle", sides: 3 },
  rectangle: { name: "le rectangle", sides: 4 },
  losange: { name: "le losange", sides: 4 },
  hexagone: { name: "l’hexagone", sides: 6 },
  pentagone: { name: "le pentagone", sides: 5 },
  octogone: { name: "l’octogone", sides: 8 }
};
G.shapeFind = (p, { random, count }) => {
  const set = p.shapes ?? ["rond", "carré", "triangle", "rectangle"];
  const target = pick(set, random);
  return q({
    prompt: `Touche ${SHAPES_2D[target].name}`,
    answer: target,
    choices: buildChoices(target, set, Math.min(count, set.length), random),
    hint: target === "rond" ? "Le rond n’a aucun coin." : `Compte les côtés : ${SHAPES_2D[target].name} en a ${SHAPES_2D[target].sides}.`,
    explanation: `Voici ${SHAPES_2D[target].name}.`,
    choiceStyle: "shape"
  });
};
export const SOLIDS = {
  boule: { label: "la boule", emoji: "⚽", faces: null, edges: null, vertices: null, rolls: true },
  cube: { label: "le cube", emoji: "🎲", faces: 6, edges: 12, vertices: 8, rolls: false },
  cylindre: { label: "le cylindre", emoji: "🥫", faces: null, edges: null, vertices: null, rolls: true },
  cône: { label: "le cône", emoji: "🍦", faces: null, edges: null, vertices: null, rolls: true },
  "pavé droit": { label: "le pavé droit", emoji: "📦", faces: 6, edges: 12, vertices: 8, rolls: false },
  pyramide: { label: "la pyramide", emoji: "🔺", faces: 5, edges: 8, vertices: 5, rolls: false }
};
G.solidFind = (p, { random, count }) => {
  const set = p.solids ?? ["boule", "cube", "cylindre", "cône"];
  const target = pick(set, random);
  return q({
    prompt: `Touche ${SOLIDS[target].label}`,
    answer: target,
    choices: buildChoices(target, set, Math.min(count, set.length), random),
    hint: SOLIDS[target].rolls ? "Cet objet peut rouler." : "Cet objet a des faces plates et des coins.",
    explanation: `${SOLIDS[target].emoji} ressemble à ${SOLIDS[target].label}.`,
    choiceStyle: "solid"
  });
};
const COLOR_BARS = [["rouge", "#e5484d"], ["bleu", "#3b82f6"], ["vert", "#22a06b"], ["jaune", "#f2b705"], ["violet", "#8e4ec6"]];
G.lengthCompare = (p, { random, count }) => {
  const bars = shuffle(COLOR_BARS, random).slice(0, count);
  const lengths = shuffle([3, 5, 7, 9, 11].slice(0, count + 1), random).slice(0, count);
  const shortest = p.shortest && random() < 0.5;
  const target = lengths.indexOf(shortest ? Math.min(...lengths) : Math.max(...lengths));
  return q({
    prompt: shortest ? "Quel ruban est le plus court ?" : "Quel ruban est le plus long ?",
    answer: bars[target][0],
    choices: shuffle(bars.map(b => b[0]), random),
    hint: "Les rubans partent tous du même trait : regarde où ils s’arrêtent.",
    explanation: `Le ruban ${bars[target][0]} est le plus ${shortest ? "court" : "long"}.`,
    visual: { type: "bars", bars: bars.map((b, i) => ({ name: b[0], color: b[1], length: lengths[i] })) },
    choiceStyle: "color"
  });
};
const WEIGHTS = [["🐘", "l’éléphant", 5000], ["🚗", "la voiture", 1200], ["🐄", "la vache", 600], ["🐕", "le chien", 20], ["🍉", "la pastèque", 5], ["🍎", "la pomme", 0.2], ["🐭", "la souris", 0.03], ["🪶", "la plume", 0.001]];
G.massCompare = (p, { random, count }) => {
  const set = shuffle(WEIGHTS, random).slice(0, count);
  const light = p.lightest && random() < 0.5;
  const target = set.reduce((a, b) => (light ? b[2] < a[2] : b[2] > a[2]) ? b : a);
  return q({
    prompt: light ? "Lequel est le plus léger ?" : "Lequel est le plus lourd ?",
    answer: target[0],
    choices: shuffle(set.map(s => s[0]), random),
    hint: "Imagine que tu dois le porter dans tes bras.",
    explanation: `${target[0]} ${target[1]} est le plus ${light ? "léger" : "lourd"}.`,
    choiceStyle: "emoji"
  });
};
G.pattern = (p, { random, child, count }) => {
  const motifs = p.motifs ?? ["AB", "AAB", "ABB", "ABC"];
  const motif = pick(motifs, random);
  const pool = child === "rose" ? ["🦄", "🌈", "⭐", "🌸", "💗", "❄️", "👑", "🦋"] : ["⚽", "🏆", "⭐", "🚀", "🔵", "🔴", "🦖", "🏅"];
  const letters = [...new Set(motif)];
  const symbols = shuffle(pool, random).slice(0, letters.length);
  const map = Object.fromEntries(letters.map((l, i) => [l, symbols[i]]));
  const length = motif.length * 2 + int(0, motif.length - 1, random);
  const seq = Array.from({ length }, (_, i) => map[motif[i % motif.length]]);
  const answer = map[motif[length % motif.length]];
  const others = pool.filter(x => !symbols.includes(x));
  return q({
    prompt: "Qu’est-ce qui vient ensuite ?",
    speech: "Regarde bien la suite. Quelle image vient ensuite ?",
    answer,
    choices: buildChoices(answer, [...symbols, ...others], count, random),
    hint: `Cherche le petit groupe qui se répète : ${motif.split("").map(l => map[l]).join(" ")}.`,
    explanation: `Le motif ${motif.split("").map(l => map[l]).join(" ")} recommence.`,
    visual: { type: "sequence", items: seq },
    choiceStyle: "emoji"
  });
};
const MOMENTS = [["🌅", "le matin"], ["🍽️", "le midi"], ["🌇", "l’après-midi"], ["🌙", "la nuit"]];
const ROUTINE = [["⏰", "se réveiller"], ["🥣", "prendre le petit-déjeuner"], ["🎒", "aller à l’école"], ["🍝", "déjeuner"], ["🛝", "jouer"], ["🛁", "prendre le bain"], ["🛏️", "dormir"]];
const SEASONS = [["🌸", "le printemps"], ["☀️", "l’été"], ["🍂", "l’automne"], ["❄️", "l’hiver"]];
G.timeOrder = (p, { random, count }) => {
  const kind = pick(p.kinds ?? ["routine", "moments", "seasons"], random);
  const list = kind === "routine" ? ROUTINE : kind === "moments" ? MOMENTS : SEASONS;
  const cyclic = kind !== "routine";
  const i = int(0, cyclic ? list.length - 1 : list.length - 2, random);
  const next = list[(i + 1) % list.length];
  return q({
    prompt: `Qu’est-ce qui vient après : ${list[i][0]} ${list[i][1]} ?`,
    answer: next[0],
    choices: buildChoices(next[0], list.map(x => x[0]), Math.min(count, list.length), random),
    hint: kind === "seasons" ? "Pense aux saisons : printemps, été, automne, hiver." : "Raconte ta journée dans l’ordre.",
    explanation: `Après ${list[i][1]}, vient ${next[1]} ${next[0]}.`,
    choiceStyle: "emoji"
  });
};
export const POSITIONS = { "sur": "sur la boîte", "sous": "sous la boîte", "dans": "dans la boîte", "à côté": "à côté de la boîte", "devant": "devant la boîte" };
G.position = (p, { random, child, count }) => {
  const set = p.positions ?? ["sur", "sous", "dans", "à côté"];
  const target = pick(set, random);
  const animal = child === "rose" ? "🐱" : "🐶";
  return q({
    prompt: `Touche l’image où ${child === "rose" ? "le chat" : "le chien"} est ${POSITIONS[target]}`,
    answer: target,
    choices: buildChoices(target, set, Math.min(count, set.length), random),
    hint: target === "sous" ? "Sous, c’est en dessous." : target === "sur" ? "Sur, c’est au-dessus, posé dessus." : target === "dans" ? "Dans, c’est à l’intérieur." : "À côté, c’est tout près, au même niveau.",
    explanation: `${animal} est ${POSITIONS[target]}.`,
    choiceStyle: "scene",
    visual: { type: "sceneSymbol", symbol: animal }
  });
};

/* === Numération (CP → CM2) === */
G.placeValue = (p, { random, count }) => {
  const max = p.max ?? 100;
  const digits = String(max - 1).length;
  const n = int(Math.max(10, Math.floor(max / 10)), max - 1, random);
  const names = ["unités", "dizaines", "centaines", "unités de mille", "dizaines de mille", "centaines de mille", "unités de millions", "dizaines de millions", "centaines de millions"];
  const s = String(n);
  const pos = int(0, Math.min(digits, s.length) - 1, random);
  const digit = Number(s[s.length - 1 - pos]);
  const kind = pick(p.kinds ?? ["digit", "count"], random);
  if (kind === "count" && pos > 0) {
    const howMany = Math.floor(n / 10 ** pos);
    return numQ({ prompt: `Combien y a-t-il de ${names[pos]} en tout dans ${fmt(n)} ?`, hint: `Cache les ${pos} dernier${pos > 1 ? "s" : ""} chiffre${pos > 1 ? "s" : ""} : ce qui reste compte les ${names[pos]}.`, explanation: `Dans ${fmt(n)}, il y a ${fmt(howMany)} ${names[pos]} en tout.` }, howMany, { spread: [1, 10, digit || 2], count, random, min: 0, input: p.input });
  }
  return q({
    prompt: `Dans ${fmt(n)}, quel est le chiffre des ${names[pos]} ?`,
    answer: String(digit),
    choices: buildChoices(digit, [...new Set(s.split(""))].concat(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]), count, random),
    hint: "Les unités sont tout à droite, puis on avance vers la gauche : dizaines, centaines…",
    explanation: `Dans ${fmt(n)}, le chiffre des ${names[pos]} est ${digit}.`,
    visual: { type: "placeTable", value: n, highlight: pos }
  });
};
G.compose = (p, { random, count }) => {
  const max = p.max ?? 100;
  const parts = [];
  let n = 0;
  const pow = String(max - 1).length - 1;
  for (let e = pow; e >= 0; e--) {
    const d = e === pow ? int(1, 9, random) : int(0, 9, random);
    if (d) parts.push(d * 10 ** e);
    n += d * 10 ** e;
  }
  return numQ({
    prompt: `${parts.map(x => fmt(x)).join(" + ")} = ?`,
    hint: "Place chaque morceau dans le tableau : centaines, dizaines, unités…",
    explanation: `${parts.map(x => fmt(x)).join(" + ")} = ${fmt(n)}.`
  }, n, { spread: [9, 90, 10 ** pow], count, random, min: 1, input: p.input });
};
G.tensUnits = (p, { random, count }) => {
  const t = int(1, p.maxTens ?? 9, random), u = int(0, 9, random);
  return numQ({
    prompt: `${t} dizaine${t > 1 ? "s" : ""} et ${u} unité${u > 1 ? "s" : ""}, c’est quel nombre ?`,
    hint: "Une dizaine, c’est un paquet de 10.",
    explanation: `${t} dizaines = ${t * 10}, plus ${u} : ${t * 10 + u}.`,
    visual: { type: "blocks", tens: t, units: u }
  }, t * 10 + u, { spread: [1, 9, 10], count, random, min: 0, input: p.input });
};
G.words = (p, { random, count }) => {
  const n = int(p.min ?? 11, p.max ?? 100, random);
  const reverse = random() < 0.5;
  const near = [n + 1, n - 1, n + 10, n - 10, n + 100, Math.floor(n / 10) * 10 + (n % 10 + 2) % 10].filter(x => x > 0 && x !== n);
  if (reverse) {
    return q({
      prompt: `Quel nombre s’écrit « ${numberToWords(n)} » ?`,
      answer: fmt(n),
      choices: buildChoices(fmt(n), near.map(x => fmt(x)), count, random),
      hint: "Découpe le nom en morceaux : chaque morceau correspond à une partie du nombre.",
      explanation: `« ${numberToWords(n)} » s’écrit ${fmt(n)}.`
    });
  }
  return q({
    prompt: `Comment s’écrit ${fmt(n)} en lettres ?`,
    answer: numberToWords(n),
    choices: buildChoices(numberToWords(n), near.map(numberToWords), count, random),
    hint: "Lis le nombre à voix haute, puis cherche les mêmes mots.",
    explanation: `${fmt(n)} s’écrit « ${numberToWords(n)} ».`,
    choiceStyle: "words"
  });
};
G.compare = (p, { random, count }) => {
  const max = p.max ?? 100;
  let a = int(1, max - 1, random), b;
  const close = random() < 0.6;
  b = close ? Math.max(0, Math.min(max - 1, a + pick([-11, -10, -9, -1, 1, 9, 10, 11, 100, -100], random))) : int(1, max - 1, random);
  if (random() < 0.12) b = a;
  const decimals = p.decimals ?? 0;
  if (decimals) { a = round2(a / 10 ** decimals); b = round2(b / 10 ** decimals); if (random() < 0.4) b = round2(Math.floor(a) + pick([0.5, 0.05, 0.45, 0.9], random)); }
  const sign = a < b ? "<" : a > b ? ">" : "=";
  return q({
    prompt: `${fmt(a)} … ${fmt(b)}`,
    speech: `Quel signe faut-il entre ${fmt(a)} et ${fmt(b)} ?`,
    answer: sign,
    choices: ["<", ">", "="],
    hint: decimals ? "Compare d’abord la partie entière, puis les dixièmes, puis les centièmes." : "Compare d’abord le nombre de chiffres, puis les chiffres de gauche à droite.",
    explanation: `${fmt(a)} ${sign} ${fmt(b)}. Le bec du signe s’ouvre vers le plus grand.`,
    choiceStyle: "big"
  });
};
G.biggest = (p, { random, count }) => {
  const max = p.max ?? 100;
  const base = int(Math.floor(max / 10), max - 1, random);
  const variants = new Set([base]);
  // Mêmes chiffres dans un autre ordre : des distracteurs proches et instructifs.
  for (let tries = 0; variants.size < count && tries < 40; tries++) {
    const perm = shuffle(String(base).split(""), random).join("");
    if (perm[0] !== "0" && Number(perm) < max) variants.add(Number(perm));
  }
  for (let delta = 1; variants.size < count; delta++) variants.add(base + delta * pick([1, 10, 100], random) < max ? base + delta * 7 : base - delta * 3);
  const nums = [...variants].filter(x => x > 0).slice(0, count);
  const smallest = p.smallest && random() < 0.5;
  const target = smallest ? Math.min(...nums) : Math.max(...nums);
  return q({
    prompt: smallest ? "Quel est le plus petit nombre ?" : "Quel est le plus grand nombre ?",
    answer: fmt(target),
    choices: shuffle(nums.map(x => fmt(x)), random),
    hint: "Compare d’abord le nombre de chiffres, puis le chiffre le plus à gauche, puis le suivant.",
    explanation: `${fmt(target)} est le plus ${smallest ? "petit" : "grand"}.`,
    choiceStyle: "big"
  });
};
G.order = (p, { random, count }) => {
  const max = p.max ?? 100;
  const nums = [];
  while (nums.length < 4) { const v = int(1, max - 1, random); if (!nums.includes(v)) nums.push(v); }
  const sorted = [...nums].sort((a, b) => a - b);
  const desc = p.desc && random() < 0.5;
  const correct = (desc ? [...sorted].reverse() : sorted).map(x => fmt(x)).join(" ; ");
  const perms = [];
  const permute = (rest, acc) => { if (!rest.length) perms.push(acc); rest.forEach((v, i) => permute(rest.filter((_, j) => j !== i), [...acc, v])); };
  permute(nums, []);
  const cands = perms.map(list => list.map(x => fmt(x)).join(" ; "));
  return q({
    prompt: desc ? `Range du plus grand au plus petit : ${shuffle(nums, random).map(x => fmt(x)).join(" ; ")}` : `Range du plus petit au plus grand : ${shuffle(nums, random).map(x => fmt(x)).join(" ; ")}`,
    answer: correct,
    choices: buildChoices(correct, cands, count, random),
    hint: desc ? "Trouve d’abord le plus grand, puis le suivant." : "Trouve d’abord le plus petit, puis le suivant.",
    explanation: `Dans l’ordre : ${correct}.`
  });
};
G.neighbors = (p, { random, count }) => {
  const max = p.max ?? 100;
  const n = int(11, max - 2, random);
  const kind = pick(p.kinds ?? ["after", "before"], random);
  const map = {
    after: [n + 1, `Quel nombre vient juste après ${fmt(n)} ?`, "Ajoute 1."],
    before: [n - 1, `Quel nombre vient juste avant ${fmt(n)} ?`, "Enlève 1."],
    tenAfter: [(Math.floor(n / 10) + 1) * 10, `Quelle est la dizaine juste après ${fmt(n)} ?`, "Cherche le prochain nombre qui se termine par 0."],
    tenBefore: [Math.floor(n / 10) * 10 === n ? n - 10 : Math.floor(n / 10) * 10, `Quelle est la dizaine juste avant ${fmt(n)} ?`, "Cherche le nombre en 0 juste en dessous."],
    plus10: [n + 10, `${fmt(n)} + 10 = ?`, "Ajouter 10, c’est ajouter une dizaine."],
    minus10: [n - 10, `${fmt(n)} − 10 = ?`, "Enlever 10, c’est enlever une dizaine."],
    plus100: [n + 100, `${fmt(n)} + 100 = ?`, "Ajouter 100, c’est ajouter une centaine."]
  };
  const [ans, prompt, hint] = map[kind];
  return numQ({ prompt, hint, explanation: `La réponse est ${fmt(ans)}.` }, ans, { spread: [1, 10, 2], count, random, min: 0, input: p.input });
};
G.sequenceNum = (p, { random, count }) => {
  const steps = p.steps ?? [1, 2, 5, 10];
  const step = pick(steps, random);
  const down = p.down && random() < 0.3;
  const start = int(down ? step * 6 : 0, p.max ?? 100, random);
  const seq = Array.from({ length: 5 }, (_, i) => start + (down ? -1 : 1) * step * i);
  const hole = int(1, 4, random);
  const answer = seq[hole];
  const shown = seq.map((v, i) => i === hole ? "?" : fmt(v)).join(" ; ");
  return numQ({ prompt: shown, speech: `Trouve le nombre qui manque dans la suite : ${shown.replace("?", "point d’interrogation")}`, hint: "Regarde de combien on avance (ou recule) à chaque fois.", explanation: `On ${down ? "recule" : "avance"} de ${step} à chaque fois : il manque ${fmt(answer)}.` }, answer, { spread: [step === 1 ? 2 : 1, step, 10], count, random, min: 0, input: p.input });
};
G.parity = (p, { random }) => {
  const max = p.max ?? 100;
  const n = int(1, max, random);
  const even = n % 2 === 0;
  return q({
    prompt: `${fmt(n)} est-il pair ou impair ?`,
    answer: even ? "pair" : "impair",
    choices: ["pair", "impair"],
    hint: "Regarde seulement le dernier chiffre : 0, 2, 4, 6 ou 8 → pair.",
    explanation: `${fmt(n)} se termine par ${n % 10} : il est ${even ? "pair" : "impair"}.`,
    choiceStyle: "big"
  });
};
G.doubleHalf = (p, { random, count }) => {
  const max = p.max ?? 20;
  const half = random() < 0.5;
  if (half) {
    const h = int(1, Math.floor(max / 2), random);
    return numQ({ prompt: `Quelle est la moitié de ${fmt(2 * h)} ?`, hint: "La moitié, c’est partager en deux parts égales.", explanation: `${fmt(h)} + ${fmt(h)} = ${fmt(2 * h)}, donc la moitié de ${fmt(2 * h)} est ${fmt(h)}.` }, h, { spread: [1, 2, 10], count, random, min: 0, input: p.input });
  }
  const n = int(1, max, random);
  return numQ({ prompt: `Quel est le double de ${fmt(n)} ?`, hint: "Le double, c’est le nombre plus lui-même.", explanation: `${fmt(n)} + ${fmt(n)} = ${fmt(2 * n)}.` }, 2 * n, { spread: [1, 2, 10], count, random, min: 0, input: p.input });
};
G.rounding = (p, { random, count }) => {
  const to = pick(p.to ?? [10, 100], random);
  const n = int(to + 1, (p.max ?? 1000) - 1, random);
  const r = Math.round(n / to) * to;
  const names = { 10: "à la dizaine la plus proche", 100: "à la centaine la plus proche", 1000: "au millier le plus proche", 10000: "à la dizaine de mille la plus proche" };
  return numQ({ prompt: `Arrondis ${fmt(n)} ${names[to]}.`, hint: "Regarde le chiffre juste à droite : 5 ou plus, on monte ; sinon on descend.", explanation: `${fmt(n)} est plus proche de ${fmt(r)}.` }, r, { spread: [to, 2 * to], count, random, min: 0 });
};
G.bound = (p, { random, count }) => {
  const by = pick(p.by ?? [10, 100, 1000], random);
  let n = int(by + 1, (p.max ?? 10000) - 1, random);
  if (n % by === 0) n += int(1, by - 1, random);
  const low = Math.floor(n / by) * by;
  const ans = `${fmt(low)} < ${fmt(n)} < ${fmt(low + by)}`;
  const cands = [low - by, low + by, low + 2 * by].filter(x => x >= 0).map(x => `${fmt(x)} < ${fmt(n)} < ${fmt(x + by)}`);
  cands.push(`${fmt(low)} < ${fmt(n)} < ${fmt(low + 2 * by)}`);
  return q({ prompt: `Encadre ${fmt(n)} entre deux nombres « ronds » qui se suivent (de ${fmt(by)} en ${fmt(by)}).`, answer: ans, choices: buildChoices(ans, cands, count, random), hint: `Cherche le multiple de ${fmt(by)} juste en dessous de ${fmt(n)}.`, explanation: ans + "." });
};
G.bigNumbers = (p, { random, count }) => {
  const n = int(1000000, p.max ?? 999999999, random);
  const kind = pick(["millions", "mille", "write"], random);
  if (kind === "write") {
    const m = Math.floor(n / 1e6), k = Math.floor(n / 1000) % 1000, u = n % 1000;
    return q({ prompt: `Écris en chiffres : ${m} million${m > 1 ? "s" : ""} ${k} mille ${u}.`, answer: fmt(n), choices: buildChoices(fmt(n), [m * 1e6 + k * 1e3 + u * 10, m * 1e5 + k * 1e3 + u, m * 1e6 + k * 100 + u, m * 1e7 + k * 1e3 + u].map(x => fmt(x)), count, random), hint: "Fais trois classes : millions, mille, unités. Chaque classe a 3 chiffres.", explanation: `${fmt(n)}.` });
  }
  const millions = Math.floor(n / 1e6), thousands = Math.floor(n / 1000) % 1000;
  const value = kind === "millions" ? millions : thousands;
  return numQ({ prompt: kind === "millions" ? `Dans ${fmt(n)}, quel nombre est dans la classe des millions ?` : `Dans ${fmt(n)}, quel nombre est dans la classe des mille ?`, hint: "Les espaces séparent les classes : millions, mille, unités.", explanation: `C’est ${value}.`, visual: { type: "classes", value: n } }, value, { spread: [1, 10, 100], count, random });
};

/* === Calcul === */
G.add = (p, { random, count }) => {
  const a = int(p.aMin ?? 1, p.aMax ?? 10, random), b = int(p.bMin ?? 1, p.bMax ?? 10, random);
  return numQ({ prompt: `${fmt(a)} + ${fmt(b)} = ?`, hint: p.hint ?? "Pars du plus grand nombre et ajoute le plus petit.", explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` }, a + b, { spread: [1, 10, 2], count, random, input: p.input });
};
G.sub = (p, { random, count }) => {
  let a = int(p.aMin ?? 2, p.aMax ?? 10, random), b = int(p.bMin ?? 1, p.bMax ?? 9, random);
  if (b > a) [a, b] = [b, a];
  return numQ({ prompt: `${fmt(a)} − ${fmt(b)} = ?`, hint: p.hint ?? "Tu peux aussi chercher combien il faut ajouter à " + fmt(b) + " pour aller à " + fmt(a) + ".", explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}, car ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}.` }, a - b, { spread: [1, 10, 2], count, random, input: p.input });
};
G.complement = (p, { random, count }) => {
  const to = pick(p.to ?? [10], random);
  const step = to >= 1000 ? 10 : to >= 100 ? (p.round ? 5 : 1) : 1;
  const a = Math.floor(int(1, to - 1, random) / step) * step || step;
  return numQ({ prompt: `${fmt(a)} + ? = ${fmt(to)}`, hint: `Compte ce qu’il manque pour aller de ${fmt(a)} à ${fmt(to)}.`, explanation: `${fmt(a)} + ${fmt(to - a)} = ${fmt(to)}.` }, to - a, { spread: [1, 10, 2], count, random, input: p.input });
};
G.missing = (p, { random, count }) => {
  const op = pick(p.ops ?? ["+", "−", "×"], random);
  const max = p.max ?? 50;
  let a, b, c, text;
  if (op === "+") { a = int(1, max, random); b = int(1, max, random); c = a + b; text = random() < 0.5 ? `? + ${fmt(b)} = ${fmt(c)}` : `${fmt(a)} + ? = ${fmt(c)}`; return numQ({ prompt: text, hint: "Pour retrouver un terme d’une addition, on soustrait.", explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(c)}.` }, text.startsWith("?") ? a : b, { spread: [1, 10, 2], count, random, input: p.input }); }
  if (op === "−") { b = int(1, max, random); c = int(1, max, random); a = b + c; text = `${fmt(a)} − ? = ${fmt(c)}`; return numQ({ prompt: text, hint: "Combien faut-il enlever ? Calcule l’écart entre les deux nombres.", explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(c)}.` }, b, { spread: [1, 10, 2], count, random, input: p.input }); }
  a = int(2, 10, random); b = int(2, 10, random); c = a * b;
  return numQ({ prompt: `${fmt(a)} × ? = ${fmt(c)}`, hint: `Récite la table de ${a}.`, explanation: `${fmt(a)} × ${fmt(b)} = ${fmt(c)}.` }, b, { spread: [1, 2], count, random, min: 1, input: p.input });
};
G.mul = (p, { random, count }) => {
  const tables = p.tables ?? [2, 3, 4, 5, 10];
  const a = pick(tables, random), b = int(p.bMin ?? 1, p.bMax ?? 10, random);
  const [x, y] = random() < 0.5 ? [a, b] : [b, a];
  return numQ({ prompt: `${fmt(x)} × ${fmt(y)} = ?`, hint: `C’est ${y} fois ${x} : ${Array(Math.min(y, 6)).fill(fmt(x)).join(" + ")}${y > 6 ? " + …" : ""}`, explanation: `${fmt(x)} × ${fmt(y)} = ${fmt(x * y)}.` }, x * y, { spread: [a, b, 1], count, random, min: 0, input: p.input });
};
G.mulBig = (p, { random, count }) => {
  const a = int(p.aMin ?? 12, p.aMax ?? 99, random), b = int(p.bMin ?? 2, p.bMax ?? 9, random);
  return numQ({ prompt: `${fmt(a)} × ${fmt(b)} = ?`, hint: `Décompose : ${fmt(a)} = ${fmt(Math.floor(a / 10) * 10)} + ${a % 10}, puis multiplie chaque morceau par ${fmt(b)}.`, explanation: `${fmt(a)} × ${fmt(b)} = ${fmt(a * b)}.` }, a * b, { spread: [b, 10, 100], count, random, input: p.input });
};
G.mul10 = (p, { random, count }) => {
  const by = pick(p.by ?? [10, 100, 1000], random);
  const divide = p.divide && random() < 0.5;
  const decimals = p.decimals ?? 0;
  let a = decimals ? round2(int(1, 9999, random) / 10 ** int(1, decimals, random)) : int(2, 999, random);
  if (divide && !decimals) a = a * by;
  const result = round2(divide ? a / by : a * by);
  return numQ({ prompt: `${fmt(a)} ${divide ? "÷" : "×"} ${fmt(by)} = ?`, hint: divide ? "Diviser par 10, 100, 1 000 : chaque chiffre recule d’un, deux ou trois rangs." : "Multiplier par 10, 100, 1 000 : chaque chiffre avance d’un, deux ou trois rangs.", explanation: `${fmt(a)} ${divide ? "÷" : "×"} ${fmt(by)} = ${fmt(result)}.` }, result, { cands: [result * 10, result / 10, result * 100, result / 100, a].map(round2), count, random, decimals: 3, input: p.input });
};
G.div = (p, { random, count }) => {
  const d = pick(p.divisors ?? [2, 3, 4, 5, 10], random);
  const quotient = int(p.qMin ?? 1, p.qMax ?? 10, random);
  const remainder = p.remainder ? int(0, d - 1, random) : 0;
  const n = d * quotient + remainder;
  if (p.remainder && random() < 0.5) {
    return numQ({ prompt: `Dans la division de ${fmt(n)} par ${fmt(d)}, quel est le reste ?`, hint: `Cherche le plus grand multiple de ${d} qui ne dépasse pas ${fmt(n)}.`, explanation: `${fmt(n)} = ${fmt(d)} × ${fmt(quotient)} + ${remainder}. Le reste est ${remainder}.` }, remainder, { spread: [1, 2, d], count, random, min: 0, input: p.input });
  }
  return numQ({ prompt: p.remainder ? `Dans la division de ${fmt(n)} par ${fmt(d)}, quel est le quotient ?` : `${fmt(n)} ÷ ${fmt(d)} = ?`, hint: `Combien de fois ${d} dans ${fmt(n)} ? Pense à la table de ${d}.`, explanation: `${fmt(d)} × ${fmt(quotient)} = ${fmt(d * quotient)}${remainder ? ` et il reste ${remainder}` : ""}.` }, quotient, { spread: [1, 2, 10], count, random, min: 0, input: p.input });
};
G.multiples = (p, { random, count }) => {
  const d = pick(p.of ?? [2, 3, 5, 10], random);
  const kind = pick(p.kinds ?? ["multiple", "divisor"], random);
  if (kind === "divisor") {
    const n = d * int(2, 12, random);
    const divisors = []; for (let i = 2; i <= 12; i++) if (n % i === 0) divisors.push(i);
    const non = []; for (let i = 2; i <= 12; i++) if (n % i !== 0) non.push(i);
    const target = pick(divisors, random);
    return q({ prompt: `Lequel est un diviseur de ${fmt(n)} ?`, answer: String(target), choices: buildChoices(target, non, count, random), hint: "Un diviseur tombe juste : la division ne laisse pas de reste.", explanation: `${fmt(n)} = ${target} × ${n / target}.`, choiceStyle: "big" });
  }
  const yes = d * int(2, 15, random);
  const nos = []; for (let k = 0; nos.length < 12 && k < 100; k++) { const v = int(10, 15 * d, random); if (v % d !== 0) nos.push(v); }
  return q({ prompt: `Lequel est un multiple de ${d} ?`, answer: fmt(yes), choices: buildChoices(fmt(yes), nos.map(x => fmt(x)), count, random), hint: d === 2 ? "Multiple de 2 = nombre pair." : d === 5 ? "Un multiple de 5 se termine par 0 ou 5." : d === 10 ? "Un multiple de 10 se termine par 0." : d === 3 ? "Additionne les chiffres : si la somme est dans la table de 3, c’est gagné." : `Cherche dans la table de ${d}.`, explanation: `${fmt(yes)} = ${d} × ${yes / d}.`, choiceStyle: "big" });
};
G.priority = (p, { random, count }) => {
  const a = int(2, 9, random), b = int(2, 9, random), c = int(2, 9, random);
  const kind = pick(["a+bc", "ab+c", "(a+b)c", "a-bc"], random);
  let text, result, hint;
  if (kind === "a+bc") { text = `${a + 20} + ${b} × ${c}`; result = a + 20 + b * c; hint = "La multiplication passe avant l’addition."; }
  else if (kind === "ab+c") { text = `${a} × ${b} + ${c}`; result = a * b + c; hint = "On calcule d’abord le produit."; }
  else if (kind === "(a+b)c") { text = `(${a} + ${b}) × ${c}`; result = (a + b) * c; hint = "Les parenthèses d’abord !"; }
  else { text = `${b * c + a + 10} − ${b} × ${c}`; result = a + 10; hint = "La multiplication passe avant la soustraction."; }
  return numQ({ prompt: `${text} = ?`, hint, explanation: `${text} = ${fmt(result)}.` }, result, { spread: [1, 10, 5], count, random, input: p.input });
};
G.estimate = (p, { random, count }) => {
  const a = int(110, 990, random), b = int(110, 990, random);
  const mul = p.mul && random() < 0.4;
  const exact = mul ? a * int(2, 9, random) : a + b;
  const factor = mul ? exact / a : 0;
  const est = mul ? Math.round(a / 100) * 100 * factor : Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
  const text = mul ? `${fmt(a)} × ${factor}` : `${fmt(a)} + ${fmt(b)}`;
  return numQ({ prompt: `Quel est l’ordre de grandeur de ${text} ?`, hint: "Arrondis chaque nombre à la centaine, puis calcule de tête.", explanation: `On arrondit : environ ${fmt(est)} (le résultat exact est ${fmt(exact)}).` }, est, { spread: [100, 1000, 500].map(x => mul ? x * factor : x), count, random, min: 100 });
};

/* === Fractions et décimaux === */
const frac = (n, d) => `${n}/${d}`;
G.fractionRead = (p, { random, count }) => {
  const dens = p.dens ?? [2, 3, 4];
  const d = pick(dens, random), n = int(1, d - 1, random);
  const shape = pick(p.shapes ?? ["bar", "disc"], random);
  const cands = [frac(d, n), frac(n, d + 1), frac(Math.max(1, n - 1), d), frac(n + 1, d), frac(d - n, d), frac(n, Math.max(2, d - 1)), frac(n, d + 2), frac(d - n, n + d)].filter(x => x !== frac(n, d) && !x.endsWith("/1"));
  return q({
    prompt: "Quelle fraction de la figure est coloriée ?",
    answer: frac(n, d),
    choices: buildChoices(frac(n, d), cands, count, random),
    hint: "Le nombre du bas compte toutes les parts égales ; celui du haut compte les parts coloriées.",
    explanation: `${n} part${n > 1 ? "s" : ""} coloriée${n > 1 ? "s" : ""} sur ${d} : ${n}/${d}.`,
    visual: { type: "fraction", num: n, den: d, shape },
    choiceStyle: "fraction"
  });
};
G.fractionOf = (p, { random, count }) => {
  const d = pick(p.dens ?? [2, 3, 4, 5, 10], random), n = p.unit ? 1 : int(1, d - 1, random);
  const k = int(1, p.k ?? 6, random);
  const total = d * k;
  return numQ({ prompt: `Combien font ${frac(n, d)} de ${fmt(total)} ?`, speech: `Combien font ${n} ${d === 2 ? "demi" : d === 3 ? "tiers" : d === 4 ? "quart" : "sur " + d} de ${total} ?`, hint: `Partage ${fmt(total)} en ${d} parts égales, puis prends-en ${n}.`, explanation: `${fmt(total)} ÷ ${d} = ${k}, puis ${k} × ${n} = ${fmt(k * n)}.`, choiceStyle: "fractionText" }, n * k, { cands: [total, d, n * k + k, Math.max(1, n * k - k), total - n * k], spread: [1, 2, 3], count, random, min: 1, input: p.input });
};
G.fractionCompare = (p, { random, count }) => {
  const sameDen = random() < 0.6;
  let a, b, c, d;
  if (sameDen) { b = d = int(3, 12, random); a = int(1, b - 1, random); do { c = int(1, b + 2, random); } while (c === a); }
  else { a = c = int(1, 3, random); b = int(a + 1, 10, random); do { d = int(a + 1, 10, random); } while (d === b); }
  const left = a / b, right = c / d;
  const sign = Math.abs(left - right) < 1e-9 ? "=" : left < right ? "<" : ">";
  return q({ prompt: `${frac(a, b)} … ${frac(c, d)}`, speech: "Quel signe faut-il entre ces deux fractions ?", answer: sign, choices: ["<", ">", "="], hint: sameDen ? "Même dénominateur : la plus grande a le plus grand numérateur." : "Même numérateur : plus les parts sont nombreuses, plus elles sont petites.", explanation: `${frac(a, b)} ${sign} ${frac(c, d)}.`, choiceStyle: "fractionPair", visual: { type: "fractionCompare", a, b, c, d } });
};
G.fractionEquivalent = (p, { random, count }) => {
  const d = pick([2, 3, 4, 5], random), n = int(1, d - 1, random), k = int(2, 5, random);
  const ans = frac(n * k, d * k);
  const cands = [frac(n * k, d * k + 1), frac(n + k, d + k), frac(n * k + 1, d * k), frac(n * k, d), frac(n, d * k), frac(d * k, n * k)];
  return q({ prompt: `Quelle fraction est égale à ${frac(n, d)} ?`, answer: ans, choices: buildChoices(ans, cands, count, random), hint: "Multiplie le numérateur et le dénominateur par le même nombre.", explanation: `${frac(n, d)} = ${ans} (on a multiplié en haut et en bas par ${k}).`, choiceStyle: "fraction" });
};
G.fractionDecimal = (p, { random, count }) => {
  const d = pick(p.dens ?? [10, 100], random);
  let n = int(1, d * 3 - 1, random);
  if (d === 100 && n % 10 === 0) n += int(1, 9, random); // évite les écritures simplifiables
  if (d === 10 && n % 10 === 0) n += 1;
  const value = round2(n / d);
  if (random() < 0.5) {
    const ans = frac(n, d);
    const other = d === 10 ? 100 : 10;
    const cands = [frac(n, other), frac(n + 1, d), frac(n - 1, d), frac(d, n), frac(n * 10, d)].filter(x => x !== ans && !x.startsWith("0/"));
    return q({ prompt: `Quelle fraction est égale à ${fmt(value)} ?`, answer: ans, choices: buildChoices(ans, cands, count, random), hint: "Le premier chiffre après la virgule compte les dixièmes, le deuxième les centièmes.", explanation: `${fmt(value)} = ${ans}.`, choiceStyle: "fraction" });
  }
  return numQ({ prompt: `${frac(n, d)} = ?`, speech: `${n} ${d === 10 ? "dixièmes" : "centièmes"}, c’est quel nombre décimal ?`, hint: d === 10 ? "Un dixième = 0,1." : "Un centième = 0,01.", explanation: `${frac(n, d)} = ${fmt(value)}.`, choiceStyle: "fractionText" }, value, { cands: [value * 10, value / 10, n, value * 100].map(round2), count, random, decimals: 3 });
};
G.decimalPlace = (p, { random, count }) => {
  const n = round2(int(1001, 99999, random) / 100);
  const names = ["dixièmes", "centièmes"];
  const pos = int(0, 1, random);
  const s = n.toFixed(2).split(".")[1];
  const digit = Number(s[pos]);
  return q({ prompt: `Dans ${fmt(n, 2)}, quel est le chiffre des ${names[pos]} ?`, answer: String(digit), choices: buildChoices(digit, ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], count, random), hint: "Juste après la virgule : les dixièmes ; ensuite : les centièmes.", explanation: `Dans ${fmt(n, 2)}, le chiffre des ${names[pos]} est ${digit}.`, choiceStyle: "big" });
};
G.decimalCalc = (p, { random, count }) => {
  const op = pick(p.ops ?? ["+", "−"], random);
  const a = round2(int(10, 999, random) / 10), b = round2(int(10, 999, random) / pick([10, 100], random));
  if (op === "×") { const m = int(2, 9, random); const r = round2(a * m); return numQ({ prompt: `${fmt(a)} × ${m} = ?`, hint: "Calcule comme avec des entiers, puis replace la virgule.", explanation: `${fmt(a)} × ${m} = ${fmt(r)}.` }, r, { spread: [0.1, 1, 10].map(x => round2(x * m)), count, random, decimals: 3, input: p.input }); }
  const [x, y] = op === "−" && b > a ? [b, a] : [a, b];
  const r = round2(op === "+" ? x + y : x - y);
  return numQ({ prompt: `${fmt(x)} ${op} ${fmt(y)} = ?`, hint: "Aligne les virgules : unités sous unités, dixièmes sous dixièmes.", explanation: `${fmt(x)} ${op} ${fmt(y)} = ${fmt(r)}.` }, r, { spread: [0.1, 1, 0.01], count, random, decimals: 3, input: p.input });
};

/* === Grandeurs et mesures === */
const UNIT_TABLE = {
  length: [["km", 1000000], ["m", 1000], ["dm", 100], ["cm", 10], ["mm", 1]],
  mass: [["kg", 1000], ["g", 1]],
  capacity: [["L", 100], ["dL", 10], ["cL", 1]]
};
G.convert = (p, { random, count }) => {
  const kind = pick(p.kinds ?? ["length"], random);
  const units = (p.units?.[kind]) ?? UNIT_TABLE[kind].map(u => u[0]);
  const table = UNIT_TABLE[kind].filter(u => units.includes(u[0]));
  let i = int(0, table.length - 2, random), j = int(i + 1, table.length - 1, random);
  const [big, small] = [table[i], table[j]];
  const ratio = big[1] / small[1];
  const down = random() < 0.6;
  const v = int(1, p.max ?? 9, random);
  if (down) return numQ({ prompt: `${fmt(v)} ${big[0]} = ? ${small[0]}`, hint: `1 ${big[0]} = ${fmt(ratio)} ${small[0]}.`, explanation: `${fmt(v)} ${big[0]} = ${fmt(v * ratio)} ${small[0]}.` }, v * ratio, { cands: [v * ratio * 10, v * ratio / 10, v, v * ratio * 100].filter(x => x >= 1), count, random, min: 1, display: x => fmt(x) + " " + small[0] });
  return numQ({ prompt: `${fmt(v * ratio)} ${small[0]} = ? ${big[0]}`, hint: `${fmt(ratio)} ${small[0]} = 1 ${big[0]}.`, explanation: `${fmt(v * ratio)} ${small[0]} = ${fmt(v)} ${big[0]}.` }, v, { cands: [v * 10, v * 100, v * ratio, v * ratio * 10], count, random, min: 1, display: x => fmt(x) + " " + big[0] });
};
G.unitChoice = (p, { random, count }) => {
  const items = [
    ["la longueur d’un crayon", "cm", ["km", "m", "kg", "L"]], ["la hauteur d’une porte", "m", ["mm", "km", "g", "cL"]], ["la distance entre deux villes", "km", ["cm", "mm", "kg", "L"]],
    ["la masse d’un ballon de foot", "g", ["kg", "km", "L", "m"]], ["la masse d’un enfant", "kg", ["g", "km", "L", "cm"]], ["la contenance d’une bouteille d’eau", "L", ["kg", "km", "m", "g"]],
    ["la contenance d’une cuillère", "cL", ["L", "kg", "km", "m"]], ["l’épaisseur d’une pièce de 1 €", "mm", ["km", "m", "L", "kg"]], ["la durée d’un match de foot", "min", ["s", "jours", "kg", "km"]],
    ["la durée des vacances d’été", "semaines", ["s", "min", "kg", "cm"]], ["la longueur d’un terrain de foot", "m", ["mm", "cm", "L", "g"]]
  ];
  const [what, ans, others] = pick(items, random);
  return q({ prompt: `Quelle unité choisir pour mesurer ${what} ?`, answer: ans, choices: buildChoices(ans, others, count, random), hint: "Imagine l’objet : est-ce une longueur, une masse, une contenance ou une durée ? Petit ou grand ?", explanation: `On utilise le ${ans === "L" ? "litre" : ans === "cL" ? "centilitre" : ans} pour ${what}.`, choiceStyle: "big" });
};
G.ruler = (p, { random, count }) => {
  const max = p.max ?? 12;
  const start = p.offset ? int(1, 4, random) : 0;
  const len = int(2, max - start, random);
  return numQ({ prompt: "Quelle est la longueur du trait, en centimètres ?", hint: start ? `Le trait ne commence pas à 0 : fais ${start + len} − ${start}.` : "Le trait commence au 0 : lis le nombre au bout du trait.", explanation: `Le trait mesure ${len} cm.`, visual: { type: "ruler", start, length: len, max } }, len, { spread: [1, start || 2, 2], count, random, min: 1, display: x => fmt(x) + " cm" });
};
const pad = n => String(n).padStart(2, "0");
const timeLabel = (h, m) => `${h} h${m ? " " + pad(m) : ""}`;
G.clock = (p, { random, count }) => {
  const minutesSet = p.minutes ?? [0];
  const h = int(1, 12, random), m = pick(minutesSet, random);
  const ans = timeLabel(h, m);
  const cands = [timeLabel(h % 12 + 1, m), timeLabel(h === 1 ? 12 : h - 1, m), timeLabel(h, (m + 30) % 60), timeLabel(m / 5 || 12, h * 5 % 60), timeLabel(h, (m + 15) % 60), timeLabel(h, (m + 5) % 60)];
  return q({ prompt: "Quelle heure est-il ?", answer: ans, choices: buildChoices(ans, cands, count, random), hint: "La petite aiguille montre les heures, la grande aiguille montre les minutes.", explanation: `Il est ${ans}.`, visual: { type: "clock", h, m }, choiceStyle: "big" });
};
G.duration = (p, { random, child, count }) => {
  const t = theme(child);
  const events = child === "rose" ? ["Le spectacle de patinage", "Le cours de danse", "La fête au château"] : ["Le match", "L’entraînement de rink hockey", "Le tournoi de foot"];
  const h = int(8, 17, random), m = pick([0, 15, 30, 45], random);
  const d = pick(p.durations ?? [15, 30, 45, 60, 90], random);
  const end = h * 60 + m + d;
  const ans = timeLabel(Math.floor(end / 60), end % 60);
  const cands = [d + 10, d - 15, d + 60, d + 30, d - 30].filter(x => x > 0).map(x => { const e = h * 60 + m + x; return timeLabel(Math.floor(e / 60), e % 60); });
  return q({ prompt: `${pick(events, random)} commence à ${timeLabel(h, m)} et dure ${d >= 60 ? (d === 60 ? "1 h" : "1 h " + (d - 60)) : d + " min"}. À quelle heure finit-il ?`, answer: ans, choices: buildChoices(ans, cands, count, random), hint: "Avance d’abord jusqu’à l’heure pile, puis ajoute le reste.", explanation: `${timeLabel(h, m)} + ${d} min = ${ans}.`, choiceStyle: "big" });
};
G.timeUnits = (p, { random, count }) => {
  const facts = [["Combien de minutes dans 1 heure ?", 60], ["Combien d’heures dans 1 jour ?", 24], ["Combien de jours dans 1 semaine ?", 7], ["Combien de mois dans 1 année ?", 12], ["Combien de secondes dans 1 minute ?", 60], ["Combien de minutes dans une demi-heure ?", 30], ["Combien de minutes dans un quart d’heure ?", 15], ["Combien de minutes dans 2 heures ?", 120], ["Combien d’heures dans 2 jours ?", 48], ["Combien de jours dans 2 semaines ?", 14]];
  const [text, ans] = pick(facts.slice(0, p.level === 1 ? 4 : facts.length), random);
  return numQ({ prompt: text, hint: "Pense à l’horloge et au calendrier.", explanation: `La réponse est ${ans}.` }, ans, { spread: [1, 10, 5], count, random, min: 1 });
};
const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
G.calendar = (p, { random, count }) => {
  const months = random() < (p.months ?? 0.5);
  const list = months ? MONTHS : DAYS;
  const i = int(0, list.length - 1, random);
  const before = random() < 0.4;
  const ans = list[(i + (before ? -1 : 1) + list.length) % list.length];
  return q({ prompt: `Quel ${months ? "mois" : "jour"} vient juste ${before ? "avant" : "après"} ${list[i]} ?`, answer: ans, choices: buildChoices(ans, list, count, random), hint: months ? "Récite les mois dans l’ordre, en commençant par janvier." : "Récite les jours de la semaine, en commençant par lundi.", explanation: `${before ? "Avant" : "Après"} ${list[i]}, c’est ${ans}.`, choiceStyle: "big" });
};
const COINS = [1, 2, 5, 10, 20, 50];
G.money = (p, { random, count }) => {
  const set = p.values ?? COINS;
  const n = int(2, p.pieces ?? 4, random);
  const items = Array.from({ length: n }, () => pick(set, random)).sort((a, b) => b - a);
  const total = items.reduce((a, b) => a + b, 0);
  return numQ({ prompt: "Combien d’euros en tout ?", hint: "Commence par les plus gros billets et pièces, puis ajoute les petits.", explanation: `${items.join(" + ")} = ${total} €.`, visual: { type: "money", items } }, total, { spread: [1, 2, 5, 10], count, random, min: 1, display: x => fmt(x) + " €", input: p.input });
};
G.change = (p, { random, child, count }) => {
  const price = int(p.minPrice ?? 3, p.maxPrice ?? 18, random);
  const paid = price <= 5 ? 5 : price <= 10 ? 10 : 20;
  const thing = child === "rose" ? pick(["une couronne", "un livre de licornes", "des paillettes", "un doudou"], random) : pick(["un ballon", "un maillot", "des cartes de foot", "un palet"], random);
  return numQ({ prompt: `${theme(child).hero} achète ${thing} à ${price} € et paie avec ${paid} €. Combien lui rend-on ?`, hint: `Compte de ${price} jusqu’à ${paid}.`, explanation: `${paid} − ${price} = ${paid - price} €.` }, paid - price, { spread: [1, 2, 5], count, random, min: 0, display: x => fmt(x) + " €", input: p.input });
};
G.perimeter = (p, { random, count }) => {
  const kind = pick(p.shapes ?? ["rectangle", "carré", "triangle"], random);
  let sides, explanation;
  if (kind === "carré") { const c = int(2, 12, random); sides = [c, c, c, c]; explanation = `4 × ${c} = ${4 * c} cm.`; }
  else if (kind === "rectangle") { const L = int(4, 15, random), l = int(2, L - 1, random); sides = [L, l, L, l]; explanation = `${L} + ${l} + ${L} + ${l} = ${2 * (L + l)} cm.`; }
  else { const a = int(3, 9, random), b = int(3, 9, random), c = int(Math.abs(a - b) + 1, a + b - 1, random); sides = [a, b, c]; explanation = `${a} + ${b} + ${c} = ${a + b + c} cm.`; }
  const P = sides.reduce((x, y) => x + y, 0);
  return numQ({ prompt: `Quel est le périmètre de ce ${kind} ?`, hint: "Le périmètre, c’est le tour de la figure : additionne toutes les longueurs.", explanation, visual: { type: "polygonSides", shape: kind, sides } }, P, { spread: [sides[0], sides[1], 2], count, random, min: 1, display: x => fmt(x) + " cm", input: p.input });
};
G.area = (p, { random, count }) => {
  const L = int(2, p.max ?? 8, random), l = int(1, Math.min(L, 6), random);
  const grid = p.grid ?? true;
  return numQ({ prompt: grid ? "Combien de carreaux recouvrent ce rectangle ?" : `Quelle est l’aire d’un rectangle de ${L} cm sur ${l} cm ?`, hint: grid ? "Compte les carreaux d’une ligne, puis multiplie par le nombre de lignes." : "Aire du rectangle = longueur × largeur.", explanation: `${L} × ${l} = ${L * l}${grid ? " carreaux" : " cm²"}.`, visual: grid ? { type: "grid", w: L, h: l } : null }, L * l, { spread: [L, l, 2], count, random, min: 1, display: x => fmt(x) + (grid ? "" : " cm²"), input: p.input });
};
G.angle = (p, { random, count }) => {
  const kinds = p.kinds ?? ["droit", "aigu", "obtus"];
  const kind = pick(kinds, random);
  const deg = kind === "droit" ? 90 : kind === "aigu" ? int(20, 70, random) : int(110, 160, random);
  const choices = kinds.length === 2 ? ["droit", "pas droit"] : kinds;
  const ans = kinds.length === 2 ? (kind === "droit" ? "droit" : "pas droit") : kind;
  return q({ prompt: kinds.length === 2 ? "Cet angle est-il droit ?" : "Cet angle est…", answer: ans, choices: buildChoices(ans, choices, Math.min(count, choices.length), random), hint: "Compare avec le coin d’une feuille : c’est un angle droit.", explanation: kind === "droit" ? "C’est un angle droit, comme le coin d’une feuille." : kind === "aigu" ? "Il est plus petit qu’un angle droit : il est aigu." : "Il est plus grand qu’un angle droit : il est obtus.", visual: { type: "angle", deg }, choiceStyle: "big" });
};

/* === Géométrie === */
G.polygonName = (p, { random, count }) => {
  const set = p.shapes ?? ["triangle", "carré", "rectangle", "pentagone", "hexagone"];
  const kind = pick(p.kinds ?? ["name", "sides"], random);
  const target = pick(set.filter(s => s !== "rond"), random);
  if (kind === "sides") return numQ({ prompt: `Combien de côtés a ${SHAPES_2D[target].name} ?`, hint: "Fais le tour de la figure avec ton doigt en comptant.", explanation: `${SHAPES_2D[target].name[0].toUpperCase() + SHAPES_2D[target].name.slice(1)} a ${SHAPES_2D[target].sides} côtés.`, visual: { type: "shape", shape: target } }, SHAPES_2D[target].sides, { spread: [1, 2], count, random, min: 3 });
  return q({ prompt: "Comment s’appelle cette figure ?", answer: target, choices: buildChoices(target, set.filter(s => s !== "rond"), Math.min(count, set.length - (set.includes("rond") ? 1 : 0)), random), hint: "Compte ses côtés et regarde ses angles.", explanation: `C’est ${SHAPES_2D[target].name}.`, visual: { type: "shape", shape: target }, choiceStyle: "big" });
};
G.figureProperties = (p, { random, count }) => {
  const facts = [
    ["J’ai 4 côtés égaux et 4 angles droits.", "carré"], ["J’ai 4 angles droits, 2 grands côtés et 2 petits côtés.", "rectangle"], ["J’ai 4 côtés égaux et aucun angle droit.", "losange"],
    ["Tous mes points sont à la même distance du centre.", "cercle"], ["J’ai 6 côtés.", "hexagone"], ["J’ai 3 côtés.", "triangle"],
    ["Je suis un triangle avec un angle droit.", "triangle rectangle"], ["Je suis un triangle avec 3 côtés égaux.", "triangle équilatéral"], ["Je suis un triangle avec exactement 2 côtés égaux.", "triangle isocèle"]
  ];
  // En mode avancé, « triangle » seul est retiré pour éviter deux bonnes réponses.
  const pool = p.advanced ? facts.filter(f => f[1] !== "triangle") : facts.slice(0, 6);
  const [text, ans] = pick(pool, random);
  return q({ prompt: `Qui suis-je ? ${text}`, answer: ans, choices: buildChoices(ans, pool.map(f => f[1]), count, random), hint: "Relis chaque indice et élimine les figures qui ne vont pas.", explanation: `C’est le ${ans}.`, choiceStyle: "big" });
};
G.solidProps = (p, { random, count }) => {
  const set = ["cube", "pavé droit", "pyramide"];
  const s = pick(set, random);
  const prop = pick(["faces", "edges", "vertices"], random);
  const label = { faces: "faces", edges: "arêtes", vertices: "sommets" }[prop];
  const ans = SOLIDS[s][prop];
  return numQ({ prompt: `Combien ${de(label)} a ${SOLIDS[s].label} ?`, hint: prop === "faces" ? "Les faces sont les surfaces plates." : prop === "edges" ? "Les arêtes sont les bords où deux faces se touchent." : "Les sommets sont les coins pointus.", explanation: `${SOLIDS[s].label[0].toUpperCase() + SOLIDS[s].label.slice(1)} a ${ans} ${label}.`, visual: { type: "solidEmoji", solid: s } }, ans, { spread: [1, 2, 4], count, random, min: 1 });
};
G.solidName = (p, { random, count }) => {
  const set = p.solids ?? ["boule", "cube", "cylindre", "cône", "pavé droit", "pyramide"];
  const clues = { boule: "Je roule dans tous les sens et je n’ai aucune face plate.", cube: "J’ai 6 faces carrées toutes pareilles.", cylindre: "J’ai 2 faces plates en forme de disque et je roule tout droit.", cône: "J’ai une seule face plate, un disque, et une pointe.", "pavé droit": "J’ai 6 faces rectangulaires, comme une boîte à chaussures.", pyramide: "Ma base est un carré et mes faces triangulaires se rejoignent en haut." };
  const target = pick(set, random);
  return q({ prompt: `Qui suis-je ? ${clues[target]}`, answer: target, choices: buildChoices(target, set, count, random), hint: "Pense aux objets de la maison : une balle, une boîte, une canette…", explanation: `C’est ${SOLIDS[target].label} ${SOLIDS[target].emoji}.`, choiceStyle: "solid" });
};
G.netFaces = (p, { random, count }) => {
  const items = [["Combien de carrés faut-il pour le patron d’un cube ?", 6, "Un cube a 6 faces : il faut 6 carrés."], ["Combien de rectangles (ou carrés) faut-il pour le patron d’un pavé droit ?", 6, "Un pavé a 6 faces."], ["Combien de triangles dans le patron d’une pyramide à base carrée ?", 4, "4 faces triangulaires et 1 carré pour la base."], ["Combien de disques dans le patron d’un cylindre ?", 2, "Un disque en haut, un disque en bas, et un rectangle qui s’enroule."]];
  const [text, ans, expl] = pick(items, random);
  return numQ({ prompt: text, hint: "Un patron, c’est le solide déplié à plat : une forme par face.", explanation: expl }, ans, { spread: [1, 2], count, random, min: 1 });
};
const SYM_LETTERS = { yes: ["A", "H", "I", "M", "O", "T", "U", "V", "W", "X", "Y"], no: ["F", "G", "J", "L", "N", "P", "Q", "R", "S", "Z"] };
G.symmetry = (p, { random, count }) => {
  const kind = pick(p.kinds ?? ["letters", "axes"], random);
  if (kind === "axes") {
    const shapes = [["un carré", 4], ["un rectangle (pas carré)", 2], ["un triangle équilatéral", 3], ["un losange (pas carré)", 2], ["un triangle isocèle (pas équilatéral)", 1]];
    const [name, ans] = pick(shapes, random);
    return numQ({ prompt: `Combien d’axes de symétrie a ${name} ?`, hint: "Imagine que tu plies la figure : les deux moitiés doivent se superposer exactement.", explanation: `${name[0].toUpperCase() + name.slice(1)} a ${ans} axe${ans > 1 ? "s" : ""} de symétrie.` }, ans, { spread: [1, 2], count, random, min: 0 });
  }
  const ans = pick(SYM_LETTERS.yes, random);
  return q({ prompt: "Quelle lettre a un axe de symétrie vertical ?", answer: ans, choices: buildChoices(ans, SYM_LETTERS.no, count, random), hint: "Imagine un miroir posé au milieu de la lettre, de haut en bas.", explanation: `${ans} : sa moitié gauche et sa moitié droite se superposent.`, choiceStyle: "big" });
};
G.gridPos = (p, { random, child, count }) => {
  const cols = p.cols ?? 4, rows = p.rows ?? 4;
  const c = int(0, cols - 1, random), r = int(0, rows - 1, random);
  const letter = "ABCDEF"[c];
  const ans = letter + (r + 1);
  const cands = []; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) cands.push("ABCDEF"[i] + (j + 1));
  const near = cands.filter(x => x !== ans && (x[0] === letter || x[1] === String(r + 1) || x === String(r + 1)));
  const symbol = child === "rose" ? "🦄" : "⚽";
  return q({ prompt: `Dans quelle case est ${symbol} ?`, answer: ans, choices: buildChoices(ans, near.length >= count - 1 ? near : cands, count, random), hint: "Donne d’abord la lettre de la colonne, puis le numéro de la ligne.", explanation: `${symbol} est dans la case ${ans}.`, visual: { type: "grid2", cols, rows, at: [c, r], symbol }, choiceStyle: "big" });
};
const ARROWS = { "→": [1, 0], "←": [-1, 0], "↑": [0, 1], "↓": [0, -1] };
G.coding = (p, { random, child, count }) => {
  const cols = 5, rows = 5;
  let x = int(0, 2, random), y = int(0, 2, random);
  const start = [x, y];
  const moves = [];
  const n = int(p.min ?? 2, p.max ?? 4, random);
  for (let k = 0; k < n * 4 && moves.length < n; k++) {
    const OPPOSITE = { "→": "←", "←": "→", "↑": "↓", "↓": "↑" };
    const a = pick(Object.keys(ARROWS), random);
    if (moves.length && OPPOSITE[a] === moves[moves.length - 1]) continue; // pas d’aller-retour inutile
    const [dx, dy] = ARROWS[a];
    if (x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows) { x += dx; y += dy; moves.push(a); }
  }
  const name = (cx, cy) => "ABCDE"[cx] + (cy + 1);
  const ans = name(x, y);
  const near = [name(start[0], start[1]), ...Object.values(ARROWS).map(([dx, dy]) => (x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows) ? name(x + dx, y + dy) : null).filter(Boolean)].filter(c => c !== ans);
  const all = []; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) all.push(name(i, j));
  const cands = [...new Set(near)].length >= count - 1 ? near : [...near, ...shuffle(all.filter(c => c !== ans && !near.includes(c)), random)].slice(0, count + 2);
  return q({ prompt: `Le robot part de ${name(...start)} et suit : ${moves.join(" ")}. Où arrive-t-il ?`, speech: `Le robot part de ${name(...start)} et suit les flèches. Où arrive-t-il ?`, answer: ans, choices: buildChoices(ans, cands, count, random), hint: "Suis chaque flèche avec ton doigt sur la grille, une case à la fois.", explanation: `Après ${moves.join(" ")}, le robot est en ${ans}.`, visual: { type: "grid2", cols, rows, at: start, symbol: "🤖" }, choiceStyle: "big" });
};
G.lines = (p, { random, count }) => {
  const kind = pick(p.kinds ?? ["notation", "relation"], random);
  if (kind === "relation") {
    const rel = pick(["parallèles", "perpendiculaires", "sécantes"], random);
    return q({ prompt: "Ces deux droites sont…", answer: rel, choices: ["parallèles", "perpendiculaires", "sécantes"], hint: "Parallèles : elles ne se croisent jamais. Perpendiculaires : elles se croisent en faisant un angle droit.", explanation: rel === "sécantes" ? "Elles se croisent, mais sans angle droit : elles sont sécantes." : `Elles sont ${rel}.`, visual: { type: "lines", rel }, choiceStyle: "big" });
  }
  const items = [["le segment d’extrémités A et B", "[AB]"], ["la droite qui passe par A et B", "(AB)"], ["la demi-droite d’origine A qui passe par B", "[AB)"], ["la longueur du segment [AB]", "AB"]];
  const [text, ans] = pick(items, random);
  return q({ prompt: `Comment note-t-on ${text} ?`, answer: ans, choices: buildChoices(ans, items.map(i => i[1]), count, random), hint: "Crochet = le trait s’arrête au point ; parenthèse = le trait continue.", explanation: `On note ${ans}.`, choiceStyle: "big" });
};
G.circle = (p, { random, count }) => {
  const r = int(2, 12, random);
  const fromR = random() < 0.5;
  return numQ({ prompt: fromR ? `Le rayon d’un cercle mesure ${r} cm. Combien mesure son diamètre ?` : `Le diamètre d’un cercle mesure ${2 * r} cm. Combien mesure son rayon ?`, hint: "Le diamètre fait deux fois le rayon.", explanation: fromR ? `${r} × 2 = ${2 * r} cm.` : `${2 * r} ÷ 2 = ${r} cm.` }, fromR ? 2 * r : r, { spread: [r, 1, 2], count, random, min: 1, display: x => fmt(x) + " cm" });
};

/* === Données, hasard, proportionnalité === */
G.chart = (p, { random, child, count }) => {
  const names = child === "rose" ? ["Rose", "Lila", "Inès", "Nour"] : ["Léon", "Sami", "Adam", "Yanis"];
  const values = names.map(() => int(1, p.max ?? 9, random));
  const top = Math.max(...values);
  if (values.filter(v => v === top).length > 1) values[values.indexOf(top)] += 1;
  const what = child === "rose" ? "pirouettes" : "buts";
  const kind = pick(["max", "value", "total", "diff"], random);
  const i = int(0, 3, random), j = (i + int(1, 3, random)) % 4;
  let prompt, ans, explanation;
  const maxV = Math.max(...values);
  if (kind === "max") return q({ prompt: `Qui a fait le plus de ${what} ?`, answer: names[values.indexOf(maxV)], choices: shuffle(names, random), hint: "Cherche la barre la plus haute.", explanation: `${names[values.indexOf(maxV)]} : ${maxV} ${what}.`, visual: { type: "chart", names, values, unit: what }, choiceStyle: "big" });
  if (kind === "value") { prompt = `Combien de ${what} pour ${names[i]} ?`; ans = values[i]; explanation = `${names[i]} : ${ans} ${what}.`; }
  else if (kind === "total") { prompt = `Combien de ${what} en tout ?`; ans = values.reduce((a, b) => a + b, 0); explanation = `${values.join(" + ")} = ${ans}.`; }
  else { const [a, b] = values[i] >= values[j] ? [i, j] : [j, i]; prompt = `Combien de ${what} de plus pour ${names[a]} que pour ${names[b]} ?`; ans = values[a] - values[b]; explanation = `${values[a]} − ${values[b]} = ${ans}.`; }
  return numQ({ prompt, hint: "Lis la hauteur de chaque barre sur l’échelle.", explanation, visual: { type: "chart", names, values, unit: what } }, ans, { spread: [1, 2, 3], count, random, min: 0 });
};
G.probability = (p, { random, count }) => {
  const kind = pick(["vocab", "most"], random);
  if (kind === "vocab") {
    const items = [["Le soleil se lèvera demain matin.", "certain"], ["Avec un dé normal, je fais 7.", "impossible"], ["Avec un dé normal, je fais 6.", "possible"], ["En tirant une boule d’un sac de boules rouges, j’obtiens une boule rouge.", "certain"], ["À pile ou face, j’obtiens pile.", "possible"], ["Un mois de février avec 35 jours.", "impossible"]];
    const [text, ans] = pick(items, random);
    return q({ prompt: `${text} C’est…`, answer: ans, choices: ["certain", "possible", "impossible"], hint: "Certain : ça arrive à coup sûr. Impossible : ça n’arrive jamais.", explanation: `C’est ${ans}.`, choiceStyle: "big" });
  }
  const colors = [["rouges", "🔴"], ["bleues", "🔵"], ["vertes", "🟢"]];
  const counts = shuffle([1, 2, 3, 4, 5, 6], random).slice(0, 3);
  const best = counts.indexOf(Math.max(...counts));
  return q({ prompt: `Dans un sac : ${counts.map((c, i) => `${c} boule${c > 1 ? "s" : ""} ${c > 1 ? colors[i][0] : colors[i][0].slice(0, -1)}`).join(", ")}. Sans regarder, quelle couleur a le plus de chances de sortir ?`, answer: colors[best][1], choices: colors.map(c => c[1]), hint: "La couleur la plus nombreuse a le plus de chances.", explanation: `Il y a plus de boules ${colors[best][0]}.`, visual: { type: "bag", items: colors.map((c, i) => [c[1], counts[i]]) }, choiceStyle: "emoji" });
};
G.proportion = (p, { random, child, count }) => {
  const items = child === "rose" ? [["paquets de paillettes", "€"], ["rubans", "€"], ["billets pour le spectacle", "€"]] : [["cartes de foot", "€"], ["bouteilles d’eau", "€"], ["places pour le match", "€"]];
  const [thing] = pick(items, random);
  const unitPrice = int(2, 9, random);
  const a = int(2, 5, random);
  let b = a * int(2, 4, random);
  if (random() < 0.3) b = a + int(1, 3, random);
  return numQ({ prompt: `${a} ${thing} coûtent ${a * unitPrice} €. Combien coûtent ${b} ${thing} ?`, hint: `Trouve d’abord le prix d’un seul : ${a * unitPrice} ÷ ${a}.`, explanation: `1 coûte ${unitPrice} €, donc ${b} coûtent ${b} × ${unitPrice} = ${b * unitPrice} €.` }, b * unitPrice, { spread: [unitPrice, a * unitPrice, 1], count, random, min: 1, display: x => fmt(x) + " €", input: p.input });
};
G.percent = (p, { random, count }) => {
  const pct = pick([10, 25, 50, 20, 75], random), base = pick([20, 40, 60, 80, 100, 200, 120], random);
  const ans = base * pct / 100;
  return numQ({ prompt: `Combien font ${pct} % de ${base} ?`, hint: pct === 50 ? "50 %, c’est la moitié." : pct === 25 ? "25 %, c’est le quart." : pct === 10 ? "10 %, c’est diviser par 10." : "Calcule d’abord 10 % (ou 25 %), puis adapte.", explanation: `${pct} % de ${base} = ${fmt(ans)}.` }, ans, { spread: [base / 10, 5, 10], count, random, min: 0, decimals: 3 });
};

/* === Problèmes === */
G.problem = (p, { random, child, count }) => {
  const t = theme(child);
  const max = p.max ?? 50;
  const ops = p.ops ?? ["add", "sub", "compare"];
  const op = pick(ops, random);
  const thing = pick(t.collect, random);
  const pronoun = child === "rose" ? "elle" : "il";
  let a = int(Math.max(2, Math.floor(max / 5)), max, random), b = int(1, Math.max(1, Math.floor(max / 2)), random);
  let prompt, ans, explanation, hint;
  if (op === "add") { prompt = `${t.hero} a ${fmt(a)} ${thing}. ${t.friend[0].toUpperCase() + t.friend.slice(1)} lui en donne ${fmt(b)}. Combien en a-t-${pronoun} maintenant ?`; ans = a + b; hint = "On lui en donne : la quantité augmente."; explanation = `${fmt(a)} + ${fmt(b)} = ${fmt(ans)}.`; }
  else if (op === "sub") { if (b > a) [a, b] = [b, a]; prompt = `${t.hero} a ${fmt(a)} ${thing}. ${pronoun[0].toUpperCase() + pronoun.slice(1)} en perd ${fmt(b)}. Combien lui en reste-t-il ?`; ans = a - b; hint = "Il en perd : la quantité diminue."; explanation = `${fmt(a)} − ${fmt(b)} = ${fmt(ans)}.`; }
  else if (op === "compare") { if (b > a) [a, b] = [b, a]; if (a === b) a++; prompt = `${t.hero} a ${fmt(a)} ${thing} et ${t.friend} en a ${fmt(b)}. Combien ${t.hero} en a-t-${pronoun} de plus ?`; ans = a - b; hint = "Cherche l’écart entre les deux quantités."; explanation = `${fmt(a)} − ${fmt(b)} = ${fmt(ans)}.`; }
  else if (op === "groups") { const g = int(2, p.groups ?? 6, random), e = int(2, p.each ?? 10, random); prompt = child === "rose" ? `Il y a ${g} boîtes de ${e} ${thing}. Combien ${de(thing)} en tout ?` : `Il y a ${g} équipes de ${e} joueurs. Combien de joueurs en tout ?`; ans = g * e; hint = "Plusieurs fois la même quantité : pense à la multiplication."; explanation = `${g} × ${e} = ${ans}.`; }
  else if (op === "share") { const g = int(2, p.groups ?? 6, random), e = int(2, p.each ?? 10, random); prompt = child === "rose" ? `${t.hero} partage ${g * e} ${thing} entre ${g} amies, autant pour chacune. Combien chacune ?` : `Le coach range ${g * e} ballons dans ${g} filets, autant dans chacun. Combien de ballons par filet ?`; ans = e; hint = "Partager en parts égales : pense à la division."; explanation = `${g * e} ÷ ${g} = ${e}.`; }
  else { // deux étapes
    const price = int(2, 9, random), n = int(2, 6, random), paid = Math.ceil((price * n + 1) / 10) * 10;
    prompt = `${t.hero} achète ${n} ${child === "rose" ? "rubans" : "cartes de foot"} à ${price} € l’unité et paie avec ${paid} €. Combien lui rend-on ?`;
    ans = paid - price * n; hint = "Étape 1 : calcule le prix total. Étape 2 : calcule ce qu’on rend."; explanation = `${n} × ${price} = ${n * price} €, puis ${paid} − ${n * price} = ${ans} €.`;
  }
  const euros = op === "twoStep" || !["add", "sub", "compare", "groups", "share"].includes(op);
  return numQ({ prompt, hint, explanation }, ans, { spread: [1, 10, 2], count, random, min: 0, input: p.input, display: euros ? x => fmt(x) + " €" : fmt });
};
G.program = (p, { random, count }) => {
  const a = int(2, 9, random), add = int(1, 9, random), m = int(2, 5, random);
  const order = random() < 0.5;
  const result = order ? (a + add) * m : a * m + add;
  return numQ({ prompt: order ? `Programme : choisis ${a}, ajoute ${add}, puis multiplie par ${m}. Quel résultat ?` : `Programme : choisis ${a}, multiplie par ${m}, puis ajoute ${add}. Quel résultat ?`, hint: "Fais les étapes une par une, dans l’ordre.", explanation: order ? `${a} + ${add} = ${a + add}, puis × ${m} = ${result}.` : `${a} × ${m} = ${a * m}, puis + ${add} = ${result}.` }, result, { spread: [1, add, m], count, random, input: p.input });
};

export const GENERATORS = G;

/** Crée une question pour une compétence donnée ({gen, params}). */
export function createSchoolQuestion(skill, { random = Math.random, child = "leon", step = 0, choices = null } = {}) {
  const fn = G[skill.gen];
  if (!fn) throw Error("Générateur inconnu : " + skill.gen);
  const count = choices ?? skill.choices ?? (child === "rose" ? 3 : 4);
  const question = fn(skill.params ?? {}, { random, child, step, count });
  question.skillId = skill.id;
  return question;
}

/** Vérifie une réponse : choix exact, ou valeur numérique saisie. */
export function checkAnswer(question, given) {
  if (String(given) === question.answer) return true;
  if (question.answerType === "number" && question.numeric !== null) {
    const value = parseAnswer(given);
    return value !== null && Math.abs(value - question.numeric) < 1e-9;
  }
  return String(given) === question.answer;
}
