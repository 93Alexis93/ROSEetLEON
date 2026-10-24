import { el, button, screen, card, replaceApp } from "../ui.js";
import { getState, recordAnswer, recordSession } from "../store.js";
import { speak } from "../voice.js";
import { cheer, gentleOops, successPraise } from "../audio.js";
import { go } from "../router.js";

const BASE_WORDS = [
  "lapin", "maison", "ballon", "soleil", "bateau", "papa", "maman", "vélo",
  "école", "chat", "livre", "rose", "léon", "fusée", "forêt", "gâteau",
  "ami", "lune", "moto", "tomate", "banane", "papillon", "chocolat", "pirate",
  "robot", "cadeau", "pomme", "poire", "poule", "canard", "jardin", "fleur",
  "maîtresse", "cartable", "crayon", "étoile", "nuage", "montagne", "musique",
  "maillot", "tortue", "girafe", "poussin", "savon", "valise",
  "renard", "mouton", "orange", "fromage", "cabane", "bonnet", "camion",
  "domino", "éléphant", "crocodile", "dinosaure", "ananas", "rivière",
  "fenêtre", "chaussette", "chapeau", "canapé", "fourmi", "hibou", "lapinou"
];
const pick = items => items[Math.floor(Math.random() * items.length)];
export function shuffleReadingItems(items, random = Math.random) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
const shuffle = items => shuffleReadingItems(items);
export const READING_SYLLABLES = {
  lapin: "la-pin",
  maison: "mai-son",
  ballon: "bal-lon",
  soleil: "so-leil",
  bateau: "ba-teau",
  papa: "pa-pa",
  maman: "ma-man",
  vélo: "vé-lo",
  école: "é-cole",
  chat: "chat",
  livre: "livre",
  rose: "rose",
  léon: "lé-on",
  fusée: "fu-sée",
  forêt: "fo-rêt",
  gâteau: "gâ-teau",
  ami: "a-mi", lune: "lune", moto: "mo-to", tomate: "to-ma-te",
  banane: "ba-na-ne", papillon: "pa-pi-llon", chocolat: "cho-co-lat",
  pirate: "pi-rate", robot: "ro-bot", cadeau: "ca-deau", pomme: "pomme",
  poire: "poire", poule: "poule", canard: "ca-nard", jardin: "jar-din",
  fleur: "fleur", maîtresse: "maî-tresse", cartable: "car-table",
  crayon: "cra-yon", étoile: "é-toile", nuage: "nu-age",
  montagne: "mon-tagne", musique: "mu-sique", maillot: "mail-lot",
  tortue: "tor-tue", girafe: "gi-rafe", poussin: "pou-ssin",
  savon: "sa-von", valise: "va-lise", renard: "re-nard", mouton: "mou-ton",
  orange: "o-range", fromage: "fro-mage", cabane: "ca-bane", bonnet: "bon-net",
  camion: "ca-mion", domino: "do-mi-no", éléphant: "é-lé-phant",
  crocodile: "cro-co-dile", dinosaure: "di-no-saure", ananas: "a-na-nas",
  rivière: "ri-vière", fenêtre: "fe-nêtre", chaussette: "chaus-sette",
  chapeau: "cha-peau", canapé: "ca-na-pé", fourmi: "four-mi", hibou: "hi-bou",
  lapinou: "la-pi-nou"
};

function bank() {
  const custom = getState().customWords
    .map(entry => typeof entry === "string" ? entry : entry.word)
    .filter(Boolean);
  return [...new Set([
    ...BASE_WORDS,
    ...custom
      .map(word => word.trim().toLocaleLowerCase("fr"))
      .filter(word => /^[a-zà-ÿ-]{2,24}$/i.test(word))
  ])];
}

function question(mode) {
  const words = bank();
  const word = pick(words);
  const others = shuffle(words.filter(item => item !== word)).slice(0, 3);

  if (mode === "flash") {
    return {
      mode,
      prompt: "Écoute le mot, puis retrouve-le.",
      speakText: word,
      answer: word,
      choices: shuffle([word, ...others]),
      hint: "Écoute encore une fois, puis compare les mots proposés.",
      explanation: "Le mot entendu était « " + word + " »."
    };
  }

  if (mode === "mystery") {
    const known = Boolean(READING_SYLLABLES[word]);
    const parts = (READING_SYLLABLES[word] || "").split("-");
    const shown = known
      ? (parts.length > 1 ? parts.slice(0, -1).join("-") + "-…" : word.slice(0, -1) + "…")
      : word.slice(0, Math.max(1, Math.floor(word.length / 2))) + "…";
    return {
      mode,
      prompt: "Quel mot se cache derrière : " + shown + " ?",
      answer: word,
      choices: shuffle([word, ...others]),
      hint: known
        ? "Prononce les syllabes une à une, puis rassemble-les."
        : "Lis le début du mot, puis cherche celui qui correspond.",
      explanation: "Le mot recherché est « " + word + " »."
    };
  }

  if (mode === "rhyme") {
    const pairs = [
      { word: "chat", rhyme: "rat", others: ["lune", "vélo", "pomme"] },
      { word: "maison", rhyme: "ballon", others: ["chat", "fleur", "bateau"] },
      { word: "bateau", rhyme: "chapeau", others: ["lapin", "soleil", "pomme"] },
      { word: "souris", rhyme: "gris", others: ["maison", "bateau", "chat"] },
      { word: "lapin", rhyme: "sapin", others: ["ballon", "lune", "fleur"] },
      { word: "gâteau", rhyme: "râteau", others: ["chat", "vélo", "nuage"] },
      { word: "poule", rhyme: "boule", others: ["soleil", "bateau", "lapin"] },
      { word: "mouton", rhyme: "bouton", others: ["fleur", "maison", "chat"] },
      { word: "camion", rhyme: "avion", others: ["pomme", "lune", "lapin"] },
      { word: "tortue", rhyme: "rue", others: ["bateau", "soleil", "maison"] },
      { word: "chocolat", rhyme: "rat", others: ["pomme", "bateau", "lune"] },
      { word: "fleur", rhyme: "cœur", others: ["lapin", "vélo", "maison"] },
      { word: "poisson", rhyme: "maison", others: ["chat", "lune", "pomme"] },
      { word: "moto", rhyme: "photo", others: ["lapin", "fleur", "soleil"] },
      { word: "canard", rhyme: "placard", others: ["bateau", "chat", "pomme"] },
      { word: "fourmi", rhyme: "ami", others: ["lune", "maison", "vélo"] },
      { word: "sourire", rhyme: "rire", others: ["chat", "ballon", "pomme"] },
      { word: "couronne", rhyme: "personne", others: ["lapin", "soleil", "bateau"] },
      { word: "marron", rhyme: "ballon", others: ["fleur", "chat", "vélo"] },
      { word: "éléphant", rhyme: "enfant", others: ["pomme", "lune", "bateau"] },
      { word: "maillot", rhyme: "soleil", others: ["lapin", "pomme", "bateau"] },
      { word: "canari", rhyme: "souris", others: ["maison", "chat", "fleur"] },
      { word: "chanson", rhyme: "poisson", others: ["vélo", "lune", "pomme"] },
      { word: "lapin", rhyme: "matin", others: ["bateau", "fleur", "robot"] },
      { word: "magie", rhyme: "souris", others: ["maison", "ballon", "chat"] },
      { word: "cœur", rhyme: "fleur", others: ["vélo", "lapin", "bateau"] },
      { word: "pirate", rhyme: "carte", others: ["pomme", "lune", "soleil"] },
      { word: "dragon", rhyme: "bonbon", others: ["chat", "bateau", "fleur"] },
      { word: "étoile", rhyme: "toile", others: ["lapin", "maison", "poisson"] },
      { word: "château", rhyme: "gâteau", others: ["souris", "fleur", "lapin"] }
    ];
    const pair = pick(pairs);
    return {
      mode,
      prompt: "Quel mot rime avec « " + pair.word + " » ?",
      answer: pair.rhyme,
      choices: shuffle([pair.rhyme, ...pair.others]),
      hint: "Écoute la fin des deux mots : est-ce qu’elle sonne pareil ?",
      explanation: "« " + pair.word + " » rime avec « " + pair.rhyme + " » : leurs fins se ressemblent."
    };
  }

  if (mode === "syllables") {
    const words = Object.keys(READING_SYLLABLES);
    const word = pick(words);
    const count = READING_SYLLABLES[word].split("-").length;
    const alternatives = shuffle(["1", "2", "3", "4"].filter(value => Number(value) !== count)).slice(0, 3);
    return {
      mode,
      prompt: "Combien de syllabes entends-tu dans « " + word + " » ?",
      speakText: word,
      answer: String(count),
      choices: shuffle([String(count), ...alternatives]),
      hint: "Dis le mot lentement et frappe doucement dans tes mains à chaque morceau entendu.",
      explanation: "« " + word + " » se découpe ainsi : " + READING_SYLLABLES[word] + " (" + count + " syllabe(s))."
    };
  }

  if (mode === "sentence") {
    const sentences = [
      { text: "Le lapin saute dans le jardin.", q: "De qui parle la phrase ?", answer: "Le lapin", choices: ["Le lapin", "Le bateau", "Le gâteau", "La forêt"] },
      { text: "Maman lit un livre.", q: "Que lit Maman ?", answer: "un livre", choices: ["un vélo", "un livre", "un ballon", "une fusée"] },
      { text: "Le soleil brille.", q: "Qu’est-ce qui brille ?", answer: "Le soleil", choices: ["La maison", "Le soleil", "La forêt", "Le bateau"] },
      { text: "Rose roule à vélo.", q: "Comment Rose se déplace-t-elle ?", answer: "à vélo", choices: ["à vélo", "à l’école", "dans l’eau", "en fusée"] },
      { text: "Le chat dort sur le canapé.", q: "Où dort le chat ?", answer: "sur le canapé", choices: ["sur le canapé", "dans le jardin", "dans le bateau", "à l’école"] },
      { text: "Lina plante une graine dans un pot.", q: "Que plante Lina ?", answer: "une graine", choices: ["une graine", "une fleur coupée", "un ballon", "un crayon"] },
      { text: "Noé met son manteau car il fait froid.", q: "Pourquoi Noé met-il son manteau ?", answer: "car il fait froid", choices: ["car il fait froid", "car il a faim", "car il pleut du chocolat", "car il va dormir"] },
      { text: "Dans la mare, trois canards nagent.", q: "Combien de canards nagent ?", answer: "trois", choices: ["deux", "trois", "quatre", "cinq"] },
      { text: "Papa prépare une soupe avec des carottes.", q: "Avec quoi Papa prépare-t-il la soupe ?", answer: "des carottes", choices: ["des carottes", "des pommes", "des crayons", "des fleurs"] },
      { text: "Mila range ses crayons dans la trousse.", q: "Où Mila range-t-elle ses crayons ?", answer: "dans la trousse", choices: ["dans la trousse", "dans le frigo", "sous la pluie", "dans la mare"] },
      { text: "Le renard avance doucement près du poulailler. Il entend un bruit et se cache derrière un buisson.", q: "Où le renard se cache-t-il ?", answer: "derrière un buisson", choices: ["derrière un buisson", "dans la maison", "sous la table", "dans la rivière"] },
      { text: "À la bibliothèque, Zoé choisit un album sur les dinosaures. Elle s’installe dans un fauteuil pour le regarder.", q: "Quel livre Zoé choisit-elle ?", answer: "un album sur les dinosaures", choices: ["un album sur les dinosaures", "un livre de cuisine", "un cahier de calcul", "une carte au trésor"] },
      { text: "Le jardinier arrose les salades tôt le matin. À midi, la terre est encore humide.", q: "Que fait le jardinier le matin ?", answer: "Il arrose les salades", choices: ["Il arrose les salades", "Il ramasse la neige", "Il peint la clôture", "Il prépare un bateau"] },
      { text: "Lina fabrique un moulinet avec du papier jaune. Dehors, le vent le fait tourner.", q: "Que fait le vent ?", answer: "Il fait tourner le moulinet", choices: ["Il fait tourner le moulinet", "Il gonfle un ballon rouge", "Il ferme le livre", "Il éteint la lampe"] },
      { text: "Pour le goûter, Sami coupe une pomme en quatre morceaux et partage avec ses amis.", q: "En combien de morceaux Sami coupe-t-il la pomme ?", answer: "Quatre", choices: ["Deux", "Trois", "Quatre", "Cinq"] },
      { text: "Lila met deux graines dans un pot et une autre dans un petit bac. Elle arrose les deux récipients.", q: "Combien de graines Lila met-elle dans le pot ?", answer: "Deux", choices: ["Une", "Deux", "Trois", "Quatre"] },
      { text: "Le facteur dépose une lettre dans la boîte bleue. Il garde le colis pour la maison voisine.", q: "Où le facteur dépose-t-il la lettre ?", answer: "Dans la boîte bleue", choices: ["Dans la boîte bleue", "Sous un arbre", "Dans le cartable", "Sur la voiture"] },
      { text: "Au bord de l’étang, Zoé voit une grenouille sauter sur une pierre. Puis l’animal plonge dans l’eau.", q: "Sur quoi la grenouille saute-t-elle ?", answer: "Sur une pierre", choices: ["Sur une pierre", "Sur un bateau", "Sur une fleur", "Sur un banc"] },
      { text: "Noam construit une tour avec six cubes rouges et deux cubes jaunes. Il pose les cubes jaunes tout en haut.", q: "De quelle couleur sont les cubes du haut ?", answer: "Jaunes", choices: ["Jaunes", "Rouges", "Verts", "Bleus"] },
      { text: "Le mercredi, Aya va à la médiathèque avec son grand-père. Elle choisit un livre sur les animaux marins.", q: "Sur quel sujet est le livre d’Aya ?", answer: "Les animaux marins", choices: ["Les animaux marins", "Les voitures anciennes", "Les recettes", "Les planètes"] },
      { text: "Un écureuil cache une noisette sous les feuilles. Il s’éloigne, puis revient la chercher quand il a faim.", q: "Où l’écureuil cache-t-il la noisette ?", answer: "Sous les feuilles", choices: ["Sous les feuilles", "Dans une chaussure", "Dans la rivière", "Sur le toit"] },
      { text: "Pour préparer le pique-nique, Malo remplit sa gourde et glisse une serviette dans son sac. Il n’oublie pas les pommes.", q: "Que remplit Malo ?", answer: "Sa gourde", choices: ["Sa gourde", "Son sac", "Une serviette", "Une boîte"] },
      { text: "Le petit train s’arrête à la gare. Des voyageurs descendent tandis que d’autres montent avec leurs valises.", q: "Où le train s’arrête-t-il ?", answer: "À la gare", choices: ["À la gare", "À la plage", "Dans une forêt", "Dans une école"] },
      { text: "Dans la cuisine, Inaya mélange la farine, le lait et un œuf. Son papa fait cuire les crêpes dans une poêle.", q: "Qui fait cuire les crêpes ?", answer: "Son papa", choices: ["Son papa", "Inaya seule", "Le voisin", "Le chat"] }
    ];
    const sentence = pick(sentences);
    return {
      mode,
      prompt: "Lis : « " + sentence.text + " »\n" + sentence.q,
      answer: sentence.answer,
      choices: shuffle(sentence.choices),
      hint: "Relis la phrase et cherche les mots qui répondent à la question.",
      explanation: "La bonne réponse est « " + sentence.answer + " »."
    };
  }

  if (mode === "text") {
    const texts = [
      { text: "Léon a un ballon rouge. Il joue dans le jardin.", q: "Qu’a Léon ?", a: "Un ballon rouge", c: ["Un ballon rouge", "Un vélo bleu", "Un livre", "Un gâteau"] },
      { text: "Rose voit un petit chat. Le chat dort sur le tapis.", q: "Où dort le chat ?", a: "Sur le tapis", c: ["Dans le jardin", "Sur le tapis", "Dans la classe", "Dans le bateau"] },
      { text: "Le matin, Mila va à l’école avec son sac.", q: "Où va Mila ?", a: "À l’école", c: ["Au parc", "À l’école", "À la piscine", "À la forêt"] },
      { text: "Sam a planté une graine. Il l’arrose chaque matin. Une petite pousse apparaît.", q: "Que fait Sam chaque matin ?", a: "Il arrose la graine", c: ["Il arrose la graine", "Il peint le mur", "Il range ses chaussures", "Il nourrit un poisson"] },
      { text: "Nina prépare son sac pour la piscine. Elle prend une serviette et un bonnet. Puis elle rejoint son papa.", q: "Que prend Nina ?", a: "Une serviette et un bonnet", c: ["Une serviette et un bonnet", "Un ballon et un livre", "Un manteau et des bottes", "Une poêle et une cuillère"] },
      { text: "Le vent souffle fort. Les feuilles s’envolent et roulent sur le chemin. Hugo ferme son blouson.", q: "Que font les feuilles ?", a: "Elles s’envolent", c: ["Elles s’envolent", "Elles chantent", "Elles nagent", "Elles deviennent des pommes"] },
      { text: "Au marché, Mamie choisit trois pommes et deux poires. Elle les met dans son panier.", q: "Combien de pommes Mamie choisit-elle ?", a: "Trois", c: ["Deux", "Trois", "Quatre", "Cinq"] },
      { text: "Léo entend un bruit dans la cuisine. C’est le chat qui pousse sa gamelle vide. Léo lui donne ses croquettes.", q: "Pourquoi le chat pousse-t-il sa gamelle ?", a: "Elle est vide", c: ["Elle est vide", "Il veut sortir en fusée", "Elle est pleine d’eau", "Il cherche un crayon"] },
      { text: "Après la pluie, Inès observe un escargot près du pot de fleurs. Elle le regarde sans le toucher, puis appelle son frère.", q: "Quel animal Inès observe-t-elle ?", a: "Un escargot", c: ["Un escargot", "Un papillon", "Un canard", "Un lapin"] },
      { text: "Tom met ses bottes et son imperméable. Il sort avec sa sœur pour sauter dans les flaques.", q: "Pourquoi Tom met-il ses bottes ?", a: "Pour sortir sous la pluie", c: ["Pour aller dormir", "Pour sortir sous la pluie", "Pour faire un gâteau", "Pour nager dans la mer"] },
      { text: "Léo construit une cabane avec des coussins. Son chat s’installe à l’intérieur pendant qu’il lit une histoire.", q: "Qui s’installe dans la cabane ?", a: "Son chat", c: ["Son chat", "Son voisin", "Un renard", "Un poisson"] },
      { text: "La classe part observer les arbres du parc. Les enfants dessinent une feuille, puis la rendent à l’arbre.", q: "Que dessinent les enfants ?", a: "Une feuille", c: ["Une feuille", "Un bateau", "Une chaussure", "Un gâteau"] },
      { text: "Maya prépare une salade de fruits avec une banane, une pomme et deux poires. Elle mélange le tout dans un grand saladier.", q: "Combien de poires utilise Maya ?", a: "Deux", c: ["Une", "Deux", "Trois", "Quatre"] },
      { text: "Le petit bateau quitte le port quand le soleil se lève. Un marin regarde les mouettes voler au-dessus de l’eau.", q: "Que regarde le marin ?", a: "Les mouettes", c: ["Les mouettes", "Les voitures", "Les écureuils", "Les papillons dans la maison"] },
      { text: "Avant de dormir, Inès choisit son pyjama, pose son livre sur la table de nuit et dit bonne nuit à son ours en peluche.", q: "Où Inès pose-t-elle son livre ?", a: "Sur la table de nuit", c: ["Sur la table de nuit", "Dans le jardin", "Dans le four", "Sous la baignoire"] },
      { text: "Dans la forêt, Émile suit un petit sentier. Il entend un pic-vert taper sur un tronc et s’arrête pour écouter.", q: "Quel oiseau Émile entend-il ?", a: "Un pic-vert", c: ["Un pic-vert", "Une mouette", "Un canard", "Un hibou qui chante"] },
      { text: "Mina prépare trois enveloppes pour ses amis. Elle écrit les prénoms, colle un timbre sur chacune et les confie à sa maman.", q: "Combien d’enveloppes Mina prépare-t-elle ?", a: "Trois", c: ["Une", "Deux", "Trois", "Cinq"] },
      { text: "La neige recouvre le jardin. Sami enfile ses gants et construit une petite boule qu’il pose sur le bonhomme de neige.", q: "Où Sami pose-t-il la boule ?", a: "Sur le bonhomme de neige", c: ["Sur le bonhomme de neige", "Dans son sac", "Sur la fenêtre", "Sous son lit"] },
      { text: "Le jardin de Nora attire les abeilles. Elles visitent les fleurs pour récolter du nectar, puis repartent vers leur ruche.", q: "Que viennent chercher les abeilles dans les fleurs ?", a: "Du nectar", c: ["Du nectar", "Des cailloux", "Des feuilles mortes", "De la neige"] },
      { text: "À la ferme, Jules donne du foin aux chèvres. Il remplit ensuite l’abreuvoir avec de l’eau propre.", q: "Que met Jules dans l’abreuvoir ?", a: "De l’eau propre", c: ["De l’eau propre", "Du foin", "Des pommes de pin", "Du lait chocolaté"] },
      { text: "Le soir, le ciel devient orange puis violet. Lina observe les premières étoiles depuis la fenêtre de sa chambre.", q: "D’où Lina regarde-t-elle les étoiles ?", a: "Depuis sa fenêtre", c: ["Depuis sa fenêtre", "Depuis un bateau", "Depuis la cave", "Depuis la cuisine de l’école"] },
      { text: "Pour aider son voisin, Adam porte les journaux jusqu’à la porte. Le voisin le remercie et lui montre les tulipes du jardin.", q: "Que porte Adam jusqu’à la porte ?", a: "Les journaux", c: ["Les journaux", "Des assiettes", "Des jouets", "Des bottes"] },
      { text: "Au musée, les enfants regardent un squelette de dinosaure. La guide explique que certains dinosaures étaient herbivores.", q: "Que regardent les enfants ?", a: "Un squelette de dinosaure", c: ["Un squelette de dinosaure", "Un vrai dragon", "Un bateau miniature", "Un nid d’abeilles"] },
      { text: "Le jardinier plante des bulbes à l’automne. Au printemps, des tulipes colorées poussent dans les massifs.", q: "Quand les tulipes poussent-elles ?", a: "Au printemps", c: ["Au printemps", "En plein hiver", "Au milieu de la nuit", "Avant de planter les bulbes"] }
    ];
    const text = pick(texts);
    return {
      mode,
      prompt: text.text + "\n\n" + text.q,
      answer: text.a,
      choices: shuffle(text.c),
      hint: "Cherche dans le petit texte les mots qui répondent à la question.",
      explanation: "Le texte nous indique : " + text.a + "."
    };
  }

  throw new Error("Format de lecture inconnu : " + mode);
}

// Point d’entrée pur pour les tests automatisés du contenu.
export function createReadingQuestion(mode) {
  return question(mode);
}

export function readingMenu() {
  document.body.className = "theme-leon";
  const content = el("div", { class: "stack" });
  content.append(el("p", {
    class: "lead",
    text: "Des petits jeux de lecture pour lire à ton rythme. Ici, pas de note ni de chronomètre stressant."
  }));

  const modes = [
    ["flash", "⚡ Mots-éclairs", "Reconnaître un mot rapidement"],
    ["mystery", "🔎 Mots-mystères", "Assembler les syllabes"],
    ["sentence", "💬 Phrases à comprendre", "Lire une phrase et trouver l’information"],
    ["text", "📖 Mini-textes", "Lire quelques lignes et comprendre"],
    ["rhyme", "🎵 Chasse aux rimes", "Écouter les sons à la fin des mots"],
    ["syllables", "👏 Syllabes en rythme", "Découper les mots en morceaux à l’oral"]
  ];
  modes.forEach(([id, label, description]) => {
    content.append(card([
      el("h2", { text: label }),
      el("p", { class: "small", text: description }),
      button("Commencer", () => startReading(id), "button-primary")
    ]));
  });
  content.append(
    button("⌂ Accueil", () => go("home"), "icon-button"),
    button("↩ Autres défis de Léon", () => go("leon"), "button-soft")
  );
  replaceApp(screen("Lecture avec Léon", content, {
    eyebrow: "Univers ballon",
    home: () => go("home")
  }));
}

function startReading(mode) {
  let round = 0;
  let score = 0;
  let hintCount = 0;
  let questionHadError = false;
  let currentQuestion;
  const seenQuestions = new Set();
  const labels = {
    flash: "Mots-éclairs",
    mystery: "Mots-mystères",
    sentence: "Phrases à comprendre",
    text: "Mini-textes",
    rhyme: "Chasse aux rimes",
    syllables: "Syllabes en rythme"
  };

  const generate = () => {
    let candidate, attempts = 0;
    do { candidate = question(mode); attempts++; }
    while (seenQuestions.has(candidate.prompt) && attempts < 100);
    currentQuestion = candidate;
    seenQuestions.add(currentQuestion.prompt);
    hintCount = 0;
    questionHadError = false;
  };

  const finish = () => {
    recordSession("leon");
    const content = card([
      el("p", { class: "prompt", text: "🌟 Bravo pour tes efforts !" }),
      el("p", { class: "lead", text: "Tu as terminé ce petit moment de lecture." }),
      el("p", {
        class: "lead",
        text: "Tu as trouvé " + score + " réponse(s) du premier coup sur " + round +
          ". Chaque essai t’aide à progresser."
      }),
      el("p", {
        class: "small",
        text: "On peut recommencer un autre jour : pas besoin d’aller vite."
      }),
      button("Autres jeux de lecture", readingMenu, "button-primary"),
      button("Autres défis de Léon", () => go("leon"), "button-soft")
    ]);
    replaceApp(screen("Bien joué !", content, {
      eyebrow: "Lecture",
      home: () => go("home")
    }));
  };

  const render = () => {
    const content = card([]);
    content.append(
      el("p", { class: "small", text: "Jeu " + (round + 1) + " sur 5" }),
      el("div", { class: "progress-track" },
        el("div", { class: "progress-fill", style: "width:" + (round / 5 * 100) + "%" })
      ),
      el("p", {
        class: "lead",
        text: "Prends ton temps. Tu peux écouter et demander un indice."
      }),
      el("div", { class: "prompt", text: currentQuestion.prompt })
    );

    const answers = el("div", { class: "answer-grid" });
    currentQuestion.choices.forEach(choice => {
      answers.append(button(choice, () => answer(choice), "button-soft"));
    });
    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });
    content.append(
      answers,
      feedback,
      el("div", { class: "button-row" }, [
        button("🔊 Écouter", () => speak(
          currentQuestion.speakText || currentQuestion.prompt,
          getState().settings.voice
        ), "button-soft"),
        button("💡 Indice", () => {
          hintCount++;
          feedback.textContent = hintCount === 1
            ? currentQuestion.hint
            : currentQuestion.explanation;
        }, "button-soft")
      ]),
      button("⌂ Accueil", () => go("home"), "icon-button"),
      button("↩ Menu lecture", readingMenu, "button-soft")
    );

    replaceApp(screen(labels[mode], content, {
      eyebrow: "Lecture sans pression",
      home: () => go("home")
    }));
    speak(currentQuestion.speakText || currentQuestion.prompt, getState().settings.voice);
  };

  const answer = choice => {
    const correct = String(choice) === String(currentQuestion.answer);
    recordAnswer("leon", correct);
    const feedback = document.querySelector(".feedback");
    if (correct) {
      cheer(getState().settings.sounds);successPraise(child,getState().settings.voice);
      if (!questionHadError) score++;
      const feedbackText = ["Bravo, tu as pris le temps de réfléchir !", "Oui, tu as bien compris !", "Super lecture, tu as trouvé !", "Bien joué, tu progresses à chaque question !", "Exactement, c’est la bonne réponse !"][Math.floor(Math.random() * 5)];
      if (feedback) feedback.textContent = feedbackText;
      document.querySelectorAll(".answer-grid button").forEach(item => { item.disabled = true; });
      const next = button(round + 1 >= 5 ? "Terminer" : "Question suivante", () => {
        round++;
        if (round >= 5) finish();
        else { generate(); render(); }
      }, "button-primary");
      feedback?.after(next);
    } else {
      gentleOops(getState().settings.sounds);
      questionHadError = true;
      if (feedback) {
        feedback.textContent = ["Presque ! Relis tranquillement et essaie encore. Tu peux demander un indice.", "Bien tenté ! Relis le texte et cherche un petit indice.", "Pas encore, mais tu peux réfléchir et réessayer.", "On reprend calmement : la réponse se cache dans ce que tu as lu.", "Tu peux écouter ou demander un indice avant de retenter."][Math.floor(Math.random() * 5)];
      }
    }
  };

  generate();
  render();
}
